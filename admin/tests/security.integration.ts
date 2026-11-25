import assert from 'node:assert/strict'
import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { randomBytes, randomUUID } from 'node:crypto'
import { once } from 'node:events'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import { promisify } from 'node:util'
import { DeleteObjectCommand, GetObjectCommand, ListObjectsV2Command, type PutObjectCommandInput } from '@aws-sdk/client-s3'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import config from '../src/payload.config.ts'
import { mediaPool } from '../src/media/model.ts'
import { closeStorage, storage } from '../src/media/storage.ts'
import { workOnce } from '../src/media/worker.ts'
import { hash, jsonBytes } from '../src/publication/contract.ts'
import { stableID } from '../src/publication/projection.ts'
import { ReleaseStore } from '../src/publication/store.ts'
import { publishOnce } from '../src/publication/worker.ts'
import { databaseURL, postgres, query } from '../src/security/recovery-db.ts'
import { backup, restore } from '../src/security/recovery.ts'
import { RecoveryStorage } from '../src/security/recovery-storage.ts'

type Doc = { id: number; updatedAt: string; [key: string]: unknown }
type Job = { id: number; release: string }
type Audit = { entidade: string; operacao: string; regional: number | null; operador: number | null; resultado: string }
const store = new ReleaseStore('dev')
const exec = promisify(execFile)
const password = randomBytes(24).toString('hex')
const source = databaseURL(process.env.DATABASE_URL)
const targets = ['POC_RECOVERY_DATABASE_URL', 'POC_RECOVERY_INVALID_TEST_URL'].map(name => databaseURL(process.env[name]))
assert.equal(process.env.POC_PUBLIC_ENV, 'dev')
assert.equal(new Set([source.pathname, ...targets.map(target => target.pathname)]).size, 3)
let payload: Payload
let server: ChildProcess
let demo: ChildProcess
let adminBase: string
let publicBase: string
let general: string
let regional: string
let other: string
let author: Doc
let unit: Doc
let otherUnit: Doc
let member: Doc
let event: Doc
let cover: { id: number; uuid: string }
let agenda: Doc
let recovery: Awaited<ReturnType<typeof backup>>
let archivedRelease: string

async function readyAsset(tipo: 'imagem' | 'video', bytes: Buffer) {
  const asset = await json<{ id: number; uuid: string }>(api('midias/reserva', regional, 'POST', {
    arquivo: tipo === 'imagem' ? 'fixture.png' : 'fixture.mp4', tipo, tamanho: bytes.length,
  }), 201)
  await expect(await api(`midias/${asset.uuid}/envio`, regional, 'PUT', bytes), 202)
  await workOnce(payload)
  await expect(await api(`midias/${asset.uuid}/publicar`, regional, 'POST',
    tipo === 'imagem' ? { alt: 'Imagem azul fictícia' } : {}), 200)
  return asset
}

async function launch(args: string[], variables: Record<string, string | undefined>) {
  const listener = createServer().listen(0, '127.0.0.1')
  await once(listener, 'listening')
  const address = listener.address()
  assert.ok(address && typeof address === 'object')
  await new Promise<void>((resolve, reject) => listener.close(error => error ? reject(error) : resolve()))
  const base = `http://127.0.0.1:${address.port}`
  const child = spawn(process.execPath, args, {
    env: { ...process.env, PORT: String(address.port), POC_PUBLIC_PORT: String(address.port), HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production', ...variables },
    stdio: ['ignore', 'ignore', 'pipe'],
  })
  let errorLog = ''
  child.stderr!.on('data', chunk => { errorLog = (errorLog + String(chunk)).slice(-6000) })
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) break
    if ((await fetch(base + '/healthz').catch(() => undefined))?.ok) return { base, child }
    await delay(50)
  }
  child.kill()
  throw new Error(`Standalone indisponível: ${errorLog}`)
}

async function stop(child: ChildProcess | undefined) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return
  const exited = once(child, 'exit')
  child.kill()
  await exited
}

function api(path: string, token?: string, method = 'GET', body?: object | Buffer, metadata?: Record<string, string>) {
  const headers = new Headers(metadata)
  if (token) headers.set('Authorization', `JWT ${token}`)
  if (body) headers.set('Content-Type', Buffer.isBuffer(body) ? 'application/octet-stream' : 'application/json')
  return fetch(`${adminBase}/api/${path}`, {
    method, headers, body: Buffer.isBuffer(body) ? new Uint8Array(body) : body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  })
}

async function expect(response: Response, status: number) {
  if (response.status !== status) assert.fail(`${new URL(response.url).pathname}: ${response.status}, esperado ${status}. ${await response.text()}`)
  return response
}

async function json<T>(pending: Promise<Response>, status: number) {
  return (await expect(await pending, status)).json() as Promise<T>
}

async function write(path: string, token: string, data: object, method = 'POST') {
  return (await json<{ doc: Doc }>(api(path, token, method, data), method === 'POST' ? 201 : 200)).doc
}

async function login(email: string, secret = password) {
  return (await json<{ token: string }>(api('users/login', undefined, 'POST', { email, password: secret }), 200)).token
}

function submit(token: string, acao: 'publicar' | 'revogar', fields: object) {
  return json<Job>(api('publicacoes/solicitar', token, 'POST', { acao, ambiente: 'dev', ...fields },
    { 'Idempotency-Key': randomUUID() }), 202)
}

const selection = (colecao: string, { id }: Doc) => ({ colecao, id })
const publishMember = (token = regional) => submit(token, 'publicar', { registros: [selection('membros', member)] })

async function run(status = 'publicado') {
  const result = await publishOnce(payload)
  assert.equal(result?.status, status, JSON.stringify(result))
  return result
}

async function state(job: Job) {
  return (await mediaPool(payload).query('SELECT estado, erro, etag_em_ativacao FROM publicacoes WHERE id = $1', [job.id])).rows[0]
}

const expire = (job: Job) =>
  mediaPool(payload).query("UPDATE publicacoes SET expira = now() - interval '1 second' WHERE id = $1", [job.id])

async function interruptPublisher() {
  const result = await mediaPool(payload).query<{ killed: boolean }>(`
    SELECT pg_terminate_backend(pid, 5000) AS killed FROM pg_locks
    WHERE locktype = 'advisory' AND classid = 502020 AND objid = 0 AND granted
      AND database = (SELECT oid FROM pg_database WHERE datname = current_database())
  `)
  assert.deepEqual(result.rows, [{ killed: true }])
}

async function publicManifest() {
  return (await expect(await fetch(publicBase + '/manifest.json'), 200)).json()
}

before(async () => {
  payload = await getPayload({ config })
  assert.equal((await payload.count({ collection: 'publicacoes', overrideAccess: true })).totalDocs, 0)
  const apiServer = await launch(['.next/standalone/server.js'], { POC_ADMIN_EMAIL: undefined, POC_ADMIN_PASSWORD: undefined })
  adminBase = apiServer.base
  server = apiServer.child
  const publicServer = await launch(['scripts/publication-demo.ts'], {
    DATABASE_URL: 'postgresql://127.0.0.1:1/banco-indisponivel', PAYLOAD_SECRET: undefined,
  })
  publicBase = publicServer.base
  demo = publicServer.child
  general = await login(process.env.POC_ADMIN_EMAIL!, process.env.POC_ADMIN_PASSWORD!)
  unit = await write('regionais', general, { nome: 'Sede fictícia Gama', slug: 'gama-ficticia', tipo: 'regional' })
  otherUnit = await write('regionais', general, { nome: 'Sede fictícia Beta', slug: 'beta-ficticia', tipo: 'regional' })
  author = await write('users', general, { email: 'regional-gama@example.invalid', perfil: 'regional', regional: unit.id, password })
  await write('users', general, { email: 'regional-beta@example.invalid', perfil: 'regional', regional: otherUnit.id, password })
  regional = await login(String(author.email))
  other = await login('regional-beta@example.invalid')
  member = await write('membros', regional, { titulo: 'Nome pessoal fictício da auditoria' })
  agenda = await write('agenda', regional, { titulo: 'Agenda segura', _status: 'published' })
  await write(`agenda/${agenda.id}?draft=true`, regional, { titulo: 'Revisão de agenda privada', _status: 'draft' }, 'PATCH')
  const bytes = await sharp({ create: { width: 40, height: 60, channels: 3, background: 'blue' } }).png().toBuffer()
  cover = await readyAsset('imagem', bytes)
  const dir = await mkdtemp(join(tmpdir(), 'ospapas-rec-video-'))
  try {
    const file = join(dir, 'sintetico.mp4')
    await exec('ffmpeg', ['-nostdin', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=160x120:rate=12',
      '-t', '1', '-threads', '2', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', file])
    const footage = await readyAsset('video', await readFile(file))
    event = await write('eventos', regional, {
      titulo: 'Evento fictício de recuperação', capaMidia: cover.id, videoMidia: footage.id,
    })
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
  await submit(general, 'publicar', { registros: [selection('sedes', unit), selection('sedes', otherUnit)] })
  await run()
  await submit(regional, 'publicar', { registros: [selection('eventos', event), selection('membros', member), selection('agenda', agenda)] })
  await run()
})

after(async () => {
  await Promise.all([stop(server), stop(demo)])
  closeStorage()
  await payload?.destroy()
})

test('Auditoria registra autoria, aprovação e publicação com leitura restrita e sem dados privados', async () => {
  await expect(await api('auditoria'), 403)
  const forGeneral = (await json<{ eventos: Audit[] }>(api('auditoria', general), 200)).eventos
  assert.ok(forGeneral.some(log => log.entidade === 'users' && log.operacao === 'insert'))
  assert.ok(forGeneral.some(log => log.resultado === 'recusado'))
  const forRegional = (await json<{ eventos: Audit[] }>(api('auditoria', regional), 200)).eventos
  assert.ok(forRegional.length > 0 && forRegional.every(log => log.regional === unit.id))
  assert.ok(forRegional.some(log => log.entidade === 'midias' && log.operacao === 'aprovar' && log.operador === author.id))
  assert.ok(forRegional.some(log => log.entidade === 'publicacoes' && log.operacao === 'resultado'))
  const forOther = (await json<{ eventos: Audit[] }>(api('auditoria', other), 200)).eventos
  assert.ok(forOther.every(log => log.regional === otherUnit.id))
  const exported = JSON.stringify(forGeneral)
  assert.doesNotMatch(exported, /example\.invalid|Nome pessoal fictício|Imagem azul|senha|password|token|digest|otimizado/i)
  assert.ok([404, 405].includes((await api('auditoria', general, 'DELETE')).status))
  await assert.rejects(mediaPool(payload).query('UPDATE poc_audit SET operacao = operacao'), /somente para acréscimo/)
})

test('Conta Regional de unidade desativada perde login, acesso de conteúdo e publicação pendente', async () => {
  const previous = await store.pointer()
  const pending = await publishMember()
  await write(`regionais/${unit.id}`, general, { ativo: false }, 'PATCH')
  await expect(await api('users/login', undefined, 'POST', { email: author.email, password }), 403)
  await expect(await api(`membros/${member.id}`, regional), 403)
  await expect(await api('eventos', regional, 'POST', { titulo: 'Alteração vedada' }), 403)
  await expect(await api(`midias/${cover.uuid}/arquivo/otimizado`, regional), 403)
  await run('falhou')
  assert.equal((await state(pending)).erro, 'autorizacao_revogada')
  assert.deepEqual(await store.pointer(), previous)
  assert.equal((await json<Doc>(api(`membros/${member.id}`, general), 200)).id, member.id)
  await write(`regionais/${unit.id}`, general, { ativo: true }, 'PATCH')
})

test('Mudanças de perfil e lotação invalidam credenciais emitidas anteriormente', async () => {
  const account = await json<{ user: Doc }>(api('users/me', other), 200)
  const url = `users/${account.user.id}`
  await write(url, general, { perfil: 'geral', regional: null }, 'PATCH')
  await expect(await api('auditoria', other), 403)
  const promoted = await login('regional-beta@example.invalid')
  await write(url, general, { perfil: 'regional', regional: unit.id }, 'PATCH')
  await expect(await api('auditoria', promoted), 403)
  const assigned = await login('regional-beta@example.invalid')
  await write(url, general, { regional: otherUnit.id }, 'PATCH')
  await expect(await api('auditoria', assigned), 403)
  other = await login('regional-beta@example.invalid')
})

test('Transferências concorrentes e edição com revisão antiga devolvem conflito sem auditoria de sucesso indevida', async () => {
  const candidate = await write('membros', regional, { titulo: 'Transferência concorrente fictícia' })
  const path = `membros/${candidate.id}`
  const prior = await json<Doc>(api(path, general), 200)
  const revision = { 'If-Match': JSON.stringify(prior.updatedAt) }
  const third = await write('regionais', general, { nome: 'Sede fictícia Delta', slug: 'delta-ficticia', tipo: 'regional' })
  const responses = await Promise.all([otherUnit.id, third.id].map(regional => api(path, general, 'PATCH', { regional }, revision)))
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 409])
  const latest = await json<Doc>(api(path, general), 200)
  await expect(await api(path, general, 'PATCH', { titulo: 'Sobrescrita evitada' }, revision), 409)
  await expect(await api(path, general, 'PATCH', { titulo: 'Edição autorizada com revisão' },
    { 'If-Match': JSON.stringify(latest.updatedAt) }), 200)
  const { rows } = await mediaPool(payload).query(
    "SELECT * FROM poc_audit WHERE entidade = 'membros' AND registro = $1 AND anterior->'regional_id' <> novo->'regional_id'",
    [candidate.id],
  )
  assert.equal(rows.length, 1)
  assert.equal(rows[0].regional, null)
})

test('Revogação de aprovação de mídia entre preparo e ativação mantém a release anterior', async () => {
  const previous = await store.pointer()
  const job = await submit(regional, 'publicar', { registros: [selection('eventos', event)] })
  const outcome = await publishOnce(payload, 'dev', {
    beforeActivate: async () => {
      await expect(await api(`midias/${cover.uuid}/retirar-aprovacao`, regional, 'POST'), 403)
      await expect(await api(`midias/${cover.uuid}/retirar-aprovacao`, general, 'POST'), 200)
    },
  })
  assert.equal(outcome?.status, 'falhou')
  assert.equal((await state(job)).erro, 'midia_invalida')
  assert.deepEqual(await store.pointer(), previous)
  const logs = (await json<{ eventos: Audit[] }>(api('auditoria', general), 200)).eventos
  assert.ok(logs.some(log => log.entidade === 'midias' && log.operacao === 'revogar' && log.operador))
  await expect(await api(`midias/${cover.uuid}/publicar`, regional, 'POST', { alt: 'Imagem azul revalidada' }), 200)
})

test('Perda da conexão antes da escrita preserva o manifesto e permite retomar com autorização vigente', async () => {
  const previous = await store.pointer()
  const job = await publishMember()
  const interrupted = await publishOnce(payload, 'dev', { beforeActivate: interruptPublisher })
  assert.equal(interrupted?.status, 'processando')
  assert.deepEqual(await store.pointer(), previous)
  assert.equal((await state(job)).etag_em_ativacao, null)
  await expire(job)
  await run()
  assert.equal((await store.pointer())?.value.ativa.id, job.release)
})

test('Resposta perdida após escrita no Moto é reconciliada sem regravar o manifesto', async () => {
  const job = await publishMember()
  const apiClient = storage().client
  const name = 'perdaRespostaManifesto'
  apiClient.middlewareStack.add((next, context) => async args => {
    const input = args.input as PutObjectCommandInput
    const result = await next(args)
    if (context.commandName === 'PutObjectCommand' && input.Bucket === store.buckets.releases && input.Key === 'manifest.json') {
      throw new Error('Resposta perdida no transporte de teste.')
    }
    return result
  }, { step: 'initialize', name })
  try {
    await run('processando')
  } finally {
    apiClient.middlewareStack.remove(name)
  }
  const afterWrite = await store.pointer()
  assert.equal(afterWrite?.value.ativa.id, job.release)
  assert.ok((await state(job)).etag_em_ativacao)
  await expire(job)
  await run('reconciliado')
  assert.deepEqual(await store.pointer(), afterWrite)
})

test('Após perder a conexão durante a ativação, a barreira invalida a escrita atrasada antes de confirmar revogação', async () => {
  const previous = await store.pointer()
  const job = await publishMember()
  const entered = Promise.withResolvers<void>()
  const release = Promise.withResolvers<void>()
  const apiClient = storage().client
  const name = 'armazenamentoAtrasado'
  let held = false
  apiClient.middlewareStack.add((next, context) => async args => {
    const input = args.input as PutObjectCommandInput
    if (!held && context.commandName === 'PutObjectCommand' && input.Bucket === store.buckets.releases && input.Key === 'manifest.json') {
      held = true
      entered.resolve()
      await release.promise
    }
    return next(args)
  }, { step: 'initialize', name })
  const oldWorker = publishOnce(payload)
  const target = 'b'.repeat(64)
  try {
    assert.equal(await Promise.race([entered.promise.then(() => 'entrou'), oldWorker, delay(10_000, 'timeout', { ref: false })]), 'entrou')
    assert.equal((await state(job)).etag_em_ativacao, previous?.etag)
    await interruptPublisher()
    await write(`users/${author.id}`, general, { ativo: false }, 'PATCH')
    const revocation = await submit(general, 'revogar', { alvo: target })
    assert.equal(await publishOnce(payload), undefined)
    await expire(job)
    await run('falhou')
    const fenced = await store.pointer()
    assert.deepEqual(fenced?.value.ativa, previous?.value.ativa)
    assert.notEqual(fenced?.etag, previous?.etag)
    assert.equal((await state(job)).erro, 'autorizacao_revogada')
    await run()
    const latest = await store.pointer()
    assert.equal(latest?.value.ativa.id, revocation.release)
    assert.ok(latest?.value.revogados.includes(target))
    release.resolve()
    assert.equal((await oldWorker)?.status, 'processando')
    assert.deepEqual(await store.pointer(), latest)
  } finally {
    release.resolve()
    await oldWorker
    apiClient.middlewareStack.remove(name)
  }
  await write(`users/${author.id}`, general, { ativo: true }, 'PATCH')
  regional = await login(String(author.email))
})

async function captureBackup() {
  process.env.POC_RECOVERY_MAINTENANCE = '1'
  try {
    return await backup(payload)
  } finally {
    delete process.env.POC_RECOVERY_MAINTENANCE
  }
}

test('Backup real guarda banco comprimido, registros e objetos referenciados com autenticação criptográfica', async () => {
  await publishMember()
  archivedRelease = (await publicManifest()).ativa.id
  recovery = await captureBackup()
  assert.ok(recovery.dumpBytes > 0 && recovery.objects >= 16)
  const recoveryStore = new RecoveryStorage('dev')
  try {
    const ciphertext = await recoveryStore.client.send(new GetObjectCommand({
      Bucket: recoveryStore.bucket, Key: `sets/${recovery.id}/database`,
    }))
    const bytes = Buffer.from(await ciphertext.Body!.transformToByteArray())
    assert.notEqual(bytes.subarray(0, 5).toString(), 'PGDMP')
    assert.equal((await recoveryStore.get(`sets/${recovery.id}/database`)).subarray(0, 5).toString(), 'PGDMP')
  } finally {
    recoveryStore.close()
  }
  console.info('MEDICAO_BACKUP', JSON.stringify({ ...recovery, id: undefined }))
})

test('Um segundo conjunto reutiliza blobs de mídia e guarda seu próprio catálogo e arquivo de banco', async () => {
  const vault = new RecoveryStorage('dev')
  try {
    const blobs = () => vault.client.send(new ListObjectsV2Command({ Bucket: vault.bucket, Prefix: 'blobs/' }))
    const initial = await blobs()
    const next = await captureBackup()
    assert.notEqual(next.id, recovery.id)
    assert.equal(next.objects, recovery.objects)
    assert.deepEqual((await blobs()).Contents, initial.Contents)
    assert.ok(await vault.get(`sets/${next.id}/catalog`))
    assert.ok(await vault.get(`sets/${recovery.id}/catalog`))
  } finally {
    vault.close()
  }
})

test('Destinos cruzados, catálogo incompatível, mídia ausente e arquivo corrompido são recusados antes da restauração', async () => {
  await assert.rejects(restore(payload, recovery.id, targets[1].href, 'hml', 'outro'), /mesmo ambiente/)
  await assert.rejects(restore(payload, recovery.id, source.href, 'dev', 'origem'), /diferente da origem/)
  const samePrincipal = new URL(source)
  samePrincipal.pathname = targets[1].pathname
  await assert.rejects(restore(payload, recovery.id, samePrincipal.href, 'dev', 'isolado'), /identidade PostgreSQL separada/)
  const vault = new RecoveryStorage('dev')
  try {
    const originalCatalog = JSON.parse((await vault.get(`sets/${recovery.id}/catalog`)).toString())
    const id = randomUUID()
    await vault.put(`sets/${id}/catalog`, jsonBytes({ ...originalCatalog, id, schema: 'incompativel' }))
    await assert.rejects(restore(payload, id, targets[1].href, 'dev', 'invalido'), /incompleto ou incompatível/)
    const asset = originalCatalog.objects.find((item: { area: string }) => item.area === 'privado')
    assert.ok(asset)
    const key = `blobs/${asset.sha256}`
    const object = await vault.client.send(new GetObjectCommand({ Bucket: vault.bucket, Key: key }))
    const bytes = await object.Body!.transformToByteArray()
    await vault.client.send(new DeleteObjectCommand({ Bucket: vault.bucket, Key: key }))
    try {
      await assert.rejects(restore(payload, recovery.id, targets[1].href, 'dev', 'invalido'), { name: 'NoSuchKey' })
      await vault.putObject(vault.bucket, key, Buffer.alloc(bytes.length, 37), 'application/octet-stream')
      await assert.rejects(restore(payload, recovery.id, targets[1].href, 'dev', 'invalido'), /integridade/)
    } finally {
      await vault.client.send(new DeleteObjectCommand({ Bucket: vault.bucket, Key: key }))
      await vault.putObject(vault.bucket, key, Buffer.from(bytes), 'application/octet-stream')
    }
    const dir = await mkdtemp(join(tmpdir(), 'ospapas-rec-check-'))
    try {
      assert.equal(await query(await postgres(targets[1], dir), "SELECT to_regclass('public.users') IS NULL"), 't')
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  } finally {
    vault.close()
  }
})

test('Restauração real preserva rascunhos, trilha e objetos, bloqueia sessões e fila e deixa revogação posterior ativa', async () => {
  const publicId = stableID('eventos', event.id)
  const eventRelease = await (await expect(await fetch(publicBase + '/releases/' + archivedRelease + '/eventos.json'), 200)).json()
  const assetKey: string = eventRelease.dados[0].capa.arquivo
  await submit(general, 'revogar', { alvo: publicId })
  const revocation = await submit(general, 'revogar', { alvo: assetKey })
  // O pedido pendente precede a revogação local. A cópia restaurada deve mantê-lo em quarentena.
  await run()
  await run()
  await run()
  const active = await publicManifest()
  assert.equal(active.ativa.id, revocation.release)
  assert.ok(active.revogados.includes(publicId))
  assert.ok(active.revogados.includes(assetKey))
  assert.notEqual(active.ativa.id, archivedRelease)
  await stop(server)
  const [result, live] = await Promise.all([
    restore(payload, recovery.id, targets[0].href, 'dev', 'isola'),
    publicManifest(),
  ])
  assert.deepEqual(live, active)
  assert.deepEqual(await publicManifest(), active)
  assert.equal(result.revocationsAfterBackup, 2)
  assert.equal(result.promotion, 'revisao_obrigatoria')
  const dir = await mkdtemp(join(tmpdir(), 'ospapas-rec-check-'))
  const vault = new RecoveryStorage('dev')
  try {
    const runSQL = await postgres(targets[0], dir)
    const restored = JSON.parse(await query(runSQL, `SELECT json_build_object(
      'users', (SELECT count(*) FROM users WHERE perfil = 'regional' AND regional_id IS NOT NULL),
      'units', (SELECT count(*) FROM regionais),
      'members', (SELECT count(*) FROM membros),
      'versions', (SELECT count(*) FROM _agenda_v WHERE version__status = 'draft'),
      'media', (SELECT count(*) FROM midias WHERE otimizado IS NOT NULL),
      'audit', (SELECT count(*) FROM poc_audit WHERE entidade = 'membros'),
      'locked', (SELECT bloqueado FROM poc_recovery_guard),
      'sessions', (SELECT count(*) FROM users_sessions),
      'jobs', (SELECT count(*) FROM publicacoes WHERE estado = 'quarentena'),
      'published', (SELECT count(*) FROM publicacoes WHERE estado = 'publicado' AND release = '${archivedRelease}')
    )`))
    assert.ok(restored.users === 2 && restored.units === 3 && restored.members === 2 &&
      restored.versions >= 1 && restored.media === 2 && restored.audit >= 2 && restored.published === 1)
    assert.equal(restored.locked, true)
    assert.equal(restored.sessions, 0)
    assert.ok(restored.jobs >= 1)
    const recoveredDenials: string[] = JSON.parse(await query(runSQL,
      "SELECT json_agg(alvo ORDER BY alvo) FROM poc_recovery_revocations"))
    assert.deepEqual(recoveredDenials, [publicId, assetKey, 'b'.repeat(64)].sort())
    const archived = await vault.client.send(new GetObjectCommand({ Bucket: result.quarantine, Key: 'releases/manifest.json' }))
    const pointer = JSON.parse(await archived.Body!.transformToString())
    assert.equal(pointer.ativa.id, archivedRelease)
    assert.ok(pointer.revogados.includes('b'.repeat(64)))
    assert.ok(!pointer.revogados.includes(publicId))
    const originalKey = await query(runSQL, "SELECT origem FROM midias WHERE tipo = 'video'")
    const originalDigest = await query(runSQL, "SELECT digest FROM midias WHERE tipo = 'video'")
    const original = await vault.client.send(new GetObjectCommand({ Bucket: result.quarantine, Key: 'privado/' + originalKey }))
    assert.equal(hash(await original.Body!.transformToByteArray()), originalDigest)
    const poster = await query(runSQL, "SELECT poster FROM midias WHERE tipo = 'video'")
    assert.ok((await vault.client.send(new GetObjectCommand({
      Bucket: result.quarantine, Key: 'privado/' + poster,
    }))).ContentLength)
    await assert.rejects(vault.client.send(new GetObjectCommand({ Bucket: result.quarantine, Key: 'manifest.json' })), { name: 'NoSuchKey' })
  } finally {
    vault.close()
    await rm(dir, { recursive: true, force: true })
  }
  console.info('MEDICAO_RESTAURACAO', JSON.stringify({ ...result, id: undefined, quarantine: undefined }))
})
