import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload, PayloadRequest } from 'payload'
import { postgresURL } from '../config.ts'
import { mediaPool } from '../media/model.ts'

export type DatabaseClient = Pick<ReturnType<typeof mediaPool>, 'query'>

export async function session(req: PayloadRequest) {
  const id = await req.transactionID
  if (id == null) return
  return (req.payload.db as typeof req.payload.db & Pick<PostgresAdapter, 'sessions'>).sessions[String(id)]?.db
}

export async function activeUnit(req: PayloadRequest, id: number) {
  const transaction = await session(req)
  const result = transaction
    ? await transaction.execute(sql`SELECT ativo FROM regionais WHERE id = ${id}`)
    : await mediaPool(req.payload).query('SELECT ativo FROM regionais WHERE id = $1', [id])
  return result.rows[0]?.ativo === true
}

export async function assertOperational(client: DatabaseClient) {
  const { rows: [state] } = await client.query('SELECT bloqueado FROM poc_recovery_guard WHERE id = 1')
  if (state?.bloqueado !== false) throw new Error('Banco em quarentena de recuperação.')
}

const tableFields = {
  users: "'perfil','regional_id','ativo'",
  regionais: "'ativo','tipo','ordem','capa_midia_id'",
  membros: "'ativo','regional_id'",
  agenda: "'ativo','regional_id','_status','capa_midia_id'",
  eventos: "'ativo','regional_id','compromisso_id','capa_midia_id','video_midia_id'",
  diretoria: "'ativo','membro_id','capa_midia_id'",
  midias: "'publicado','fase','posterior'",
  publicacoes: "'estado','tentativas','erro'",
}

export async function prepareSecurity(payload: Payload) {
  const client = await mediaPool(payload).connect()
  try {
    await client.query('BEGIN')
    await client.query(`
      CREATE TABLE IF NOT EXISTS poc_recovery_guard (
        id integer PRIMARY KEY CHECK (id = 1), bloqueado boolean NOT NULL
      );
      INSERT INTO poc_recovery_guard VALUES (1, false) ON CONFLICT DO NOTHING;
      CREATE TABLE IF NOT EXISTS poc_security_intents (
        id uuid PRIMARY KEY, saida uuid NOT NULL UNIQUE, ambiente text NOT NULL,
        entidade text NOT NULL, registro integer NOT NULL,
        linhagem uuid, revisao bigint, release_observada uuid,
        estado text NOT NULL DEFAULT 'pendente' CHECK (estado IN ('pendente','concluida','abortada'))
      );
      CREATE UNIQUE INDEX IF NOT EXISTS poc_security_pending ON poc_security_intents (ambiente)
        WHERE estado = 'pendente';
      CREATE TABLE IF NOT EXISTS poc_security_effects (
        id uuid PRIMARY KEY, entidade text NOT NULL, registro integer NOT NULL, xid xid8 NOT NULL,
        aplicado boolean NOT NULL DEFAULT false
      );
      CREATE OR REPLACE FUNCTION poc_require_security_barrier() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        before_row jsonb;
        after_row jsonb;
        op uuid := nullif(current_setting('poc.security_id', true), '')::uuid;
      BEGIN
        IF TG_OP <> 'UPDATE' THEN
          RAISE EXCEPTION 'Registros de autoridade exigem inativação coordenada.' USING ERRCODE = '42501';
        END IF;
        before_row := to_jsonb(OLD);
        after_row := to_jsonb(NEW);
        IF NOT (
          (TG_TABLE_NAME = 'users' AND (before_row->'perfil' IS DISTINCT FROM after_row->'perfil'
            OR before_row->'regional_id' IS DISTINCT FROM after_row->'regional_id'))
          OR (TG_TABLE_NAME IN ('users', 'regionais') AND before_row->>'ativo' = 'true' AND after_row->>'ativo' = 'false')
          OR (TG_TABLE_NAME = 'membros' AND before_row->'regional_id' IS DISTINCT FROM after_row->'regional_id')
          OR (TG_TABLE_NAME = 'midias' AND before_row->>'publicado' = 'true' AND after_row->>'publicado' = 'false')
        ) THEN RETURN NEW; END IF;
        UPDATE poc_security_effects SET aplicado = true WHERE id = op AND entidade = TG_TABLE_NAME
          AND registro = (after_row->>'id')::integer AND xid = pg_current_xact_id() AND NOT aplicado;
        IF NOT FOUND THEN RAISE EXCEPTION 'Mudança de segurança sem barreira confirmada.' USING ERRCODE = '42501'; END IF;
        RETURN NEW;
      END
      $$;
      CREATE TABLE IF NOT EXISTS poc_audit (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(), instante timestamptz NOT NULL DEFAULT clock_timestamp(),
        operador integer, processo text, ambiente text NOT NULL, regional integer,
        operacao text NOT NULL, entidade text NOT NULL, registro text,
        anterior jsonb, novo jsonb, resultado text NOT NULL,
        correlacao uuid NOT NULL, janela timestamptz,
        UNIQUE (ambiente, entidade, janela)
      );
      CREATE INDEX IF NOT EXISTS poc_audit_escopo ON poc_audit (ambiente, regional, instante DESC);
      CREATE OR REPLACE FUNCTION poc_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
      DECLARE
        prev jsonb := CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) END;
        next jsonb := to_jsonb(NEW);
        before_values jsonb;
        after_values jsonb;
        scope integer;
        operation text := lower(TG_OP);
        outcome text := 'sucesso';
        principal integer := nullif(current_setting('poc.operador', true), '')::integer;
      BEGIN
        SELECT jsonb_object_agg(key, prev->key), jsonb_object_agg(key, next->key)
          INTO before_values, after_values FROM unnest(TG_ARGV) AS key;
        IF TG_TABLE_NAME = 'users' AND TG_OP = 'UPDATE' AND before_values = after_values
            AND principal IS NULL THEN RETURN NEW; END IF;
        IF TG_TABLE_NAME = 'midias' AND TG_OP = 'UPDATE' THEN
          IF (prev->'publicado') = (next->'publicado') THEN RETURN NEW; END IF;
          operation := CASE WHEN (next->>'publicado')::boolean THEN 'aprovar' ELSE 'revogar' END;
        END IF;
        IF TG_TABLE_NAME = 'publicacoes' THEN
          IF TG_OP = 'UPDATE' AND before_values = after_values THEN RETURN NEW; END IF;
          operation := CASE WHEN TG_OP = 'INSERT' THEN next->'pedido'->>'acao'
            WHEN prev->>'estado' = 'falhou' AND next->>'estado' = 'pendente' THEN 'repetir'
            ELSE 'resultado' END;
          outcome := CASE WHEN next->>'estado' = 'falhou' THEN 'falha' ELSE 'sucesso' END;
        END IF;
        scope := CASE WHEN TG_TABLE_NAME = 'regionais' THEN (next->>'id')::integer
          WHEN TG_TABLE_NAME IN ('diretoria','users') THEN NULL
          WHEN TG_TABLE_NAME = 'publicacoes' THEN (next->>'escopo')::integer
          WHEN TG_OP = 'INSERT' OR (prev->>'regional_id') IS NOT DISTINCT FROM (next->>'regional_id')
          THEN (next->>'regional_id')::integer END;
        IF TG_TABLE_NAME = 'publicacoes' AND TG_OP = 'INSERT' THEN
          principal := coalesce(principal, (next->>'operador')::integer);
        END IF;
        operation := coalesce(nullif(current_setting('poc.operacao', true), ''), operation);
        INSERT INTO poc_audit (operador, processo, ambiente, regional, operacao, entidade, registro,
                              anterior, novo, resultado, correlacao)
        VALUES (principal, CASE WHEN principal IS NULL THEN 'sistema' END,
          coalesce(next->>'ambiente', nullif(current_setting('poc.ambiente', true), ''), 'dev'),
          scope, operation, TG_TABLE_NAME, next->>'id',
          CASE WHEN TG_OP = 'UPDATE' THEN before_values END, after_values, outcome,
          coalesce(nullif(current_setting('poc.correlacao', true), '')::uuid, gen_random_uuid()));
        RETURN NEW;
      END
      $$;
      CREATE OR REPLACE FUNCTION poc_keep_audit() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN
        RAISE EXCEPTION 'Auditoria somente para acréscimo.';
      END
      $$;
      DROP TRIGGER IF EXISTS poc_keep_audit ON poc_audit;
      CREATE TRIGGER poc_keep_audit BEFORE UPDATE OR DELETE OR TRUNCATE ON poc_audit
        FOR EACH STATEMENT EXECUTE FUNCTION poc_keep_audit();
    `)
    for (const table of ['users', 'regionais', 'membros', 'midias']) {
      await client.query(`
        DROP TRIGGER IF EXISTS poc_security_barrier ON ${table};
        CREATE TRIGGER poc_security_barrier BEFORE UPDATE ON ${table}
          FOR EACH ROW EXECUTE FUNCTION poc_require_security_barrier();
        DROP TRIGGER IF EXISTS poc_security_no_removal ON ${table};
        CREATE TRIGGER poc_security_no_removal BEFORE DELETE OR TRUNCATE ON ${table}
          FOR EACH STATEMENT EXECUTE FUNCTION poc_require_security_barrier();
      `)
    }
    for (const [table, fields] of Object.entries(tableFields)) {
      await client.query(`
        DROP TRIGGER IF EXISTS poc_audit ON ${table};
        CREATE TRIGGER poc_audit AFTER INSERT OR UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION poc_audit_mutation(${fields});
      `)
    }
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export function requireDirectConnection() {
  const database = postgresURL(process.env.DATABASE_URL)
  if (database.hostname.includes('-pooler') || process.env.POC_PG_CONNECTION_MODE === 'transaction' ||
      database.searchParams.get('pgbouncer') === 'true') {
    throw new Error('Esta operação exige uma conexão PostgreSQL direta.')
  }
}
