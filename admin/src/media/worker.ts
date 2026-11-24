import { mkdir, mkdtemp, readdir, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { performance } from 'node:perf_hooks'
import sharp from 'sharp'
import type { Payload } from 'payload'
import { derivativeKey, limits, mediaPool, originalKey, temporaryRoot, type Media } from './model.ts'
import { extractPoster, optimizeImage, optimizeVideo, verifyOriginal } from './processing.ts'
import { fetchFile, removeObject, storeFile } from './storage.ts'

async function cleanOldUploads() {
  const root = temporaryRoot('envios')
  await mkdir(root, { recursive: true, mode: 0o700 })
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('envio-')) continue
    const path = join(root, entry.name)
    const info = await stat(path).catch(() => undefined)
    if (info && Date.now() - info.mtimeMs > 10 * 60_000) await rm(path, { recursive: true, force: true })
  }
}

async function removeUncommitted(row: Media) {
  for (const kind of ['otimizado', 'miniatura', 'poster']) {
    await removeObject(derivativeKey(row, kind)).catch(() => undefined)
  }
}

async function processJob(row: Media, dir: string) {
  const started = performance.now()
  const metrics = { ffmpegRssKiB: 0 }
  const source = join(dir, 'entrada')
  const posterOnly = row.tipo === 'video' && row.segundo !== null && row.otimizado !== null
  await fetchFile(posterOnly ? row.otimizado! : originalKey(row.uuid), source, posterOnly ? limits.video : Number(row.tamanho))
  if (!posterOnly) await verifyOriginal(row, source)
  let optimized = row.otimizado
  let thumbnail = row.miniatura
  let poster = row.poster
  let width: number | null = Number(row.largura) || null
  let height: number | null = Number(row.altura) || null
  let duration: number | null = Number(row.duracao) || null
  let outputBytes = 0
  let previewBytes = 0
  let remux = false
  if (row.tipo === 'imagem') {
    const result = await optimizeImage(source, dir)
    optimized = derivativeKey(row, 'otimizado')
    thumbnail = derivativeKey(row, 'miniatura')
    await storeFile(optimized, result.optimized, 'image/webp')
    await storeFile(thumbnail, result.thumbnail, 'image/webp')
    width = result.width
    height = result.height
    outputBytes = (await stat(result.optimized)).size
    previewBytes = (await stat(result.thumbnail)).size
  } else {
    let video = source
    if (!posterOnly) {
      const result = await optimizeVideo(source, dir, metrics)
      video = result.optimized
      width = result.width
      height = result.height
      duration = result.duration
      remux = result.canCopy
      optimized = derivativeKey(row, 'otimizado')
      await storeFile(optimized, video, 'video/mp4')
    }
    const image = await extractPoster(video, dir, Number(row.segundo ?? 0), metrics)
    poster = derivativeKey(row, 'poster')
    await storeFile(poster, image, 'image/webp')
    thumbnail = poster
    outputBytes = (await stat(video)).size
    previewBytes = (await stat(image)).size
  }
  return {
    optimized, thumbnail, poster, width, height, duration,
    measures: {
      tipo: row.tipo, modo: posterOnly ? 'poster' : remux ? 'remux' : 'otimizacao',
      entrada: (await stat(source)).size, saida: outputBytes, previa: previewBytes,
      ms: Math.round(performance.now() - started), rssWorkerKiB: process.resourceUsage().maxRSS,
      ...metrics,
    },
  }
}

export async function workOnce(payload: Payload) {
  const client = await mediaPool(payload).connect()
  let locked = false
  try {
    const { rows: [lock] } = await client.query<{ acquired: boolean }>('SELECT pg_try_advisory_lock(502012) AS acquired')
    locked = lock.acquired
    if (!locked) return
    sharp.concurrency(1)
    sharp.cache({ memory: 32, files: 0, items: 10 })
    const root = temporaryRoot('worker')
    await cleanOldUploads()
    await mkdir(root, { recursive: true, mode: 0o700 })
    for (const abandoned of await readdir(root)) {
      await rm(join(root, abandoned), { force: true, recursive: true })
    }
    await client.query(`
      UPDATE midias SET fase = 'falhou', erro = 'expirado'
      WHERE fase IN ('reservada','recebendo') AND expira <= now()
    `)
    const { rows: abandoned } = await client.query<{ id: number; uuid: string }>(`
      SELECT id, uuid FROM midias WHERE fase = 'falhou' AND digest IS NULL
        AND erro IN ('envio','expirado') ORDER BY id LIMIT 20
    `)
    for (const row of abandoned) {
      try {
        await removeObject(originalKey(row.uuid))
        await client.query("UPDATE midias SET erro = erro || '-limpo' WHERE id = $1 AND digest IS NULL", [row.id])
      } catch {
        continue
      }
    }
    const { rows: exhausted } = await client.query<Media>(`
      UPDATE midias SET fase = 'falhou', erro = 'limite'
      WHERE fase = 'processando' AND expira <= now() AND tentativa >= $1
      RETURNING *
    `, [limits.attempts])
    for (const row of exhausted) await removeUncommitted(row)
    const { rows: [row] } = await client.query<Media & { anterior: string }>(`
      WITH next AS (
        SELECT id, fase AS anterior FROM midias
        WHERE (fase = 'pendente' OR (fase = 'processando' AND expira <= now()))
          AND digest IS NOT NULL AND tentativa < $1
        ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED
      )
      UPDATE midias SET fase = 'processando', tentativa = tentativa + 1, expira = now() + interval '4 minutes'
      FROM next WHERE midias.id = next.id RETURNING midias.*, next.anterior
    `, [limits.attempts])
    if (!row) return
    if (row.anterior === 'processando') await removeUncommitted({ ...row, tentativa: Number(row.tentativa) - 1 })
    const dir = await mkdtemp(join(root, 'tentativa-'))
    let result: Awaited<ReturnType<typeof processJob>>
    try {
      result = await processJob(row, dir)
    } catch {
      await removeUncommitted(row)
      await client.query(`
        UPDATE midias SET fase = 'falhou', erro = 'processamento', updated_at = now()
        WHERE id = $1 AND fase = 'processando' AND tentativa = $2
      `, [row.id, row.tentativa])
      return
    } finally {
      await rm(dir, { force: true, recursive: true })
    }
    const finished = await client.query(`
      UPDATE midias SET fase = 'pronta', erro = null, expira = null, otimizado = $3, miniatura = $4, poster = $5,
        largura = $6, altura = $7, duracao = $8, updated_at = now()
      WHERE id = $1 AND fase = 'processando' AND tentativa = $2
    `, [row.id, row.tentativa, result.optimized, result.thumbnail, result.poster, result.width, result.height, result.duration])
    if (!finished.rowCount) {
      await removeUncommitted(row)
      return
    }
    console.info(JSON.stringify(result.measures))
  } finally {
    try {
      if (locked) await client.query('SELECT pg_advisory_unlock(502012)')
    } finally {
      client.release()
    }
  }
}
