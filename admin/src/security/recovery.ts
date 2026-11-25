import { randomUUID } from 'node:crypto'
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Payload } from 'payload'
import { mediaPool } from '../media/model.ts'
import { storage } from '../media/storage.ts'
import { fileKey, hash, hashPattern, idPattern, isEnvironment, jsonBytes, mediaPattern, parsePointer, sections,
  type Environment } from '../publication/contract.ts'
import { readRelease, readSnapshot } from '../publication/releases.ts'
import { recoveryRevocations } from '../publication/journal.ts'
import { destinations, manifestKey, publicationEnvironment, ReleaseStore } from '../publication/store.ts'
import { assertOperational, type DatabaseClient } from './database.ts'
import { databaseURL, postgres, query, samePostgresMajor } from './recovery-db.ts'
import { maximumObject, readObject, RecoveryStorage } from './recovery-storage.ts'

const schema = '02g-1'
type Area = 'privado' | 'releases' | 'media'
type Entry = {
  area: Area; key: string; sha256: string; size: number; type: string; etag: string | null; version: string | null
}
type Catalog = {
  format: 1; schema: typeof schema; id: string; environment: Environment; createdAt: string; postgres: number
  database: string; dump: { sha256: string; size: number }; objects: Entry[]
}
const privateKey = /^privado\/(?:originais\/[0-9a-f-]{36}|derivados\/[0-9a-f-]{36}\/\d+\/(?:otimizado|miniatura|poster))$/
const releaseKey = /^releases\/[0-9a-f-]{36}\/(?:diretoria|sedes|membros|agenda|eventos|manifest)\.json$/
const archiveKey = (id: string) => `sets/${id}/database`
const catalogKey = (id: string) => `sets/${id}/catalog`
const blobKey = (digest: string) => `blobs/${digest}`

const privateReferences = `
  SELECT DISTINCT key, original FROM (
    SELECT origem AS key, digest AS original FROM midias WHERE origem IS NOT NULL
    UNION ALL SELECT otimizado, NULL FROM midias WHERE otimizado IS NOT NULL
    UNION ALL SELECT miniatura, NULL FROM midias WHERE miniatura IS NOT NULL
    UNION ALL SELECT poster, NULL FROM midias WHERE poster IS NOT NULL
  ) refs ORDER BY key
`

function verified(bytes: Buffer, expected: { sha256: string; size: number }) {
  if (bytes.length !== expected.size || hash(bytes) !== expected.sha256) throw new Error('Checksum ou tamanho divergente.')
  return bytes
}

function validEntry(entry: Entry) {
  if (!entry || typeof entry.key !== 'string' || !hashPattern.test(entry.sha256) ||
      !Number.isSafeInteger(entry.size) || entry.size < 1 || entry.size > maximumObject ||
      typeof entry.type !== 'string' || entry.type.length > 128) return false
  if (entry.area === 'privado') return privateKey.test(entry.key)
  if (entry.area === 'media') return mediaPattern.test(entry.key)
  return entry.area === 'releases' && (entry.key === manifestKey || releaseKey.test(entry.key))
}

async function securityEvent(client: DatabaseClient, operation: string, environment: Environment, id: string, result: string) {
  await client.query(`INSERT INTO poc_audit (processo, ambiente, operacao, entidade, registro, resultado, correlacao)
    VALUES ('recuperacao', $1, $2, 'backup', $3::uuid::text, $4, $3::uuid)`, [environment, operation, id, result])
}

export async function backup(payload: Payload) {
  const start = performance.now()
  const environment = publicationEnvironment()
  if (process.env.POC_RECOVERY_MAINTENANCE !== '1') throw new Error('Pause os escritores e confirme a manutenção local.')
  const database = databaseURL(process.env.DATABASE_URL)
  const recovery = new RecoveryStorage(environment)
  const source = storage()
  const releaseStore = new ReleaseStore(environment)
  if ([source.bucket, ...Object.values(releaseStore.buckets)].includes(recovery.bucket)) {
    recovery.close()
    throw new Error('Separe o destino do backup dos buckets operacionais.')
  }
  const id = randomUUID()
  const client = await mediaPool(payload).connect()
  const dir = await mkdtemp(join(tmpdir(), 'ospapas-backup-'))
  let connectionError: Error | undefined
  const connectionLost = (error: Error) => { connectionError = error }
  client.on('error', connectionLost)
  try {
    const run = await postgres(database, dir)
    const version = await samePostgresMajor(run, 'pg_dump')
    const archive = join(dir, 'snapshot.dump')
    await client.query('BEGIN')
    await assertOperational(client)
    // A leitura do pg_dump é compatível com SHARE. Escritores e novos workers aguardam.
    await client.query(`LOCK TABLE users, users_sessions, regionais, membros, agenda, _agenda_v, eventos, diretoria,
      midias, publicacoes, poc_audit IN SHARE MODE NOWAIT`)
    const { rows: [busy] } = await client.query(`SELECT
      EXISTS (SELECT 1 FROM publicacoes WHERE estado = 'processando' OR etag_em_ativacao IS NOT NULL) OR
      EXISTS (SELECT 1 FROM midias WHERE fase IN ('recebendo', 'processando')) AS pending
    `)
    if (busy.pending) throw new Error('Reconcilie os trabalhos em andamento antes do backup.')
    const pointer = await releaseStore.pointer()
    const createdAt = new Date().toISOString()
    const dumpStart = performance.now()
    await run('pg_dump', ['-w', '--format=custom', '--compress=6', '--no-owner', '--no-acl',
      '--exclude-table-data=public.users_sessions', '--exclude-table-data=public.poc_recovery_guard', '--file', archive])
    const dumpMs = Math.round(performance.now() - dumpStart)
    if ((await stat(archive)).size > maximumObject) throw new Error('Arquivo do banco excede o limite do ensaio.')
    const bytes = await readFile(archive)
    const objects: Entry[] = []
    let sourceReads = 0
    const copy = async (area: Area, key: string, digest?: string, match?: string) => {
      if (objects.some(entry => entry.key === key && entry.area === area)) return
      const bucket = area === 'privado' ? source.bucket : releaseStore.buckets[area]
      sourceReads++
      const object = await readObject(source.client, bucket, key)
      const sha256 = hash(object.bytes)
      const entry = { area, key, sha256, size: object.bytes.length, type: object.type, etag: object.etag, version: object.version }
      if (!validEntry(entry) || (digest && sha256 !== digest) || (match && object.etag !== match)) {
        throw new Error('Inventário de mídia ou release inconsistente.')
      }
      await recovery.put(blobKey(sha256), object.bytes, true)
      objects.push(entry)
    }
    await recovery.prepare()
    const refs = await client.query<{ key: string; original: string | null }>(privateReferences)
    for (const { key, original } of refs.rows) {
      if (!privateKey.test(key)) throw new Error('Chave privada incompatível.')
      await copy('privado', key, original ?? undefined)
    }
    if (pointer) {
      await copy('releases', manifestKey, undefined, pointer.etag)
      for (const ref of [pointer.value.ativa, ...pointer.value.anteriores]) {
        const release = await readRelease(releaseStore, ref)
        await readSnapshot(releaseStore, ref, release)
        await copy('releases', fileKey(ref.id, 'manifest'), ref.checksum)
        for (const section of sections) await copy('releases', fileKey(ref.id, section), release.arquivos[section].checksum)
        for (const key of release.midias) await copy('media', key, key.split('/')[1].split('.')[0])
      }
    }
    if ((await releaseStore.pointer())?.etag !== pointer?.etag) throw new Error('O manifesto mudou durante a captura.')
    const catalog: Catalog = {
      format: 1, schema, id, environment, postgres: version, database: database.pathname,
      createdAt, dump: { size: bytes.length, sha256: hash(bytes) }, objects,
    }
    await recovery.put(archiveKey(id), bytes)
    await client.query('COMMIT')
    const verifyStart = performance.now()
    await verifyContent(recovery, catalog)
    const verifyMs = Math.round(performance.now() - verifyStart)
    const inventory = jsonBytes(catalog)
    await recovery.put(catalogKey(id), inventory)
    await securityEvent(client, 'backup', environment, id, 'sucesso')
    return { id, dumpMs, verifyMs, dumpBytes: bytes.length, inventoryBytes: inventory.length,
      objects: objects.length, operations: recovery.operations + releaseStore.operations + sourceReads,
      elapsedMs: Math.round(performance.now() - start), rssKiB: process.resourceUsage().maxRSS }
  } catch (error) {
    if (!connectionError) {
      await client.query('ROLLBACK').catch(() => undefined)
      await securityEvent(client, 'backup', environment, id, 'falha').catch(() => undefined)
    }
    throw error
  } finally {
    client.off('error', connectionLost)
    client.release(connectionError)
    recovery.close()
    await rm(dir, { recursive: true, force: true })
  }
}

async function verifyContent(recovery: RecoveryStorage, catalog: Catalog) {
  const archive = verified(await recovery.get(archiveKey(catalog.id)), catalog.dump)
  const seen = new Set<string>()
  for (const entry of catalog.objects) {
    const key = `${entry.area}/${entry.key}`
    if (!validEntry(entry) || seen.has(key)) throw new Error('Inventário inválido ou duplicado.')
    verified(await recovery.get(blobKey(entry.sha256)), entry)
    seen.add(key)
  }
  return archive
}

export async function restore(payload: Payload, id: string, target: string, environment: Environment, label: string) {
  const start = performance.now()
  if (!idPattern.test(id) || !/^[a-z0-9]{4,12}$/.test(label) || !isEnvironment(environment) ||
      environment !== publicationEnvironment()) throw new Error('Autorização explícita do mesmo ambiente é obrigatória.')
  const database = databaseURL(target)
  const source = databaseURL(process.env.DATABASE_URL)
  if (database.pathname === source.pathname) throw new Error('A recuperação exige um banco diferente da origem.')
  if (database.username === source.username) throw new Error('Use identidade PostgreSQL separada para a recuperação.')
  const recovery = new RecoveryStorage(environment)
  const dir = await mkdtemp(join(tmpdir(), 'ospapas-restauro-'))
  const quarantine = `${recovery.bucket}-q-${label}`
  try {
    const catalog: Catalog = JSON.parse((await recovery.get(catalogKey(id))).toString())
    if (catalog?.format !== 1 || catalog.schema !== schema || catalog.id !== id || catalog.environment !== environment ||
        catalog.database === database.pathname || !Array.isArray(catalog.objects) || catalog.objects.length > 10_000 ||
        !catalog.dump || !hashPattern.test(catalog.dump.sha256)) throw new Error('Backup incompleto ou incompatível.')
    const run = await postgres(database, dir)
    if (await samePostgresMajor(run, 'pg_restore') !== catalog.postgres) throw new Error('Backup de outra versão do PostgreSQL.')
    if (await query(run, "SELECT count(*) FROM pg_class WHERE relnamespace = 'public'::regnamespace") !== '0') {
      throw new Error('A recuperação exige um banco vazio.')
    }
    if ([storage().bucket, ...Object.values(destinations(environment))].includes(quarantine)) {
      throw new Error('O destino da recuperação deve ser isolado.')
    }
    const verifyStart = performance.now()
    const bytes = await verifyContent(recovery, catalog)
    const verifyMs = Math.round(performance.now() - verifyStart)
    const archive = join(dir, 'snapshot.dump')
    await writeFile(archive, bytes, { flag: 'wx', mode: 0o600 })
    const restoreStart = performance.now()
    await run('pg_restore', ['-w', '--dbname', database.pathname.slice(1),
      '--single-transaction', '--exit-on-error', '--no-owner', '--no-privileges', archive])
    const restoreMs = Math.round(performance.now() - restoreStart)
    const reconcileStart = performance.now()
    await query(run, `BEGIN;
      INSERT INTO poc_recovery_guard VALUES (1, true);
      UPDATE publicacoes SET estado = 'quarentena', expira = NULL WHERE estado IN ('pendente', 'processando', 'falhou');
      COMMIT`)
    const refs: { key: string }[] = JSON.parse(await query(run, `SELECT coalesce(json_agg(refs), '[]') FROM (${privateReferences}) refs`))
    if (refs.some(({ key }) => !catalog.objects.some(entry => entry.area === 'privado' && entry.key === key))) {
      throw new Error('O inventário não cobre as referências restauradas.')
    }
    const manifest = catalog.objects.find(entry => entry.area === 'releases' && entry.key === manifestKey)
    let archived: ReturnType<typeof parsePointer> | undefined
    if (manifest) {
      const bytes = verified(await recovery.get(blobKey(manifest.sha256)), manifest)
      archived = parsePointer(JSON.parse(bytes.toString()), environment)
      const { id: release, sequencia } = archived.ativa
      const matched = await query(run, `SELECT count(*) FROM publicacoes WHERE id = ${sequencia} AND release = '${release}'
        AND ambiente = '${environment}' AND estado = 'publicado'`)
      if (matched !== '1') throw new Error('O manifesto arquivado diverge da fila restaurada.')
    }
    const store = new ReleaseStore(environment)
    const current = await store.pointer()
    if (!current) throw new Error('Sem manifesto atual para verificar o diário de revogações.')
    const revocations = await recoveryRevocations(recovery, archived, current.value)
    await query(run, `CREATE TABLE poc_recovery_revocations (
        alvo text PRIMARY KEY, fonte text NOT NULL
      );
      INSERT INTO poc_recovery_revocations
        SELECT alvo, '${current.value.ativa.id}' FROM jsonb_array_elements_text(
          '${JSON.stringify(revocations.targets)}'::jsonb) AS alvo`)
    await recovery.prepare(quarantine)
    for (const entry of catalog.objects) {
      const bytes = verified(await recovery.get(blobKey(entry.sha256)), entry)
      // O manifesto fica no arquivo de quarentena, fora do caminho resolvido pelo consumidor.
      await recovery.putObject(quarantine, `${entry.area}/${entry.key}`, bytes, entry.type)
    }
    if ((await store.pointer())?.etag !== current.etag) {
      throw new Error('Manifesto mudou durante a recuperação. Mantenha o destino em quarentena.')
    }
    await query(run, `INSERT INTO poc_audit (processo, ambiente, operacao, entidade, registro, resultado, correlacao)
      VALUES ('recuperacao', '${environment}', 'restaurar', 'backup', '${id}', 'quarentena', '${id}')`)
    await securityEvent(mediaPool(payload), 'restaurar', environment, id, 'sucesso')
    return { id, quarantine, objects: catalog.objects.length, verifyMs, restoreMs,
      revocationsAfterBackup: revocations.later, promotion: 'revisao_obrigatoria',
      reconcileMs: Math.round(performance.now() - reconcileStart), operations: recovery.operations + store.operations,
      elapsedMs: Math.round(performance.now() - start), rssKiB: process.resourceUsage().maxRSS }
  } catch (error) {
    await securityEvent(mediaPool(payload), 'restaurar', environment, id, 'falha').catch(() => undefined)
    throw error
  } finally {
    recovery.close()
    await rm(dir, { recursive: true, force: true })
  }
}
