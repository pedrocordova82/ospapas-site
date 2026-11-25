import { randomUUID } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { APIError, type Payload, type PayloadRequest } from 'payload'
import { actor, relationID } from '../access/policies.ts'
import { mediaPool } from '../media/model.ts'
import { jsonBytes, type Environment } from '../publication/contract.ts'
import { publicationEnvironment, ReleaseStore } from '../publication/store.ts'
import { assertLatestEvidence, settleEvidence } from '../publication/evidence.ts'
import { assertOperational, session, type DatabaseClient } from './database.ts'
import { RecoveryStorage } from './recovery-storage.ts'

type Target = { entidade: 'users' | 'regionais' | 'membros' | 'midias'; registro: number }
type Intent = Target & { id: string; saida: string; ambiente: Environment }
type Transaction = NonNullable<Awaited<ReturnType<typeof session>>>
type Registered = { intent: Intent; armed: boolean }
const pending = () => new APIError('Mudança de segurança pendente de reconciliação.', 503)
const transactions = new WeakMap<Payload, Map<string, Registered>>()

export function conflictingMutation(collection: string, data: Record<string, unknown>, original: Record<string, unknown> | undefined): Target | undefined {
  const registro = relationID(original?.id)
  if (!original || !registro) return
  const assignment = Object.hasOwn(data, 'regional') && relationID(data.regional) !== relationID(original.regional)
  const inactive = data.ativo === false && original.ativo === true
  if (collection === 'users' && (inactive || assignment || (data.perfil != null && data.perfil !== original.perfil))) {
    return { entidade: collection, registro }
  }
  if ((collection === 'regionais' && inactive) || (collection === 'membros' && assignment) ||
      (collection === 'midias' && data.publicado === false && original.publicado === true)) {
    return { entidade: collection, registro }
  }
}

export async function securitySuspended(client: DatabaseClient, environment: Environment) {
  const { rows: [active] } = await client.query(
    "SELECT id FROM poc_security_intents WHERE ambiente = $1 AND estado = 'pendente'", [environment],
  )
  return Boolean(active)
}

export async function checkSecurity(req: PayloadRequest) {
  const environment = publicationEnvironment()
  const id = await req.transactionID
  const transaction = await session(req)
  const own = id == null ? undefined : transactions.get(req.payload)?.get(String(id))
  if (own) return
  const suspended = transaction
    ? (await transaction.execute(sql`SELECT id FROM poc_security_intents
        WHERE ambiente = ${environment} AND estado = 'pendente'`)).rows.length > 0
    : await securitySuspended(mediaPool(req.payload), environment)
  if (suspended) throw pending()
}

async function register(client: DatabaseClient, intent: Intent) {
  const result = await client.query(`INSERT INTO poc_security_intents (id, saida, ambiente, entidade, registro)
    VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING`, [
    intent.id, intent.saida, intent.ambiente, intent.entidade, intent.registro,
  ])
  if (!result.rowCount) throw new APIError('Outra mudança de segurança está em andamento.', 409)
}

async function findBarrier(store: ReleaseStore, intent: Intent, confirmOwner: () => Promise<void>) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = await store.manifest()
    if (!current?.value.linhagem || current.value.revisao === undefined) throw pending()
    if (current.value.bloqueio === intent.id || current.value.geracao === intent.saida) return current
    if (current.value.bloqueio) throw pending()
    await confirmOwner()
    try {
      await store.activate(jsonBytes({
        ...current.value, geracao: intent.id, revisao: current.value.revisao + 1, bloqueio: intent.id,
      }), current.etag)
    } catch (error) {
      if (error instanceof Error && ['PreconditionFailed', 'ConditionalRequestConflict'].includes(error.name)) continue
      throw error
    }
    const observed = await store.manifest()
    if (observed?.value.bloqueio !== intent.id) throw pending()
    return observed
  }
  throw pending()
}

async function stage(transaction: Transaction, payload: Payload, intent: Intent, entry: Registered) {
  await transaction.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${intent.id}, 75021))`)
  await register(mediaPool(payload), intent)
  await establish(payload, intent, entry, async () => {
    await transaction.execute(sql`SELECT 1`)
  })
  await transaction.execute(sql`
    INSERT INTO poc_security_effects (id, entidade, registro, xid)
      VALUES (${intent.id}, ${intent.entidade}, ${intent.registro}, pg_current_xact_id())
  `)
  await transaction.execute(sql`SELECT set_config('poc.security_id', ${intent.id}, true)`)
}

async function establish(payload: Payload, intent: Intent, entry: Registered, ensureTransaction: () => Promise<void>) {
  const store = new ReleaseStore(intent.ambiente)
  const fenced = await findBarrier(store, intent, async () => {
    await ensureTransaction()
    const { rows } = await mediaPool(payload).query(
      "SELECT id FROM poc_security_intents WHERE id = $1 AND estado = 'pendente'", [intent.id],
    )
    if (!rows.length) throw pending()
  })
  if (fenced.value.bloqueio !== intent.id) throw pending()
  const observed = fenced.value.ativa
  const pool = mediaPool(payload)
  const vault = new RecoveryStorage(intent.ambiente)
  try {
    if (observed) {
      const { rows } = await pool.query(
        "SELECT id FROM publicacoes WHERE ambiente = $1 AND release = $2 AND pedido->>'acao' = 'revogar'",
        [intent.ambiente, observed.id],
      )
      if (rows.length) {
        await settleEvidence(vault, fenced, observed.id, true)
      }
    }
    await assertLatestEvidence(vault, fenced.value)
  } finally {
    vault.close()
  }
  await pool.query(`UPDATE poc_security_intents SET linhagem = $2, revisao = $3, release_observada = $4
    WHERE id = $1 AND estado = 'pendente'`, [intent.id, fenced.value.linhagem, fenced.value.revisao, observed?.id ?? null])
  await ensureTransaction()
  entry.armed = true
}

export async function coordinatePayload(req: PayloadRequest, target: Target) {
  if (actor(req)?.perfil !== 'geral') throw new APIError('Mudança de segurança exige administrador geral.', 403)
  const transaction = await session(req)
  const id = await req.transactionID
  const entries = transactions.get(req.payload)
  if (!transaction || id == null || !entries) throw pending()
  if (entries.has(String(id))) throw new APIError('Altere um registro de segurança por transação.', 409)
  const intent: Intent = { ...target, id: randomUUID(), saida: randomUUID(), ambiente: publicationEnvironment() }
  const entry = { intent, armed: false }
  entries.set(String(id), entry)
  try {
    await stage(transaction, req.payload, intent, entry)
  } catch (error) {
    if (error instanceof APIError && error.status === 409) throw error
    throw pending()
  }
}

export async function coordinateSQL(client: DatabaseClient, payload: Payload, target: Target) {
  const intent: Intent = { ...target, id: randomUUID(), saida: randomUUID(), ambiente: publicationEnvironment() }
  const entry = { intent, armed: false }
  await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1, 75021))', [intent.id])
  await register(mediaPool(payload), intent)
  try {
    await establish(payload, intent, entry, async () => { await client.query('SELECT 1') })
    await client.query(`INSERT INTO poc_security_effects (id, entidade, registro, xid)
      VALUES ($1, $2, $3, pg_current_xact_id())`, [intent.id, intent.entidade, intent.registro])
    await client.query("SELECT set_config('poc.security_id', $1, true)", [intent.id])
  } catch {
    throw pending()
  }
  return intent.id
}

export async function reconcileSecurity(payload: Payload, id: string, outcome: 'commit' | 'rollback' | 'inspect') {
  const client = await mediaPool(payload).connect()
  try {
    await client.query('BEGIN')
    await assertOperational(client)
    const { rows: [lock] } = await client.query(
      'SELECT pg_try_advisory_xact_lock(hashtextextended($1, 75021)) AS acquired', [id],
    )
    if (!lock.acquired) throw pending()
    const { rows: [intent] } = await client.query<Intent & { estado: string; aplicado: boolean; linhagem: string | null }>(`
      SELECT i.*, coalesce(e.aplicado, false) AS aplicado
      FROM poc_security_intents i LEFT JOIN poc_security_effects e ON e.id = i.id
      WHERE i.id = $1 AND i.ambiente = $2 FOR UPDATE OF i
    `, [id, publicationEnvironment()])
    if (!intent) throw new APIError('Intenção de segurança inexistente.', 404)
    if (intent.estado !== 'pendente') {
      if (outcome === 'commit' && intent.estado !== 'concluida') throw pending()
      await client.query('COMMIT')
      return intent.estado
    }
    if ((outcome === 'commit' && !intent.aplicado) || (outcome === 'rollback' && intent.aplicado)) throw pending()
    const store = new ReleaseStore(intent.ambiente)
    const fence = await findBarrier(store, intent, async () => { await client.query('SELECT 1') })
    if (intent.linhagem && fence.value.linhagem !== intent.linhagem) throw pending()
    const vault = new RecoveryStorage(intent.ambiente)
    try {
      await vault.put(`diario/autorizacao/${fence.value.linhagem}/${intent.id}`, jsonBytes({
        versao: 1, ambiente: intent.ambiente, linhagem: fence.value.linhagem, operacao: intent.id,
        entidade: intent.entidade, registro: intent.registro, efetiva: intent.aplicado, saida: intent.saida,
      }), true)
    } finally {
      vault.close()
    }
    if (fence.value.bloqueio === id) {
      const { bloqueio: owner, revisao, ...value } = fence.value
      if (owner !== intent.id || fence.value.geracao !== intent.id || revisao === undefined) throw pending()
      await client.query('SELECT 1')
      await store.activate(jsonBytes({ ...value, geracao: intent.saida, revisao: revisao + 1 }), fence.etag)
    }
    const released = await store.manifest()
    if (released?.value.geracao !== intent.saida || released.value.bloqueio) throw pending()
    const state = intent.aplicado ? 'concluida' : 'abortada'
    await client.query('UPDATE poc_security_intents SET estado = $2 WHERE id = $1', [id, state])
    await client.query('COMMIT')
    return state
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

export function bindSecurityTransactions(payload: Payload) {
  const entries = new Map<string, Registered>()
  transactions.set(payload, entries)
  for (const [method, outcome] of [['commitTransaction', 'commit'], ['rollbackTransaction', 'rollback']] as const) {
    const run = payload.db[method].bind(payload.db)
    payload.db[method] = async incoming => {
      const id = String(await incoming)
      const entry = entries.get(id)
      entries.delete(id)
      await run(incoming)
      if (!entry?.armed) return
      try {
        await reconcileSecurity(payload, entry.intent.id, outcome)
      } catch {
        throw pending()
      }
    }
  }
}
