import { assertDisposableDatabase } from '../src/experimental.ts'
import assert from 'node:assert/strict'
import { execFile, spawn, type ChildProcess } from 'node:child_process'
import { createHash, randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { cp, mkdtemp, readFile, readdir, rm, utimes, writeFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import { promisify } from 'node:util'
import { createLocalReq, getPayload, type Payload } from 'payload'
import sharp from 'sharp'
import config from '../src/payload.config.ts'
import { mediaPool, MiB, originalKey, limits } from '../src/media/model.ts'
import { closeStorage, fetchObject, storeFile } from '../src/media/storage.ts'

type Doc = { id: number; [field: string]: unknown }
type Session = { token: string }
type Stored = {
  uuid: string; id: number; fase: string; origem: string; otimizado: string; miniatura: string; poster: string
  largura: number | string; altura: number | string; publicado: boolean; tentativa: string | number
  alt: string | null; digest: string; posterior: string | null
}

const exec = promisify(execFile)
const suffix = randomBytes(4).toString('hex')
const password = randomBytes(24).toString('hex')
assert.ok(process.env.POC_ADMIN_EMAIL && process.env.POC_ADMIN_PASSWORD)

let payload: Payload
let dir: string
let server: ChildProcess | undefined
let base: string
let geral: Session
let df: Session
let df2: Session
let rj: Session
let dfUnit: Doc
let rjUnit: Doc
let jpeg: Buffer
let png: Buffer
let image: Stored
let replacement: Stored
let foreign: Stored
let approvedPoster: Stored
let video: Stored
let footage: Buffer

async function api(path: string, session?: Session, method = 'GET', data?: object | Buffer, extra: HeadersInit = {}) {
  const headers = new Headers(extra)
  if (session) headers.set('Authorization', `JWT ${session.token}`)
  if (data) headers.set('Content-Type', Buffer.isBuffer(data) ? 'application/octet-stream' : 'application/json')
  return fetch(base + '/api/' + path, {
    method, headers, body: Buffer.isBuffer(data) ? new Uint8Array(data) : data ? JSON.stringify(data) : undefined,
    signal: AbortSignal.timeout(30_000),
  })
}

async function status(response: Response, expected: number[]) {
  if (!expected.includes(response.status)) {
    const error = (await response.json().catch(() => null))?.errors?.[0]?.message
    assert.fail(`${response.status} em ${new URL(response.url).pathname}. Esperado ${expected.join(',')}. ${error ?? ''}`)
  }
  return response
}

async function json<T>(response: Response, expected = 200) {
  return (await status(response, [expected])).json() as Promise<T>
}

async function login(email: string, pass = password) {
  return json<Session>(await api('users/login', undefined, 'POST', { email, password: pass }))
}

async function write(path: string, session: Session, data: object, draft = false) {
  return (await json<{ doc: Doc }>(await api(path, session, draft ? 'PATCH' : 'POST', data), draft ? 200 : 201)).doc
}

async function reserve(session: Session, arquivo: string, tamanho: number, tipo = 'imagem') {
  return json<Stored>(await api('midias/reserva', session, 'POST', { arquivo, tipo, tamanho }), 201)
}

async function upload(session: Session, asset: Stored, contents: Buffer) {
  await status(await api(`midias/${asset.uuid}/envio`, session, 'PUT', contents), [202])
  return asset
}

async function persisted(asset: Stored) {
  const { rows: [row] } = await mediaPool(payload).query<Stored>('SELECT * FROM midias WHERE id = $1', [asset.id])
  assert.ok(row)
  return row
}

async function worker(env: Partial<NodeJS.ProcessEnv> = {}) {
  const result = await exec(process.execPath, ['scripts/media-worker.ts'], {
    env: { ...process.env, TMPDIR: dir, ...env }, timeout: 190_000,
  })
  const metrics = result.stdout.split('\n').filter(line => line.startsWith('{'))
  for (const line of metrics) console.info('MEDICAO', line)
  return metrics
}

async function ready(session: Session, filename: string, bytes: Buffer, tipo = 'imagem') {
  const asset = await upload(session, await reserve(session, filename, bytes.length, tipo), bytes)
  assert.equal((await persisted(asset)).fase, 'pendente')
  assert.equal((await worker()).length, 1)
  const row = await persisted(asset)
  assert.equal(row.fase, 'pronta')
  return row
}

const download = (asset: Stored, session?: Session, kind = 'otimizado', headers?: HeadersInit) =>
  api(`midias/${asset.uuid}/arquivo/${kind}`, session, 'GET', undefined, headers)

async function readAsset(asset: Stored, session: Session, kind = 'otimizado') {
  return Buffer.from(await (await status(await download(asset, session, kind), [200])).arrayBuffer())
}

const hash = (data: Buffer) => createHash('sha256').update(data).digest('hex')

before(async () => {
  await assertDisposableDatabase()
  payload = await getPayload({ config })
  assert.equal((await payload.count({ collection: 'midias', overrideAccess: true })).totalDocs, 0, 'Prepare um banco de teste sem mídias.')
  dir = await mkdtemp(join(tmpdir(), 'ospapas-teste-midia-'))
  const bundle = join(dir, 'bundle')
  await cp('.next/standalone', bundle, { recursive: true })
  await cp('.next/static', join(bundle, '.next/static'), { recursive: true })
  const listener = createServer().listen(0, '127.0.0.1')
  await once(listener, 'listening')
  const address = listener.address()
  assert.ok(address && typeof address === 'object')
  const port = address.port
  await new Promise<void>((resolve, reject) => listener.close(error => error ? reject(error) : resolve()))
  base = `http://127.0.0.1:${port}`
  const runtime: NodeJS.ProcessEnv = { ...process.env, TMPDIR: dir, NODE_ENV: 'production', PORT: String(port), HOSTNAME: '127.0.0.1' }
  delete runtime.POC_ADMIN_EMAIL
  delete runtime.POC_ADMIN_PASSWORD
  delete runtime.POC_PREPARE_SCHEMA
  server = spawn(process.execPath, ['server.js'], { cwd: bundle, env: runtime, stdio: 'ignore' })
  for (let attempt = 0; ; attempt++) {
    assert.ok(attempt < 80 && server.exitCode === null, 'O servidor standalone não respondeu.')
    const response = await fetch(base + '/healthz').catch(() => undefined)
    if (response?.ok) {
      assert.deepEqual(await response.json(), { status: 'ok' })
      break
    }
    await delay(100)
  }

  geral = await login(process.env.POC_ADMIN_EMAIL!, process.env.POC_ADMIN_PASSWORD!)
  dfUnit = await write('regionais', geral, { nome: 'Brasília mídias fictícias', tipo: 'regional', slug: `df-midia-${suffix}` })
  rjUnit = await write('regionais', geral, { nome: 'Rio mídias fictícias', tipo: 'regional', slug: `rj-midia-${suffix}` })
  for (const [name, regional] of [['df', dfUnit.id], ['df2', dfUnit.id], ['rj', rjUnit.id]] as const) {
    await write('users', geral, { email: `${name}-m-${suffix}@example.invalid`, password, perfil: 'regional', regional })
  }
  df = await login(`df-m-${suffix}@example.invalid`)
  df2 = await login(`df2-m-${suffix}@example.invalid`)
  rj = await login(`rj-m-${suffix}@example.invalid`)
  jpeg = await sharp({ create: { width: 2400, height: 1600, channels: 3, background: 'orange' } })
    .withMetadata({ orientation: 6 }).jpeg().toBuffer()
  png = await sharp({ create: { width: 100, height: 80, channels: 4, background: 'transparent' } }).png().toBuffer()
})

after(async () => {
  if (server && server.exitCode === null && server.signalCode === null) {
    const stopped = once(server, 'exit')
    server.kill()
    await stopped
  }
  closeStorage()
  await payload?.destroy()
  if (dir) await rm(dir, { recursive: true, force: true })
})

test('Reserva autenticada deriva ownership e protege metadados e envio', async () => {
  await status(await api('midias/reserva', undefined, 'POST', { arquivo: 'imagem.jpg', tipo: 'imagem', tamanho: jpeg.length }), [403])
  await status(await api('midias/reserva', df, 'POST', { arquivo: 'imagem.jpg', tipo: 'imagem', tamanho: jpeg.length, regional: rjUnit.id }), [403])
  await status(await api('midias/reserva', df, 'POST', { arquivo: 'imagem.jpg', tipo: 'imagem', tamanho: jpeg.length, origem: 'arbitrario' }), [403])
  const asset = await reserve(df, 'rotacao.jpg', jpeg.length)
  const metadata = await json<Doc>(await api(`midias/${asset.id}?depth=0`, df))
  assert.equal(metadata.regional, dfUnit.id)
  assert.equal(metadata.fase, 'reservada')
  await status(await api(`midias/${asset.uuid}/publicar`, df, 'POST', { alt: 'Descrição fictícia' }), [409])
  await status(await api(`midias/${asset.uuid}/envio`, df2, 'PUT', jpeg), [403])
  await status(await api(`midias/${asset.uuid}/envio`, rj, 'PUT', jpeg), [404])
  await status(await api(`midias/${asset.id}`, df, 'PATCH', { origem: 'outra', regional: rjUnit.id, fase: 'pronta' }), [403, 404])
  await assert.rejects(fetchObject(originalKey(asset.uuid)))
  assert.equal((await persisted(asset)).fase, 'reservada')
  await upload(df, asset, jpeg)
  image = await persisted(asset)
})

test('Upload de uso único, otimização JPEG orientada e idempotência', async () => {
  await status(await api(`midias/${image.uuid}/envio`, df, 'PUT', Buffer.alloc(jpeg.length, 2)), [409])
  const original = await fetchObject(image.origem)
  assert.equal(hash(Buffer.from(await original.Body!.transformToByteArray())), hash(jpeg))
  const originalFile = join(dir, 'verifica-objeto.jpg')
  await writeFile(originalFile, jpeg)
  await assert.rejects(storeFile(image.origem, originalFile, 'image/jpeg'))
  const batches = await Promise.all([worker(), worker()])
  assert.equal(batches.flat().length, 1)
  image = await persisted(image)
  assert.equal(image.fase, 'pronta')
  const optimized = await sharp(await readAsset(image, df)).metadata()
  const thumb = await sharp(await readAsset(image, df, 'miniatura')).metadata()
  assert.equal(optimized.format, 'webp')
  assert.deepEqual([optimized.width, optimized.height, optimized.orientation, optimized.exif], [1280, 1920, undefined, undefined])
  assert.deepEqual([thumb.width, thumb.height], [213, 320])
  assert.equal((await worker()).length, 0)
  assert.deepEqual(await persisted(image), image)
})

test('Mídia e miniatura privadas exigem autenticação e escopo mesmo em rascunho', async () => {
  for (const kind of ['otimizado', 'miniatura']) {
    await status(await download(image, undefined, kind), [403])
    await status(await download(image, rj, kind), [404])
    assert.ok((await readAsset(image, df2, kind)).length > 0)
    assert.ok((await readAsset(image, geral, kind)).length > 0)
  }
  await status(await api(`midias/${image.id}?depth=2`, rj), [403, 404])
  const headers = new Headers({ Authorization: `JWT ${rj.token}` })
  const { user } = await payload.auth({ headers })
  assert.ok(user)
  const req = await createLocalReq({ user, req: { headers } }, payload)
  await assert.rejects(payload.findByID({ collection: 'midias', id: image.id, req, depth: 2, overrideAccess: false }))
  await assert.rejects(payload.update({
    collection: 'midias', id: image.id, req, overrideAccess: false, data: { origem: 'arbitraria' },
  }))
  await status(await api(`midias/${image.id}`, rj, 'DELETE'), [403, 404])
  await status(await api(`midias/${image.uuid}/publicar`, df, 'POST', { alt: '  ' }), [400])
  assert.equal((await persisted(image)).publicado, false)
  const response = await status(await download(image, df), [200])
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  await response.body?.cancel()
})

test('Limites de tamanho e tipos incompatíveis são rejeitados sem gravar objeto', async () => {
  for (const [tipo, tamanho] of [['imagem', limits.imagem + 1], ['video', limits.video + 1]] as const) {
    await status(await api('midias/reserva', df2, 'POST', { tipo, arquivo: 'grande.bin', tamanho }), [413])
  }
  const asset = await reserve(df2, 'invalida.jpg', 64)
  await status(await api(`midias/${asset.uuid}/envio`, df2, 'PUT', Buffer.alloc(65)), [413])
  assert.equal((await persisted(asset)).fase, 'reservada')
  await status(await api(`midias/${asset.uuid}/envio`, df2, 'PUT', Buffer.alloc(64)), [415])
  assert.equal((await persisted(asset)).fase, 'falhou')
  await assert.rejects(fetchObject(originalKey(asset.uuid)))
})

test('Limite de decodificação impede imagem de 36 MP e prévias permanecem fechadas', async () => {
  const pixels = await sharp({ create: { width: 6000, height: 6000, channels: 3, background: 'blue' } }).png().toBuffer()
  const asset = await upload(df2, await reserve(df2, 'mega.png', pixels.length), pixels)
  assert.equal((await worker()).length, 0)
  const row = await persisted(asset)
  assert.equal(row.fase, 'falhou')
  assert.equal(row.otimizado, null)
  await status(await download(row, df2), [404])
  const input = await fetchObject(row.origem)
  assert.equal(input.ContentLength, pixels.length)
  await input.Body?.transformToByteArray()
})

test('PNG transparente mantém alfa, proporção e dimensões sem ampliar', async () => {
  replacement = await ready(df, 'transparente.png', png)
  foreign = await ready(rj, 'outra-regional.png', png)
  const meta = await sharp(await readAsset(replacement, df)).metadata()
  assert.deepEqual([meta.width, meta.height, meta.hasAlpha], [100, 80, true])
})

test('Vídeo MOV sintético é convertido e pós-validado como H.264/AAC para reprodução progressiva', async () => {
  const movie = join(dir, 'amostra.mov')
  await exec('ffmpeg', [
    '-nostdin', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=24',
    '-f', 'lavfi', '-i', 'sine=frequency=440', '-t', '4', '-threads', '2', '-c:v', 'mpeg4', '-q:v', '3',
    '-c:a', 'pcm_s16le', movie,
  ])
  footage = await readFile(movie)
  video = await ready(df, 'amostra.mov', footage, 'video')
  const bytes = await readAsset(video, df)
  const file = join(dir, 'verifica.mp4')
  await writeFile(file, bytes)
  const { stdout } = await exec('ffprobe', ['-v', 'error', '-show_streams', '-of', 'json', file])
  const streams = JSON.parse(stdout).streams
  assert.deepEqual(streams.map((stream: { codec_name: string }) => stream.codec_name), ['h264', 'aac'])
  assert.deepEqual([streams[0].width, streams[0].height], [1920, 1080])
  assert.ok(bytes.indexOf('moov') >= 0 && bytes.indexOf('moov') < bytes.indexOf('mdat'))
  const ranged = await status(await download(video, df, 'otimizado', { range: 'bytes=0-31' }), [206])
  assert.equal((await ranged.arrayBuffer()).byteLength, 32)
  const poster = await sharp(await readAsset(video, df, 'poster')).metadata()
  assert.deepEqual([poster.width, poster.height], [640, 360])
})

test('MP4 compatível é remultiplexado sem recodificar o fluxo de vídeo', async () => {
  const source = await readAsset(video, df)
  const asset = await upload(df2, await reserve(df2, 'compativel.mp4', source.length, 'video'), source)
  const measures = await worker()
  assert.equal(JSON.parse(measures[0]).modo, 'remux')
  assert.equal((await persisted(asset)).fase, 'pronta')
  assert.equal(Number((await persisted(asset)).largura), 1920)
  await status(await api(`midias/${asset.uuid}/publicar`, df2, 'POST', {}), [200])
})

test('Seleção de instante troca apenas o pôster; imagem personalizada respeita titularidade', async () => {
  const first = await readAsset(video, df, 'poster')
  const immutable = video.otimizado
  await status(await api(`midias/${video.uuid}/poster`, df, 'POST', { segundo: 2 }), [202])
  assert.equal((await worker()).length, 1)
  video = await persisted(video)
  assert.equal(video.otimizado, immutable)
  assert.notEqual(hash(await readAsset(video, df, 'poster')), hash(first))
  await status(await api(`midias/${video.uuid}/poster`, df, 'POST', { imagem: foreign.id }), [403])
  assert.deepEqual(await persisted(video), video)
  await status(await api(`midias/${video.uuid}/poster`, df, 'POST', { imagem: replacement.id }), [200])
  assert.equal(hash(await readAsset(video, df, 'poster')), hash(await readAsset(replacement, df)))
  await status(await download(video, rj, 'poster'), [404])
  await status(await api(`midias/${video.uuid}/publicar`, df, 'POST', {}), [409])
  assert.equal((await persisted(video)).publicado, false)
})

async function persistLegacyMediaFixture(statement: string, values: unknown[]) {
  const client = await mediaPool(payload).connect()
  try {
    await client.query('BEGIN')
    await client.query("SET LOCAL session_replication_role = 'replica'")
    await client.query(statement, values)
    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

test('Publicação e leitura de pôster publicado recusam imagens inválidas ou fora do âmbito', async () => {
  approvedPoster = await ready(df2, 'poster-autorizado.png', png)
  await status(await api(`midias/${approvedPoster.uuid}/publicar`, df2, 'POST', { alt: 'Retângulo transparente de teste' }), [200])
  approvedPoster = await persisted(approvedPoster)
  await status(await api(`midias/${foreign.uuid}/publicar`, rj, 'POST', { alt: 'Imagem fictícia do Rio' }), [200])

  const pool = mediaPool(payload)
  const candidates = [
    { id: 2_000_000_000 },
    { id: replacement.id },
    { id: foreign.id },
    { id: video.id },
    { id: approvedPoster.id, phase: 'falhou' },
    { id: approvedPoster.id, invalidDigest: true },
    { id: approvedPoster.id, missingDerivative: true },
    { id: approvedPoster.id, alt: '  ' },
    { id: approvedPoster.id, alt: String.fromCodePoint(0x200B) },
    { id: approvedPoster.id, alt: 'a'.repeat(251) },
  ]
  try {
    for (const candidate of candidates) {
      // Estados legados de teste são gravados diretamente; as recusas usam a aplicação.
      await pool.query(`
        UPDATE midias SET fase = $2, digest = $3, otimizado = $4, alt = $5 WHERE id = $1
      `, [approvedPoster.id, candidate.phase ?? 'pronta', candidate.invalidDigest ? null : approvedPoster.digest,
        candidate.missingDerivative ? null : approvedPoster.otimizado, candidate.alt ?? approvedPoster.alt])
      await persistLegacyMediaFixture('UPDATE midias SET posterior = $2, publicado = false WHERE id = $1', [video.id, candidate.id])
      const beforeAttempt = await persisted(video)
      await status(await api(`midias/${video.uuid}/publicar`, df, 'POST', {}), [409])
      if (candidate.id === foreign.id) {
        await status(await api(`midias/${video.uuid}/publicar`, geral, 'POST', {}), [409])
      }
      assert.deepEqual(await persisted(video), beforeAttempt)
      await pool.query('UPDATE midias SET publicado = true WHERE id = $1', [video.id])
      await status(await download(video, df, 'poster'), [403, 404])
    }
  } finally {
    await pool.query("UPDATE midias SET fase = 'pronta', digest = $2, otimizado = $3, alt = $4 WHERE id = $1",
      [approvedPoster.id, approvedPoster.digest, approvedPoster.otimizado, approvedPoster.alt])
    await persistLegacyMediaFixture('UPDATE midias SET posterior = $2, publicado = false WHERE id = $1', [video.id, approvedPoster.id])
  }
})

test('Publicação concorrente revalida a seleção e a aprovação depois das travas', async () => {
  const pool = mediaPool(payload)
  const changes = [
    { sql: 'UPDATE midias SET posterior = $2 WHERE id = $1', values: [video.id, replacement.id] },
    { sql: 'UPDATE midias SET publicado = false WHERE id = $1', values: [approvedPoster.id] },
  ]
  for (const change of changes) {
    const holder = await pool.connect()
    let publication: Promise<Response> | undefined
    try {
      await holder.query('BEGIN')
      // O fixture simula um escritor externo legado para manter o ensaio de bloqueios do pôster.
      await holder.query("SET LOCAL session_replication_role = 'replica'")
      const { rows: [{ pid }] } = await holder.query<{ pid: number }>('SELECT pg_backend_pid() AS pid')
      await holder.query(change.sql, change.values)
      publication = api(`midias/${video.uuid}/publicar`, df, 'POST', {})
      for (let attempt = 0; ; attempt++) {
        const { rows: [{ waiting }] } = await pool.query<{ waiting: boolean }>(`
          SELECT EXISTS (SELECT 1 FROM pg_stat_activity WHERE $1 = ANY(pg_blocking_pids(pid))) AS waiting
        `, [pid])
        if (waiting) break
        assert.ok(attempt < 150, 'A publicação deveria esperar pela linha alterada.')
        await delay(20)
      }
      await holder.query('COMMIT')
      await status(await publication, [409])
      assert.equal((await persisted(video)).publicado, false)
    } finally {
      await holder.query('ROLLBACK')
      holder.release()
      await publication?.catch(() => undefined)
      await pool.query('UPDATE midias SET posterior = $2 WHERE id = $1', [video.id, approvedPoster.id])
      await pool.query('UPDATE midias SET publicado = true WHERE id = $1', [approvedPoster.id])
    }
  }
})

test('Pôster validado e publicado por outra conta da mesma unidade permite publicar o vídeo', async () => {
  assert.equal(Number((await persisted(video)).posterior), approvedPoster.id)
  await status(await api(`midias/${video.uuid}/publicar`, df, 'POST', {}), [200])
  assert.equal((await persisted(video)).publicado, true)
  assert.equal(hash(await readAsset(video, df, 'poster')), hash(await readAsset(approvedPoster, df)))
  await status(await download(video, undefined, 'poster'), [403])
  await status(await download(video, rj, 'poster'), [404])
  await status(await api(`midias/${video.uuid}/poster`, df, 'POST', { segundo: 1 }), [409])
})

test('Capas estrangeiras são recusadas e rastros publicado, rascunho e versão protegem objetos', async () => {
  await status(await api(`regionais/${dfUnit.id}`, df, 'PATCH', { capaMidia: foreign.id }), [403])
  await status(await api('eventos', df, 'POST', { titulo: 'Vínculo inválido', capaMidia: foreign.id }), [403])
  await status(await api('diretoria', geral, 'POST', { nomePublico: 'Nome fictício', capaMidia: image.id }), [403])
  await status(await api('agenda', df, 'POST', { titulo: 'Mídia em rascunho', _status: 'published', capaMidia: image.id }), [403])
  await status(await api(`midias/${image.uuid}/publicar`, df, 'POST', { alt: 'Retângulo laranja vertical fictício' }), [200])
  const agenda = await write('agenda', df, { titulo: 'Agenda com mídia fictícia', _status: 'published', capaMidia: image.id })
  await write(`agenda/${agenda.id}?draft=true`, df, { titulo: 'Rascunho com substituição', _status: 'draft', capaMidia: replacement.id }, true)
  const current = await json<Doc>(await api(`agenda/${agenda.id}?depth=2`, df))
  assert.equal(current.capaMidia, image.id)
  const draft = await json<Doc>(await api(`agenda/${agenda.id}?draft=true&depth=2`, df))
  assert.equal(draft.capaMidia, replacement.id)
  const bytes = hash(await readAsset(image, df))
  for (const asset of [image, replacement]) await status(await api(`midias/${asset.id}`, df, 'DELETE'), [403, 404])
  await status(await api(`midias/${replacement.uuid}/publicar`, df, 'POST', { alt: 'Imagem transparente de teste' }), [200])
  await write(`agenda/${agenda.id}`, df, { _status: 'published', capaMidia: replacement.id }, true)
  const old = (await json<{ docs: Doc[] }>(await api(`agenda/versions?where[parent][equals]=${agenda.id}&depth=0`, df))).docs
    .find(entry => (entry.version as Doc).capaMidia === image.id)
  assert.ok(old)
  await status(await api(`agenda/versions/${old.id}?draft=true`, rj, 'POST'), [403, 404])
  await status(await api(`midias/${image.id}`, geral, 'DELETE'), [403, 404])
  assert.equal(hash(await readAsset(image, df)), bytes)
  await status(await download(image), [403])
})

test('Trabalho interrompido pode ser retomado; falha temporária e repetição mantêm o original', async () => {
  const asset = await upload(df2, await reserve(df2, 'retentativa.mov', footage.length, 'video'), footage)
  assert.equal((await worker({ POC_FFMPEG: '/caminho-ficticio-inexistente' })).length, 0)
  const failed = await persisted(asset)
  assert.equal(failed.fase, 'falhou')
  assert.equal(Number(failed.tentativa), 1)
  await status(await api(`midias/${asset.uuid}/repetir`, rj, 'POST'), [404])
  await status(await api(`midias/${asset.uuid}/repetir`, df2, 'POST'), [202])
  await status(await api(`midias/${asset.uuid}/repetir`, df2, 'POST'), [409])
  const interrupted = spawn(process.execPath, ['scripts/media-worker.ts'], {
    env: { ...process.env, TMPDIR: dir }, detached: true, stdio: 'ignore',
  })
  const exited = once(interrupted, 'exit')
  try {
    for (let attempt = 0; (await persisted(asset)).fase !== 'processando'; attempt++) {
      assert.ok(attempt < 150 && interrupted.exitCode === null, 'O worker não assumiu o trabalho.')
      await delay(25)
    }
  } finally {
    if (interrupted.pid && interrupted.exitCode === null) process.kill(-interrupted.pid, 'SIGKILL')
    await exited
  }
  assert.equal((await persisted(asset)).fase, 'processando')
  await mediaPool(payload).query("UPDATE midias SET expira = now() - interval '1 second' WHERE id = $1", [asset.id])
  assert.equal((await worker()).length, 1)
  const recovered = await persisted(asset)
  assert.equal(recovered.fase, 'pronta')
  assert.equal(Number(recovered.tentativa), 3)
  assert.equal(recovered.origem, failed.origem)
  const workerDir = (await readdir(dir)).find(name => name.startsWith('ospapas-worker-'))
  assert.ok(workerDir)
  assert.deepEqual(await readdir(join(dir, workerDir)), [])
  const uploadsDir = (await readdir(dir)).find(name => name.startsWith('ospapas-envios-'))
  assert.ok(uploadsDir)
  const abandoned = await mkdtemp(join(dir, uploadsDir, 'envio-'))
  await writeFile(join(abandoned, 'entrada'), 'arquivo parcial fictício')
  const expired = new Date(Date.now() - 11 * 60_000)
  await utimes(abandoned, expired, expired)
  await worker()
  assert.deepEqual(await readdir(join(dir, uploadsDir)), [])
})

test('Cotas reservadas são aplicadas e recuperadas após expiração', async () => {
  const asset = await reserve(rj, 'abandonado.mov', 200 * MiB, 'video')
  const candidate = { arquivo: 'proxima.mov', tipo: 'video', tamanho: 57 * MiB }
  await status(await api('midias/reserva', rj, 'POST', candidate), [409])
  await mediaPool(payload).query("UPDATE midias SET expira = now() - interval '1 second' WHERE id = $1", [asset.id])
  await worker()
  assert.equal((await persisted(asset)).fase, 'falhou')
  await assert.rejects(fetchObject(originalKey(asset.uuid)))
  await status(await api('midias/reserva', rj, 'POST', candidate), [201])
})
