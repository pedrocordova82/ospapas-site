import { randomUUID } from 'node:crypto'
import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { APIError, type Endpoint, type PayloadRequest } from 'payload'
import { actor, deny, relationID, rejectNested } from '../access/policies.ts'
import { detectMedia, receiveBody } from './ingest.ts'
import { limits, mediaPool, originalKey, reservation, temporaryRoot } from './model.ts'
import { fetchObject, removeObject, storeFile } from './storage.ts'

function operator(req: PayloadRequest) {
  const user = actor(req)
  if (!user) deny()
  return user
}

async function body(req: PayloadRequest, keys: string[]): Promise<Record<string, unknown>> {
  const reader = req.body?.getReader()
  if (!reader) return {}
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    for (;;) {
      const next = await reader.read()
      if (next.done) break
      length += next.value.byteLength
      if (length > 8192) {
        await reader.cancel()
        throw new APIError('Metadados grandes demais.', 413)
      }
      chunks.push(next.value)
    }
  } finally {
    reader.releaseLock()
  }
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString())
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error()
    if (Object.keys(parsed).some(key => !keys.includes(key))) deny('Campo de mídia protegido ou desconhecido.')
    return parsed as Record<string, unknown>
  } catch (error) {
    if (error instanceof APIError) throw error
    throw new APIError('Metadados inválidos.', 400)
  }
}

async function scopedMedia(req: PayloadRequest, uuid = req.routeParams?.uuid) {
  operator(req)
  if (typeof uuid !== 'string' || !/^[0-9a-f-]{36}$/.test(uuid)) throw new APIError('Mídia indisponível.', 404)
  const { docs: [doc] } = await req.payload.find({
    collection: 'midias', where: { uuid: { equals: uuid } }, limit: 1,
    depth: 0, overrideAccess: false, req,
  })
  if (!doc) throw new APIError('Mídia indisponível.', 404)
  return doc
}

const reserve: Endpoint['handler'] = async req => {
  const user = operator(req)
  const data = await body(req, ['arquivo', 'tipo', 'tamanho', 'regional'])
  const { arquivo, tipo, tamanho } = data
  if (typeof arquivo !== 'string' || !arquivo.trim() || arquivo.length > 160 ||
      [...arquivo].some(char => char.charCodeAt(0) < 32 || char === '/' || char === String.fromCharCode(92)) ||
      (tipo !== 'imagem' && tipo !== 'video') || typeof tamanho !== 'number' ||
      !Number.isSafeInteger(tamanho) || tamanho <= 0) throw new APIError('Reserva inválida.', 400)
  if (tamanho > limits[tipo]) throw new APIError('Tamanho excede o limite desta mídia.', 413)
  rejectNested(data.regional)
  const assigned = relationID(user.regional)
  if (user.perfil === 'regional' && Object.hasOwn(data, 'regional') && relationID(data.regional) !== assigned) deny()
  const regional = user.perfil === 'regional' ? assigned : relationID(data.regional)
  if (regional && !await req.payload.findByID({
    collection: 'regionais', id: regional, depth: 0, req, overrideAccess: false, disableErrors: true,
  })) deny('Unidade indisponível.')

  const client = await mediaPool(req.payload).connect()
  let locked = false
  try {
    const { rows: [lock] } = await client.query<{ acquired: boolean }>('SELECT pg_try_advisory_lock(502011) AS acquired')
    locked = lock.acquired
    if (!locked) throw new APIError('Outra reserva em andamento. Tente novamente.', 429)
    const { rows: [usage] } = await client.query<{ global: string; regional: string; recente: string }>(`
      SELECT
        coalesce(sum(tamanho) FILTER (WHERE digest IS NOT NULL OR (fase IN ('reservada','recebendo') AND expira > now())), 0) AS global,
        coalesce(sum(tamanho) FILTER (WHERE regional_id IS NOT DISTINCT FROM $1::integer
          AND (digest IS NOT NULL OR (fase IN ('reservada','recebendo') AND expira > now()))), 0) AS regional,
        count(*) FILTER (WHERE operador = $2 AND created_at > now() - interval '1 minute') AS recente
      FROM midias
    `, [regional ?? null, user.id])
    if (Number(usage.recente) >= limits.requestsPerMinute) throw new APIError('Limite de reservas por minuto.', 429)
    if (Number(usage.global) + tamanho > limits.global || Number(usage.regional) + tamanho > limits.regional) {
      throw new APIError('Cota de originais e reservas excedida.', 409)
    }
    const uuid = randomUUID()
    const expira = new Date(Date.now() + limits.uploadMinutes * 60_000).toISOString()
    const doc = await req.payload.create({
      collection: 'midias', overrideAccess: false, req, context: { mediaReservation: reservation },
      data: { arquivo, tipo, tamanho, regional, uuid, operador: Number(user.id), fase: 'reservada', expira },
    })
    return Response.json({ id: doc.id, uuid, expira }, { status: 201 })
  } finally {
    try {
      if (locked) await client.query('SELECT pg_advisory_unlock(502011)')
    } finally {
      client.release()
    }
  }
}

const upload: Endpoint['handler'] = async req => {
  const user = operator(req)
  const doc = await scopedMedia(req)
  if (doc.operador !== Number(user.id)) deny('Esta reserva pertence a outra conta.')
  const stream = req.body
  if (!stream) throw new APIError('Envie o conteúdo do arquivo.', 400)
  const declared = req.headers.get('content-length')
  if (declared !== null && Number(declared) !== doc.tamanho) throw new APIError('Tamanho diferente da reserva.', 413)
  const pool = mediaPool(req.payload)
  const taken = await pool.query(`
    UPDATE midias SET fase = 'recebendo' WHERE id = $1 AND fase = 'reservada' AND expira > now()
  `, [doc.id])
  if (!taken.rowCount) throw new APIError('Reserva expirada ou já utilizada.', 409)
  const root = temporaryRoot('envios')
  await mkdir(root, { recursive: true, mode: 0o700 })
  const dir = await mkdtemp(join(root, 'envio-'))
  let originalStored = false
  const key = originalKey(doc.uuid)
  try {
    const file = join(dir, 'entrada')
    const digest = await receiveBody(stream, file, doc.tamanho, req.signal)
    const mime = await detectMedia(file)
    if (!mime?.startsWith(doc.tipo === 'imagem' ? 'image/' : 'video/')) {
      throw new APIError('Conteúdo incompatível com os formatos autorizados.', 415)
    }
    await storeFile(key, file, mime)
    originalStored = true
    const queued = await pool.query(`
      UPDATE midias SET fase = 'pendente', digest = $2, mime = $3, origem = $4, updated_at = now()
      WHERE id = $1 AND fase = 'recebendo' AND expira > now()
    `, [doc.id, digest, mime, key])
    if (!queued.rowCount) throw new APIError('A reserva expirou durante o envio.', 409)
    return Response.json({ fase: 'pendente' }, { status: 202 })
  } catch (error) {
    await pool.query("UPDATE midias SET fase = 'falhou', erro = 'envio' WHERE id = $1 AND fase = 'recebendo'", [doc.id])
    if (originalStored) {
      const failed = await pool.query("SELECT id FROM midias WHERE id = $1 AND fase = 'falhou' AND digest IS NULL", [doc.id])
      if (failed.rowCount) await removeObject(key).catch(() => undefined)
    }
    if (error instanceof APIError) throw error
    throw new APIError('Falha ao receber o arquivo.', 422)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

const retry: Endpoint['handler'] = async req => {
  const doc = await scopedMedia(req)
  const changed = await mediaPool(req.payload).query(`
    UPDATE midias SET fase = 'pendente', erro = null, updated_at = now()
    WHERE id = $1 AND fase = 'falhou' AND digest IS NOT NULL AND tentativa < $2 AND NOT publicado
  `, [doc.id, limits.attempts])
  if (!changed.rowCount) throw new APIError('Mídia sem tentativa disponível.', 409)
  return Response.json({ fase: 'pendente' }, { status: 202 })
}

const publish: Endpoint['handler'] = async req => {
  const doc = await scopedMedia(req)
  const { alt: value } = await body(req, ['alt'])
  if (value !== undefined && (typeof value !== 'string' || value.length > 250)) throw new APIError('Texto alternativo inválido.', 400)
  const alt = typeof value === 'string' ? value.trim() : doc.alt ?? ''
  if (doc.tipo === 'imagem' && !alt) throw new APIError('Informe um texto alternativo descritivo.', 400)
  const changed = await mediaPool(req.payload).query(`
    UPDATE midias SET publicado = true, alt = $2, updated_at = now()
    WHERE id = $1 AND fase = 'pronta' AND NOT publicado
  `, [doc.id, alt])
  if (!changed.rowCount) throw new APIError('Somente uma mídia pronta e inédita pode ser publicada.', 409)
  return Response.json({ publicado: true })
}

const poster: Endpoint['handler'] = async req => {
  const doc = await scopedMedia(req)
  const data = await body(req, ['imagem', 'segundo'])
  if (doc.tipo !== 'video' || doc.fase !== 'pronta' || doc.publicado) throw new APIError('Pôster exige vídeo pronto em rascunho.', 409)
  const pool = mediaPool(req.payload)
  if (Object.hasOwn(data, 'imagem')) {
    rejectNested(data.imagem)
    const id = relationID(data.imagem)
    if (!id || Object.hasOwn(data, 'segundo')) throw new APIError('Informe apenas uma seleção de pôster.', 400)
    const image = await req.payload.findByID({
      collection: 'midias', id, depth: 0, overrideAccess: false, req, disableErrors: true,
    })
    if (!image || image.tipo !== 'imagem' || image.fase !== 'pronta' ||
        relationID(image.regional) !== relationID(doc.regional)) deny('Imagem de pôster indisponível neste âmbito.')
    const updated = await pool.query(`
      UPDATE midias SET posterior = $2, updated_at = now()
      WHERE id = $1 AND fase = 'pronta' AND NOT publicado
    `, [doc.id, id])
    if (!updated.rowCount) throw new APIError('O estado da mídia mudou.', 409)
    return Response.json({ fase: 'pronta' })
  }
  if (typeof data.segundo !== 'number' || !Number.isFinite(data.segundo) || data.segundo < 0 ||
      data.segundo >= doc.duracao) throw new APIError('Instante fora do vídeo.', 400)
  const updated = await pool.query(`
    UPDATE midias SET fase = 'pendente', segundo = $2, posterior = null, updated_at = now()
    WHERE id = $1 AND fase = 'pronta' AND NOT publicado AND tentativa < $3
  `, [doc.id, data.segundo, limits.attempts])
  if (!updated.rowCount) throw new APIError('O estado da mídia mudou ou as tentativas terminaram.', 409)
  return Response.json({ fase: 'pendente' }, { status: 202 })
}

const download: Endpoint['handler'] = async req => {
  const doc = await scopedMedia(req)
  const kind = req.routeParams?.arquivo
  if (doc.fase !== 'pronta' || !['otimizado', 'miniatura', 'poster'].includes(String(kind))) {
    throw new APIError('Arquivo indisponível.', 404)
  }
  let key = doc[String(kind)]
  if (kind === 'poster' && doc.posterior != null) {
    const image = await req.payload.findByID({
      collection: 'midias', id: doc.posterior, depth: 0, overrideAccess: false, req, disableErrors: true,
    })
    if (!image || image.fase !== 'pronta' || relationID(image.regional) !== relationID(doc.regional)) deny()
    key = image.otimizado
  }
  if (typeof key !== 'string') throw new APIError('Arquivo indisponível.', 404)
  const range = req.headers.get('range') ?? undefined
  if (range && !/^bytes=(?:\d+-\d*|-\d+)$/.test(range)) throw new APIError('Faixa inválida.', 416)
  const object = await fetchObject(key, range).catch((error: unknown) => {
    if (error instanceof Error && error.name === 'InvalidRange') throw new APIError('Faixa inválida.', 416)
    throw new APIError('Arquivo indisponível.', 404)
  })
  if (!object.Body) throw new APIError('Arquivo indisponível.', 404)
  const headers = new Headers({
    'Content-Type': doc.tipo === 'video' && kind === 'otimizado' ? 'video/mp4' : 'image/webp',
    'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes',
  })
  if (object.ContentLength !== undefined) headers.set('Content-Length', String(object.ContentLength))
  if (object.ContentRange) headers.set('Content-Range', object.ContentRange)
  return new Response(object.Body.transformToWebStream(), { headers, status: object.ContentRange ? 206 : 200 })
}

export const mediaEndpoints: Endpoint[] = [
  { method: 'post', path: '/reserva', handler: reserve },
  { method: 'put', path: '/:uuid/envio', handler: upload },
  { method: 'post', path: '/:uuid/repetir', handler: retry },
  { method: 'post', path: '/:uuid/publicar', handler: publish },
  { method: 'post', path: '/:uuid/poster', handler: poster },
  { method: 'get', path: '/:uuid/arquivo/:arquivo', handler: download },
]
