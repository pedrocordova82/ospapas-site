import assert from 'node:assert/strict'
import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import { promisify } from 'node:util'
import { DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import config from '../src/payload.config.ts'
import { mediaPool } from '../src/media/model.ts'
import { closeStorage, fetchObject, storage, storeFile } from '../src/media/storage.ts'
import { workOnce } from '../src/media/worker.ts'
import { fileKey, hash, jsonBytes, type Environment, type Section } from '../src/publication/contract.ts'
import { loadPublication } from '../src/publication/consumer.ts'
import { ReleaseStore } from '../src/publication/store.ts'
import { publishOnce } from '../src/publication/worker.ts'

type Doc = { id: number; [key: string]: unknown }
type Session = { token: string }
type Enqueued = { id: number; release: string; estado: string }
type Row = { estado: string; erro: string | null; tentativas: number | string }
type Asset = { id: number; uuid: string; otimizado: string }
const exec = promisify(execFile)
const password = randomBytes(24).toString('hex')
const currentStore = new ReleaseStore('dev')
const processes = new Set<ChildProcess>()
const database = new URL(process.env.DATABASE_URL ?? 'postgresql://invalid')
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(database.hostname) && process.env.POC_PUBLIC_ENV === 'dev')
let payload: Payload
let dir: string
let bundle: string
let server: ChildProcess
let admin: string
let demo: string
let geral: Session
let df: Session
let rj: Session
let dfUnit: Doc
let rjUnit: Doc
let director: Doc
let member: Doc
let otherMember: Doc
let inactive: Doc
let agenda: Doc
let draft: Doc
let event: Doc
let privateEvent: Doc
let cover: Asset
let video: Asset
let firstRegion: Enqueued

async function start(args: string[], listenerName: 'PORT' | 'POC_PUBLIC_PORT', environment: Environment = 'dev') {
  const listener = createServer().listen(0, '127.0.0.1')
  await once(listener, 'listening')
  const address = listener.address()
  assert.ok(address && typeof address === 'object')
  await new Promise<void>((resolve, reject) => listener.close(error => error ? reject(error) : resolve()))
  const base = `http://127.0.0.1:${address.port}`
  const env: NodeJS.ProcessEnv = {
    ...process.env, [listenerName]: String(address.port), HOSTNAME: '127.0.0.1',
    POC_PUBLIC_ENV: environment, NODE_ENV: 'production', TMPDIR: dir,
  }
  delete env.POC_ADMIN_EMAIL
  delete env.POC_ADMIN_PASSWORD
  if (listenerName === 'POC_PUBLIC_PORT') {
    env.DATABASE_URL = 'postgresql://127.0.0.1:1/banco-indisponivel'
    delete env.PAYLOAD_SECRET
  }
  const processHandle = spawn(process.execPath, args, {
    cwd: listenerName === 'PORT' ? bundle : process.cwd(), env, stdio: 'ignore',
  })
  processes.add(processHandle)
  for (let attempt = 0; ; attempt++) {
    assert.ok(attempt < 90 && processHandle.exitCode === null, 'Servidor experimental não respondeu.')
    if ((await fetch(base + '/healthz').catch(() => undefined))?.ok) return { base, processHandle }
    await delay(80)
  }
}

async function stop(processHandle: ChildProcess) {
  if (processHandle.exitCode === null && processHandle.signalCode === null) {
    const ended = once(processHandle, 'exit')
    processHandle.kill('SIGTERM')
    await ended
  }
  processes.delete(processHandle)
}

async function api(path: string, session?: Session, method = 'GET', body?: object | Buffer, target = admin, key?: string) {
  const headers = new Headers()
  if (session) headers.set('Authorization', `JWT ${session.token}`)
  if (body) headers.set('Content-Type', Buffer.isBuffer(body) ? 'application/octet-stream' : 'application/json')
  if (key) headers.set('Idempotency-Key', key)
  return fetch(`${target}/api/${path}`, {
    method, headers, body: Buffer.isBuffer(body) ? new Uint8Array(body) : body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15_000),
  })
}

async function expect(response: Response, wanted: number) {
  if (response.status !== wanted) {
    const path = new URL(response.url).pathname
    const message = (await response.json().catch(() => null))?.errors?.[0]?.message
    assert.fail(`${path}: HTTP ${response.status}, esperado ${wanted}. ${message ?? ''}`)
  }
  return response
}

async function json<T>(response: Response, wanted: number) {
  return (await expect(response, wanted)).json() as Promise<T>
}
const selected = (colecao: Section, doc: Doc) => ({ colecao, id: doc.id })
const publication = (...registros: ReturnType<typeof selected>[]) => ({ ambiente: 'dev', acao: 'publicar', registros })
const request = (intent: object, actor?: Session, key = randomBytes(12).toString('hex'), target = admin) =>
  api('publicacoes/solicitar', actor, 'POST', intent, target, key)
const enqueue = async (intent: object, actor = geral) => json<Enqueued>(await request(intent, actor), 202)
const repeat = async (job: Enqueued) => expect(await api(`publicacoes/${job.id}/repetir`, geral, 'POST'), 202)
const storedJob = async (job: Enqueued) => (await mediaPool(payload).query<Row>('SELECT estado, erro, tentativas FROM publicacoes WHERE id = $1', [job.id])).rows[0]

async function write(path: string, user: Session, data: object, update = false) {
  return (await json<{ doc: Doc }>(await api(path, user, update ? 'PATCH' : 'POST', data), update ? 200 : 201)).doc
}

async function signIn(email: string, pass: string, target = admin) {
  return json<Session>(await api('users/login', undefined, 'POST', { email, password: pass }, target), 200)
}

async function asset(user: Session, tipo: 'imagem' | 'video', bytes: Buffer): Promise<Asset> {
  const reservation = await json<Asset>(await api('midias/reserva', user, 'POST', {
    arquivo: tipo === 'imagem' ? 'imagem-ficticia.png' : 'video-ficticio.mp4', tipo, tamanho: bytes.length,
  }), 201)
  await expect(await api(`midias/${reservation.uuid}/envio`, user, 'PUT', bytes), 202)
  await workOnce(payload)
  return json<Asset>(await api(`midias/${reservation.id}`, user), 200)
}

const metadata = async () => {
  const value = await currentStore.pointer()
  assert.ok(value)
  return value
}
const publicBytes = async (path: string) =>
  Buffer.from(await (await expect(await fetch(`${demo}/${path}`), 200)).arrayBuffer())
const load = () => loadPublication(publicBytes, 'dev')
async function run(expected = 'publicado') {
  const result = await publishOnce(payload)
  assert.equal(result?.status, expected, JSON.stringify(result))
  if (result && 'rssKiB' in result) console.info('MEDICAO_PUBLICACAO', JSON.stringify(result))
  return result
}
const expire = (job: Enqueued) =>
  mediaPool(payload).query("UPDATE publicacoes SET expira = now() - interval '1 second' WHERE id = $1", [job.id])

before(async () => {
  payload = await getPayload({ config })
  assert.equal((await payload.count({ collection: 'publicacoes', overrideAccess: true })).totalDocs, 0)
  dir = await mkdtemp(join(tmpdir(), 'ospapas-test-publicacao-'))
  bundle = join(dir, 'bundle')
  await cp('.next/standalone', bundle, { recursive: true })
  await cp('.next/static', join(bundle, '.next/static'), { recursive: true })
  const hosted = await start(['server.js'], 'PORT')
  server = hosted.processHandle
  admin = hosted.base
  demo = (await start(['scripts/publication-demo.ts'], 'POC_PUBLIC_PORT')).base
  geral = await signIn(process.env.POC_ADMIN_EMAIL!, process.env.POC_ADMIN_PASSWORD!)
  const suffix = randomBytes(5).toString('hex')
  dfUnit = await write('regionais', geral, {
    nome: 'Sede Brasília fictícia', slug: `pub-brasilia-${suffix}`, tipo: 'regional',
    whatsapp: '+55 61 0000-0000', localizacao: 'https://example.invalid/sede', ordem: 2,
  })
  rjUnit = await write('regionais', geral, {
    nome: 'Sede Rio fictícia', slug: `pub-rio-${suffix}`, tipo: 'regional', ordem: 1,
  })
  const createUser = async (name: string, unit: Doc) => {
    const email = `pub-${name}-${suffix}@example.invalid`
    await write('users', geral, { email, password, perfil: 'regional', regional: unit.id })
    return signIn(email, password)
  }
  df = await createUser('brasilia', dfUnit)
  rj = await createUser('rio', rjUnit)
  member = await write('membros', df, { titulo: 'Integrante fictício', patente: 'Cardeal' })
  otherMember = await write('membros', rj, { titulo: 'Integrante Rio original' })
  inactive = await write('membros', df, { titulo: 'Membro inativo fora da release', ativo: false })
  const dfPeer = await createUser('brasilia-outro', dfUnit)
  await write('membros', dfPeer, { titulo: 'Rascunho de outro operador não selecionado' })
  director = await write('diretoria', geral, { nomePublico: 'Diretora fictícia', membro: member.id })
  agenda = await write('agenda', df, { titulo: 'Agenda aprovada Brasília', _status: 'published' })
  draft = await write('agenda?draft=true', df, { titulo: 'Agenda em rascunho sigilosa', _status: 'draft' })
  const pixels = (background: string) => sharp({ create: { width: 120, height: 80, channels: 3, background } }).png().toBuffer()
  cover = await asset(df, 'imagem', await pixels('purple'))
  await expect(await api(`midias/${cover.uuid}/publicar`, df, 'POST', { alt: 'Retângulo roxo fictício' }), 200)
  const privateAsset = await asset(df, 'imagem', await pixels('orange'))
  privateEvent = await write('eventos', df, { titulo: 'Evento com capa privada', capaMidia: privateAsset.id })
  const footage = join(dir, 'fixture.mp4')
  await exec('ffmpeg', [
    '-nostdin', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=320x240:rate=12',
    '-t', '1', '-threads', '2', '-pix_fmt', 'yuv420p', '-c:v', 'libx264', footage,
  ])
  video = await asset(df, 'video', await readFile(footage))
  await expect(await api(`midias/${video.uuid}/poster`, df, 'POST', { imagem: cover.id }), 200)
  await expect(await api(`midias/${video.uuid}/publicar`, df, 'POST', {}), 200)
  event = await write('eventos', df, { titulo: 'Evento regional fictício', capaMidia: cover.id, videoMidia: video.id })
})

after(async () => {
  await Promise.all([...processes].map(stop))
  closeStorage()
  await payload?.destroy()
  if (dir) await rm(dir, { recursive: true, force: true })
})

test('A API recusa solicitações sem autorização, rascunhos e campos de autoridade', async () => {
  await expect(await request(publication(selected('sedes', dfUnit))), 403)
  await expect(await request(publication(selected('sedes', rjUnit)), df), 403)
  await expect(await request(publication(selected('diretoria', director)), df), 403)
  await expect(await request(publication(selected('agenda', draft)), df), 409)
  await expect(await request(publication(selected('eventos', privateEvent)), df), 409)
  await expect(await request({ ...publication(selected('sedes', dfUnit)), perfil: 'geral', regional: rjUnit.id }, df), 400)
  await expect(await request({ ...publication(selected('sedes', dfUnit)), ambiente: 'prd' }, df), 403)
  await expect(await request({ ambiente: 'dev', acao: 'revogar', alvo: 'a'.repeat(64) }, df), 403)
  await expect(await api('eventos', rj, 'POST', { titulo: 'Referência regional proibida', videoMidia: video.id }), 403)
  assert.equal((await mediaPool(payload).query('SELECT * FROM publicacoes')).rowCount, 0)
  assert.equal(await currentStore.pointer(), null)
  await expect(await fetch(demo + '/'), 503)
})

test('Seleção regional autorizada gera JSON tipado e mídia aprovada, sem outros rascunhos', async () => {
  await enqueue(publication(selected('sedes', rjUnit), selected('membros', otherMember), selected('diretoria', director)))
  await run()
  firstRegion = await enqueue(publication(
    selected('sedes', dfUnit), selected('membros', member), selected('membros', inactive), selected('agenda', agenda), selected('eventos', event),
  ), df)
  assert.equal((await storedJob(firstRegion)).estado, 'pendente')
  await write(`membros/${member.id}`, df, { titulo: 'Alteração posterior ainda sem aprovação' }, true)
  await write(`membros/${otherMember.id}`, rj, { titulo: 'Alteração do Rio ainda sem aprovação' }, true)
  await write(`agenda/${agenda.id}?draft=true`, df, { titulo: 'Revisão da agenda em rascunho', _status: 'draft' }, true)
  await run()
  const { snapshot, release } = await load()
  assert.equal(release, firstRegion.release)
  assert.deepEqual(snapshot.sedes.map(unit => unit.ordem), [1, 2])
  assert.deepEqual(snapshot.membros.map(row => row.nome), ['Integrante Rio original', 'Integrante fictício'])
  assert.equal(snapshot.agenda[0].titulo, 'Agenda aprovada Brasília')
  assert.deepEqual(Object.keys(snapshot.diretoria[0]).sort(), ['id', 'nome', 'regional'])
  assert.deepEqual(Object.keys(snapshot.membros[0]).sort(), ['id', 'nome', 'patente', 'regional'])
  const serialized = JSON.stringify(snapshot)
  assert.doesNotMatch(serialized, /@example|hash|session|privado\/|capaMidia|videoMidia|expira|operador|regional_id|Rascunho|sem aprovação/i)
  const media = snapshot.eventos[0]
  assert.ok(media.video && media.capa)
  assert.equal(media.capa.arquivo, media.video.poster.arquivo)
  assert.equal(hash(await publicBytes(media.video.arquivo)), media.video.arquivo.split('/')[1].split('.')[0])
  assert.equal(hash(await publicBytes(media.capa.arquivo)), media.capa.arquivo.split('/')[1].split('.')[0])
  await expect(await fetch(demo + '/privado/originais/' + cover.uuid), 404)
  await expect(await fetch(demo + '/privado/derivados/' + cover.uuid + '/1/otimizado'), 404)
  const html = (await publicBytes('')).toString()
  assert.match(html, /Diretora fictícia.*Sede Brasília fictícia.*55 61 0000-0000.*Integrante fictício.*Agenda aprovada Brasília/s)
  assert.equal((await storedJob(firstRegion)).estado, 'publicado')
})

test('Duplicatas concorrentes enfileiram uma intenção e o trabalhador serializa jobs', async () => {
  const key = randomBytes(12).toString('hex')
  const intent = publication(selected('membros', member))
  const accepted = await Promise.all([
    request(intent, df, key).then(response => json<Enqueued>(response, 202)),
    request(intent, df, key).then(response => json<Enqueued>(response, 202)),
  ])
  assert.deepEqual(accepted[0], accepted[1])
  await expect(await request(publication(selected('agenda', agenda)), df, key), 409)
  const third = await enqueue(publication(selected('membros', otherMember)), rj)
  const result = await Promise.all([publishOnce(payload), publishOnce(payload)])
  assert.equal(result.filter(outcome => outcome?.status === 'publicado').length, 1)
  await run()
  assert.equal((await storedJob(third)).estado, 'publicado')
  assert.deepEqual((await load()).snapshot.membros.map(row => row.nome), [
    'Alteração do Rio ainda sem aprovação', 'Alteração posterior ainda sem aprovação',
  ])
})

test('Consumidor fixa a release em obediência ao manifesto durante uma ativação concorrente', async () => {
  const prior = await load()
  await write(`membros/${member.id}`, df, { titulo: 'Nome da nova release' }, true)
  const next = await enqueue(publication(selected('membros', member)), df)
  let switched = false
  const pinned = await loadPublication(async key => {
    const bytes = await publicBytes(key)
    if (key === 'manifest.json' && !switched) {
      switched = true
      await run()
    }
    return bytes
  }, 'dev')
  assert.deepEqual(pinned, prior)
  const fresh = await load()
  assert.equal(fresh.release, next.release)
  assert.match((await publicBytes('')).toString(), /Nome da nova release/)
})

test('Falha de preparo preserva release ativa, esconde objetos incompletos e permite repetição', async () => {
  const old = await metadata()
  const before = await load()
  const pending = await enqueue(publication(selected('eventos', event)), df)
  const storageBefore = await storage().client.send(new ListObjectsV2Command({ Bucket: currentStore.buckets.media }))
  const failed = await publishOnce(payload, 'dev', { beforeActivate: async () => { throw new Error('Falha fictícia de preparo.') } })
  assert.equal(failed?.status, 'falhou')
  assert.equal((await storedJob(pending)).estado, 'falhou')
  assert.deepEqual(await metadata(), old)
  assert.deepEqual(await load(), before)
  const manifest = fileKey(pending.release, 'manifest')
  assert.ok((await currentStore.read('releases', manifest)).bytes.length > 0)
  await expect(await fetch(demo + '/' + manifest), 404)
  await repeat(pending)
  const retry = await run()
  assert.ok(retry && 'reused' in retry && typeof retry.reused === 'number' && retry.reused >= 6)
  const storageAfter = await storage().client.send(new ListObjectsV2Command({ Bucket: currentStore.buckets.media }))
  assert.deepEqual(storageAfter.Contents, storageBefore.Contents)
  assert.equal((await storedJob(pending)).estado, 'publicado')
})

test('Ausência de derivado ou retirada de aprovação do pôster impede a ativação', async () => {
  const old = await metadata()
  const pending = await enqueue(publication(selected('eventos', event)), df)
  await mediaPool(payload).query('UPDATE midias SET publicado = false WHERE id = $1', [cover.id])
  await run('falhou')
  assert.equal((await storedJob(pending)).erro, 'midia_invalida')
  await mediaPool(payload).query('UPDATE midias SET publicado = true WHERE id = $1', [cover.id])
  assert.deepEqual(await metadata(), old)
  const saved = await fetchObject(cover.otimizado)
  const backup = join(dir, 'backup.webp')
  await writeFile(backup, Buffer.from(await saved.Body!.transformToByteArray()))
  await storage().client.send(new DeleteObjectCommand({ Bucket: storage().bucket, Key: cover.otimizado }))
  await repeat(pending)
  await run('falhou')
  assert.equal((await storedJob(pending)).erro, 'midia_ausente')
  assert.deepEqual(await metadata(), old)
  const active = await load()
  assert.ok((await publicBytes(active.snapshot.eventos[0].capa!.arquivo)).length)
  await storeFile(cover.otimizado, backup, 'image/webp')
  await repeat(pending)
  await run()
})

test('CAS rejeita ETag divergente e jobs antigos não substituem uma release mais nova', async () => {
  const job = await enqueue(publication(selected('membros', member)), df)
  const before = await metadata()
  const rejected = await publishOnce(payload, 'dev', { beforeActivate: async () => {
    await currentStore.activate(jsonBytes({ ...before.value, ativadaEm: '2000-01-01T00:00:00.000Z' }), before.etag)
  } })
  assert.equal(rejected?.status, 'falhou')
  assert.equal((await storedJob(job)).erro, 'conflito_manifesto')
  assert.equal((await metadata()).value.ativa.id, before.value.ativa.id)
  const newer = await enqueue(publication(selected('membros', otherMember)), rj)
  await run()
  await repeat(job)
  await run('falhou')
  assert.equal((await storedJob(job)).erro, 'release_obsoleta')
  assert.equal((await load()).release, newer.release)
})

test('A retomada recupera o estado se a ativação já aconteceu antes da interrupção', async () => {
  const job = await enqueue(publication(selected('membros', member)), df)
  const interrupted = await publishOnce(payload, 'dev', { afterActivate: async () => {
    throw new Error('Gravação de estado interrompida no teste.')
  } })
  assert.equal(interrupted?.status, 'processando')
  const active = await metadata()
  assert.equal(active.value.ativa.id, job.release)
  assert.equal((await storedJob(job)).estado, 'processando')
  const successor = await enqueue(publication(selected('membros', member)), df)
  assert.equal(await publishOnce(payload), undefined)
  await expire(job)
  await run('reconciliado')
  assert.deepEqual(await metadata(), active)
  assert.equal((await storedJob(job)).estado, 'publicado')
  await run()
  assert.equal((await load()).release, successor.release)
})

test('Depois de encerrar o worker em execução, o próximo recupera a lease vencida', async () => {
  const job = await enqueue(publication(selected('membros', member)), df)
  const before = await metadata()
  const child = spawn(process.execPath, ['--input-type=module', '-e', `
    import { getPayload } from 'payload'
    import config from './src/payload.config.ts'
    import { publishOnce } from './src/publication/worker.ts'
    const payload = await getPayload({ config })
    await publishOnce(payload, 'dev', { beforeActivate: async () => {
      console.info('TESTE_RELEASE_PREPARADA')
      await new Promise(resolve => setTimeout(resolve, 30000))
    } })
  `], { stdio: ['ignore', 'pipe', 'ignore'] })
  const ended = once(child, 'exit')
  try {
    let text = ''
    const prepared = (async () => {
      for await (const chunk of child.stdout) {
        text += String(chunk)
        if (text.includes('TESTE_RELEASE_PREPARADA')) return true
      }
      return false
    })()
    assert.equal(await Promise.race([prepared, delay(15_000, false, { ref: false })]), true)
    assert.equal((await storedJob(job)).estado, 'processando')
  } finally {
    child.kill('SIGKILL')
    await ended
  }
  assert.deepEqual(await metadata(), before)
  await expire(job)
  await run()
  assert.equal((await load()).release, job.release)
})

test('Rollback autorizado produz nova revisão e revogação bloqueia releases históricas e objetos', async () => {
  const current = await metadata()
  const old = current.value.anteriores[0]
  assert.ok(old)
  await expect(await request({ ambiente: 'dev', acao: 'restaurar', release: old.id }, df), 403)
  const rollback = await enqueue({ ambiente: 'dev', acao: 'restaurar', release: old.id })
  await run()
  const restored = await load()
  assert.equal(restored.release, rollback.release)
  const key = restored.snapshot.eventos[0].capa!.arquivo
  const revoked = await enqueue({ ambiente: 'dev', acao: 'revogar', alvo: key })
  await run()
  const fresh = await load()
  assert.equal(fresh.release, revoked.release)
  assert.deepEqual(fresh.snapshot.eventos, [])
  await expect(await fetch(demo + '/' + key), 404)
  await expect(await fetch(demo + '/' + fileKey(rollback.release, 'eventos')), 404)
  const denied = await enqueue({ ambiente: 'dev', acao: 'restaurar', release: rollback.release })
  await run('falhou')
  assert.equal((await storedJob(denied)).erro, 'restauracao_indisponivel')
  const republish = await enqueue(publication(selected('eventos', event)), df)
  await run('falhou')
  assert.equal((await storedJob(republish)).erro, 'conteudo_revogado')
  assert.equal((await load()).release, revoked.release)
})

test('HML e PRD usam destinos separados e não aceitam o ambiente de outro perfil', async () => {
  const hmlStore = new ReleaseStore('hml')
  const prdStore = new ReleaseStore('prd')
  await hmlStore.prepare()
  await prdStore.prepare()
  const dev = await metadata()
  const hml = await start(['server.js'], 'PORT', 'hml')
  const hmlUser = await signIn(process.env.POC_ADMIN_EMAIL!, process.env.POC_ADMIN_PASSWORD!, hml.base)
  await expect(await request(publication(selected('diretoria', director)), hmlUser, undefined, hml.base), 403)
  await expect(await request({ ...publication(selected('diretoria', director)), ambiente: 'prd' }, hmlUser, undefined, hml.base), 403)
  const accepted = await json<Enqueued>(await request({
    ...publication(selected('diretoria', director)), ambiente: 'hml',
  }, hmlUser, undefined, hml.base), 202)
  await assert.rejects(() => publishOnce(payload, 'hml'))
  assert.equal(await hmlStore.pointer(), null)
  process.env.POC_PUBLIC_ENV = 'hml'
  try {
    await assert.rejects(() => publishOnce(payload, 'prd'))
    await run()
  } finally {
    process.env.POC_PUBLIC_ENV = 'dev'
  }
  assert.equal((await hmlStore.pointer())?.value.ativa.id, accepted.release)
  assert.equal(await prdStore.pointer(), null)
  assert.deepEqual(await metadata(), dev)
  await stop(hml.processHandle)
})

test('Consumidor independente mantém leitura durante queda administrativa e rejeita manifestos inválidos', async () => {
  await stop(server)
  await assert.rejects(fetch(admin + '/healthz'))
  const current = await metadata()
  const html = await publicBytes('')
  assert.match(html.toString(), /Diretora fictícia/)
  for (const invalid of [Buffer.from('{'), jsonBytes({ ...current.value, versao: 99 })]) {
    const raw = await currentStore.read('releases', 'manifest.json')
    await currentStore.activate(invalid, raw.etag)
    await expect(await fetch(demo + '/'), 503)
    const broken = await currentStore.read('releases', 'manifest.json')
    await currentStore.activate(jsonBytes(current.value), broken.etag)
  }
  assert.deepEqual(await publicBytes(''), html)
})
