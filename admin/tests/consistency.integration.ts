import { assertDisposableDatabase } from '../src/experimental.ts'
import assert from 'node:assert/strict'
import { spawn, type ChildProcess } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import {
  CreateBucketCommand, DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, type PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { getPayload, type Payload } from 'payload'
import config from '../src/payload.config.ts'
import { mediaPool } from '../src/media/model.ts'
import { closeStorage, storage } from '../src/media/storage.ts'
import { publicObject } from '../src/publication/consumer.ts'
import { readRevocations, recoveryRevocations } from '../src/publication/journal.ts'
import { assertLatestEvidence } from '../src/publication/evidence.ts'
import { stableID } from '../src/publication/projection.ts'
import { manifestKey, ReleaseStore } from '../src/publication/store.ts'
import { publishOnce } from '../src/publication/worker.ts'
import { coordinateSQL, reconcileSecurity } from '../src/security/coordination.ts'
import { databaseURL, postgres, query } from '../src/security/recovery-db.ts'
import { backup, restore } from '../src/security/recovery.ts'
import { RecoveryStorage } from '../src/security/recovery-storage.ts'

type Doc = { id: number }
type Job = { id: number; release: string }
type RecordSelection = { colecao: string; id: number }
const store = new ReleaseStore('dev')
const target = databaseURL(process.env.POC_RECOVERY_JOURNAL_TEST_URL)
assert.notEqual(target.pathname, databaseURL(process.env.DATABASE_URL).pathname)
assert.equal(process.env.POC_PUBLIC_ENV, 'dev')
const password = randomBytes(24).toString('hex')
let payload: Payload
let server: ChildProcess
let base: string
let general: string
let regional: string
let author: Doc
let member: Doc
let records: RecordSelection[]
let captured: Awaited<ReturnType<typeof backup>>

async function request<T>(path: string, status: number, token?: string, body?: object, method = 'POST') {
  const headers = new Headers({ 'Idempotency-Key': randomUUID() })
  if (token) headers.set('Authorization', 'JWT ' + token)
  if (body) headers.set('Content-Type', 'application/json')
  const response = await fetch(base + '/api/' + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(12_000),
  })
  const value = await response.json()
  assert.equal(response.status, status, JSON.stringify(value))
  return value as T
}

const submit = (token: string, input: object) =>
  request<Job>('publicacoes/solicitar', 202, token, { ambiente: 'dev', ...input })
const publish = (token = general) => submit(token, { acao: 'publicar', registros: records })
const revoke = (alvo: string) => submit(general, { acao: 'revogar', alvo })
const expire = (job: Job) => mediaPool(payload).query(
  "UPDATE publicacoes SET expira = now() - interval '1 second' WHERE id = $1", [job.id],
)
const state = async (job: Job) => (await mediaPool(payload).query(
  'SELECT estado, erro, etag_em_ativacao FROM publicacoes WHERE id = $1', [job.id],
)).rows[0]

function controlWrite(name: string, intercept: () => Promise<void>, loseResponse = false) {
  const client = storage().client
  let intercepted = false
  client.middlewareStack.add((next, context) => async args => {
    const input = args.input as PutObjectCommandInput
    const matches = !intercepted && context.commandName === 'PutObjectCommand' &&
      input.Bucket === store.buckets.releases && input.Key === manifestKey
    if (matches) {
      intercepted = true
      await intercept()
    }
    const result = await next(args)
    if (matches && loseResponse) throw new Error('Resposta omitida no transporte de teste.')
    return result
  }, { step: 'initialize', name })
  return () => client.middlewareStack.remove(name)
}

async function run(status: string) {
  const result = await publishOnce(payload)
  assert.equal(result?.status, status, JSON.stringify(result))
  return result
}

before(async () => {
  await assertDisposableDatabase()
  await assertDisposableDatabase(target.href)
  payload = await getPayload({ config })
  assert.equal((await payload.count({ collection: 'publicacoes', overrideAccess: true })).totalDocs, 0)
  for (const Bucket of Object.values(store.buckets)) await storage().client.send(new CreateBucketCommand({ Bucket }))
  const listener = createServer().listen(0, '127.0.0.1')
  await once(listener, 'listening')
  const address = listener.address()
  assert.ok(address && typeof address === 'object')
  await new Promise<void>((resolve, reject) => listener.close(error => error ? reject(error) : resolve()))
  base = 'http://127.0.0.1:' + address.port
  server = spawn(process.execPath, ['.next/standalone/server.js'], {
    stdio: 'ignore', env: { ...process.env, PORT: String(address.port), HOSTNAME: '127.0.0.1', NODE_ENV: 'production' },
  })
  for (let attempt = 0; ; attempt++) {
    assert.ok(attempt < 120 && server.exitCode === null, 'Standalone indisponível.')
    if ((await fetch(base + '/healthz').catch(() => undefined))?.ok) break
    await delay(50)
  }
  general = (await request<{ token: string }>('users/login', 200, undefined, {
    email: process.env.POC_ADMIN_EMAIL, password: process.env.POC_ADMIN_PASSWORD,
  })).token
  const sede = (await request<{ doc: Doc }>('regionais', 201, general, {
    nome: 'Unidade de consistência fictícia', slug: 'consistencia-ficticia', tipo: 'regional',
  })).doc
  const email = 'consistencia-regional@example.invalid'
  author = (await request<{ doc: Doc }>('users', 201, general, { email, password, perfil: 'regional', regional: sede.id })).doc
  regional = (await request<{ token: string }>('users/login', 200, undefined, { email, password })).token
  member = (await request<{ doc: Doc }>('membros', 201, regional, { titulo: 'Membro fictício de consistência' })).doc
  records = [{ colecao: 'sedes', id: sede.id }, { colecao: 'membros', id: member.id }]
})

after(async () => {
  if (server?.exitCode === null && server.signalCode === null) {
    const exited = once(server, 'exit')
    server.kill()
    await exited
  }
  closeStorage()
  await payload?.destroy()
})

test('Criação concorrente do manifesto inicial e resposta perdida preservam uma única linhagem vazia', async () => {
  assert.equal(await store.manifest(), null)
  const waiting = Promise.withResolvers<void>()
  const go = Promise.withResolvers<void>()
  const remove = controlWrite('inicializacaoPausada', async () => {
    waiting.resolve()
    await go.promise
  }, true)
  const first = store.initialize()
  try {
    await Promise.race([waiting.promise, first])
    await assert.rejects(store.initialize(), /Inicialização pendente/)
    assert.equal(await store.manifest(), null)
  } finally {
    go.resolve()
    await first
    remove()
  }
  const initialized = await first
  assert.equal(initialized.value.ativa, null)
  assert.equal(initialized.value.revisao, 0)
  assert.deepEqual(await store.initialize(), initialized)
  assert.equal(await publicObject(store, manifestKey), null)
})

test('Após desconexão na primeira ativação, a barreira vence o PUT atrasado sem publicar release', async () => {
  const initialized = await store.manifest()
  const job = await publish(regional)
  const waiting = Promise.withResolvers<void>()
  const go = Promise.withResolvers<void>()
  const remove = controlWrite('primeiroPutAtrasado', async () => {
    waiting.resolve()
    await go.promise
  })
  const worker = publishOnce(payload)
  const before = performance.now()
  try {
    await Promise.race([waiting.promise, worker])
    assert.equal((await state(job)).etag_em_ativacao, initialized?.etag)
    const ended = await mediaPool(payload).query(`SELECT pg_terminate_backend(pid, 5000) AS encerrado
      FROM pg_locks WHERE locktype = 'advisory' AND classid = 502020 AND objid = 0 AND granted
      AND database = (SELECT oid FROM pg_database WHERE datname = current_database())`)
    assert.deepEqual(ended.rows, [{ encerrado: true }])
    await request(`users/${author.id}`, 200, general, { ativo: false }, 'PATCH')
    await expire(job)
    await run('falhou')
    const fenced = await store.manifest()
    assert.equal(fenced?.value.ativa, null)
    assert.equal(fenced?.value.revisao, 2)
    assert.notEqual(fenced?.etag, initialized?.etag)
    assert.equal((await state(job)).erro, 'autorizacao_revogada')
    go.resolve()
    assert.equal((await worker)?.status, 'processando')
    assert.deepEqual(await store.manifest(), fenced)
    console.info('MEDICAO_BARREIRA', JSON.stringify({ ms: Math.round(performance.now() - before) }))
  } finally {
    go.resolve()
    await worker
    remove()
  }
})

test('Primeira ativação vencedora com resposta perdida é reconciliada sem alterar geração', async () => {
  const job = await publish()
  const remove = controlWrite('respostaPrimeiraAtivacao', async () => undefined, true)
  try {
    await run('processando')
  } finally {
    remove()
  }
  const active = await store.pointer()
  assert.equal(active?.value.ativa.id, job.release)
  assert.equal(active?.value.revisao, 3)
  assert.equal(await publishOnce(payload), undefined)
  await expire(job)
  await run('reconciliado')
  assert.deepEqual(await store.pointer(), active)
  assert.equal((await state(job)).estado, 'publicado')
  assert.deepEqual(await store.initialize(), active)
  process.env.POC_RECOVERY_MAINTENANCE = '1'
  try {
    captured = await backup(payload)
  } finally {
    delete process.env.POC_RECOVERY_MAINTENANCE
  }
})

test('Revogação liga o evento idempotente só no CAS e preserva a ordem dos alvos', async () => {
  const original = await store.pointer()
  const job = await revoke(stableID('membros', member.id))
  const failed = await publishOnce(payload, 'dev', {
    beforeActivate: async () => { throw new Error('Preparo interrompido no teste.') },
  })
  assert.equal(failed?.status, 'falhou')
  assert.deepEqual(await store.pointer(), original)
  const vault = new RecoveryStorage('dev')
  try {
    const list = () => vault.client.send(new ListObjectsV2Command({ Bucket: vault.bucket, Prefix: 'diario/revogacoes/' }))
    const first = await list()
    assert.equal(first.KeyCount, 1)
    await request(`publicacoes/${job.id}/repetir`, 202, general)
    await run('publicado')
    assert.deepEqual((await list()).Contents, first.Contents)
    const media = await revoke('midias/' + 'd'.repeat(64) + '.webp')
    const metrics = await run('publicado')
    console.info('MEDICAO_DIARIO', JSON.stringify(metrics))
    const active = (await store.pointer())!
    assert.equal(active.value.ativa.id, media.release)
    assert.equal((await readRevocations(vault, active.value)).size, 2)
    assert.equal((await recoveryRevocations(vault, original!.value, active.value)).later, 2)
    await assert.rejects(recoveryRevocations(vault, original!.value, original!.value), /Manifesto regredido/)
    await assert.rejects(assertLatestEvidence(vault, original!.value), /Manifesto regredido/)
    const chain = [...(await readRevocations(vault, active.value)).entries()]
    const prior = chain[1]
    const truncated = { ...active.value, diario: prior[0], revogados: [prior[1].alvo] }
    assert.equal((await readRevocations(vault, truncated)).size, 1)
    await assert.rejects(recoveryRevocations(vault, original!.value, truncated), /truncado/)
    const index = `diario/evidencias/${active.value.linhagem}/indice`
    const encrypted = await vault.client.send(new GetObjectCommand({ Bucket: vault.bucket, Key: index }))
    const saved = Buffer.from(await encrypted.Body!.transformToByteArray())
    await vault.client.send(new DeleteObjectCommand({ Bucket: vault.bucket, Key: index }))
    try {
      await assert.rejects(recoveryRevocations(vault, original!.value, active.value), /Índice de evidência ausente/)
    } finally {
      await vault.putObject(vault.bucket, index, saved, 'application/octet-stream')
    }
    await assert.rejects(readRevocations(vault, { ...active.value, ambiente: 'hml' }), /Ambiente do diário divergente/)
  } finally {
    vault.close()
  }
})

test('Diário ausente ou adulterado bloqueia restauração e mantém a quarentena e a origem', async () => {
  const original = (await store.pointer())!
  const vault = new RecoveryStorage('dev')
  const key = 'diario/revogacoes/' + original.value.diario
  const object = await vault.client.send(new GetObjectCommand({ Bucket: vault.bucket, Key: key }))
  const saved = Buffer.from(await object.Body!.transformToByteArray())
  const remove = () => vault.client.send(new DeleteObjectCommand({ Bucket: vault.bucket, Key: key }))
  try {
    await remove()
    await assert.rejects(restore(payload, captured.id, target.href, 'dev', 'diario'), { name: 'NoSuchKey' })
    const dir = await mkdtemp(join(tmpdir(), 'ospapas-conferencia-'))
    try {
      const sql = await postgres(target, dir)
      assert.equal(await query(sql, 'SELECT bloqueado FROM poc_recovery_guard'), 't')
      assert.equal(await query(sql, 'SELECT count(*) FROM users_sessions'), '0')
      assert.equal(await query(sql, "SELECT to_regclass('poc_recovery_revocations') IS NULL"), 't')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
    await vault.putObject(vault.bucket, key, Buffer.alloc(saved.length, 37), 'application/octet-stream')
    await assert.rejects(readRevocations(vault, original.value), /integridade/)
    assert.deepEqual(await store.pointer(), original)
    assert.ok(await publicObject(store, manifestKey))
  } finally {
    await remove()
    await vault.putObject(vault.bucket, key, saved, 'application/octet-stream')
    vault.close()
  }
})

test('Uma ativação que vence o CAS é mantida antes de a desativação se tornar efetiva', async () => {
  await request(`users/${author.id}`, 200, general, { ativo: true }, 'PATCH')
  regional = (await request<{ token: string }>('users/login', 200, undefined,
    { email: 'consistencia-regional@example.invalid', password })).token
  const job = await submit(regional, { acao: 'publicar', registros: [records[0]] })
  const accepted = Promise.withResolvers<void>()
  const resume = Promise.withResolvers<void>()
  const client = storage().client
  const name = 'ativacaoAceitaSemResposta'
  let intercepted = false
  client.middlewareStack.add((next, context) => async args => {
    const result = await next(args)
    const input = args.input as PutObjectCommandInput
    if (!intercepted && context.commandName === 'PutObjectCommand' && input.Bucket === store.buckets.releases &&
        input.Key === manifestKey && Buffer.isBuffer(input.Body) && JSON.parse(input.Body.toString()).ativa?.id === job.release &&
        !JSON.parse(input.Body.toString()).bloqueio) {
      intercepted = true
      accepted.resolve()
      await resume.promise
      throw new Error('Resposta do PUT omitida no teste.')
    }
    return result
  }, { name, step: 'initialize' })
  const worker = publishOnce(payload)
  try {
    await Promise.race([accepted.promise, worker])
    const active = (await store.pointer())!
    assert.equal(active.value.ativa.id, job.release)
    const ended = await mediaPool(payload).query(`SELECT pg_terminate_backend(pid, 5000) AS encerrado
      FROM pg_locks WHERE locktype = 'advisory' AND classid = 502020 AND objid = 0 AND granted
      AND database = (SELECT oid FROM pg_database WHERE datname = current_database())`)
    assert.deepEqual(ended.rows, [{ encerrado: true }])
    await request(`users/${author.id}`, 200, general, { ativo: false }, 'PATCH')
    const { rows: [intent] } = await mediaPool(payload).query(`
      SELECT i.estado, i.release_observada, e.aplicado, u.ativo FROM poc_security_intents i
      JOIN poc_security_effects e USING (id) JOIN users u ON u.id = i.registro
      WHERE i.registro = $1 AND i.release_observada = $2`, [author.id, job.release])
    assert.deepEqual(intent, { estado: 'concluida', release_observada: job.release, aplicado: true, ativo: false })
    const fenced = (await store.pointer())!
    assert.deepEqual(fenced.value.ativa, active.value.ativa)
    assert.notEqual(fenced.etag, active.etag)
    resume.resolve()
    assert.equal((await worker)?.status, 'processando')
    await expire(job)
    await run('reconciliado')
    assert.deepEqual(await store.pointer(), fenced)
  } finally {
    resume.resolve()
    await worker
    client.middlewareStack.remove(name)
  }
})

test('Efeito de commit incerto e rollback permanecem cercados até reconciliação explícita', async () => {
  const pool = mediaPool(payload)
  const target = { entidade: 'users', registro: author.id } as const
  const before = (await store.pointer())!
  await request(`users/${author.id}`, 200, general, { ativo: true }, 'PATCH')
  const apply = async (commit: boolean) => {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const id = await coordinateSQL(client, payload, target)
      await client.query('UPDATE users SET ativo = false WHERE id = $1', [author.id])
      if (commit) {
        // O processo termina depois do COMMIT, antes de observar ou liberar a operação.
        await client.query('COMMIT')
      } else await client.query('ROLLBACK')
      return id
    } finally {
      client.release()
    }
  }

  const connection = await pool.connect()
  const remove = controlWrite('respostaBarreiraPerdida', async () => undefined, true)
  try {
    await connection.query('BEGIN')
    await assert.rejects(coordinateSQL(connection, payload, target), /pendente/)
    await connection.query('ROLLBACK')
  } finally {
    remove()
    connection.release()
  }
  const uncertainFence = (await store.pointer())!
  assert.ok(uncertainFence.value.bloqueio)
  assert.equal(await publishOnce(payload), undefined)
  assert.equal(await reconcileSecurity(payload, uncertainFence.value.bloqueio, 'inspect'), 'abortada')

  const rolledBack = await apply(false)
  const held = (await store.pointer())!
  assert.equal(held.value.bloqueio, rolledBack)
  assert.equal((await pool.query('SELECT ativo FROM users WHERE id = $1', [author.id])).rows[0].ativo, true)
  assert.equal((await pool.query('SELECT estado FROM poc_security_intents WHERE id = $1', [rolledBack])).rows[0].estado, 'pendente')
  assert.equal(await publishOnce(payload), undefined)
  await request(`users/${author.id}`, 503, general, { ativo: false }, 'PATCH')
  assert.equal(await reconcileSecurity(payload, rolledBack, 'inspect'), 'abortada')

  const committed = await apply(true)
  const newer = (await store.pointer())!
  assert.equal(newer.value.bloqueio, committed)
  assert.equal((await pool.query('SELECT ativo FROM users WHERE id = $1', [author.id])).rows[0].ativo, false)
  assert.equal(await reconcileSecurity(payload, rolledBack, 'inspect'), 'abortada')
  assert.deepEqual(await store.pointer(), newer)
  assert.ok(await publicObject(store, manifestKey))
  assert.equal(await reconcileSecurity(payload, committed, 'inspect'), 'concluida')
  const current = (await store.pointer())!
  assert.deepEqual(current.value.ativa, before.value.ativa)
  assert.equal(current.value.bloqueio, undefined)
  assert.ok((current.value.revisao ?? 0) > (newer.value.revisao ?? 0))
  const evidence = new RecoveryStorage('dev')
  try {
    const receipt = JSON.parse((await evidence.get(`diario/autorizacao/${current.value.linhagem}/${committed}`)).toString())
    assert.equal(receipt.efetiva, true)
  } finally {
    evidence.close()
  }
})

test('SQL sem coordenação e a API em lote não podem alterar autoridade regional', async () => {
  const pool = mediaPool(payload)
  const original = (await pool.query('SELECT regional_id FROM membros WHERE id = $1', [member.id])).rows[0]
  const another = (await request<{ doc: Doc }>('regionais', 201, general, {
    nome: 'Unidade fictícia de transferência', slug: 'transferencia-ficticia', tipo: 'regional',
  })).doc
  await assert.rejects(pool.query('UPDATE membros SET regional_id = $1 WHERE id = $2', [another.id, member.id]), { code: '42501' })
  await assert.rejects(pool.query('DELETE FROM membros WHERE id = $1', [member.id]), { code: '42501' })
  await request(`membros?where[id][equals]=${member.id}`, 403, general, { regional: another.id }, 'PATCH')
  assert.deepEqual((await pool.query('SELECT regional_id FROM membros WHERE id = $1', [member.id])).rows[0], original)
  await request(`membros/${member.id}`, 200, general, { regional: another.id }, 'PATCH')
  assert.equal((await pool.query('SELECT regional_id FROM membros WHERE id = $1', [member.id])).rows[0].regional_id, another.id)
})

test('Perda do manifesto inicializado gera incidente e impede recriação pelo worker ou inicializador', async () => {
  await storage().client.send(new DeleteObjectCommand({ Bucket: store.buckets.releases, Key: manifestKey }))
  const job = await publish()
  const outcome = await run('processando')
  assert.equal(outcome && 'reason' in outcome ? outcome.reason : undefined, 'incidente_manifesto')
  assert.equal((await state(job)).estado, 'processando')
  assert.equal(await store.manifest(), null)
  await assert.rejects(store.initialize(), /manifesto perdido/)
  assert.equal(await store.manifest(), null)
})
