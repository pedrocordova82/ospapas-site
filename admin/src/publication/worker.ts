import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Payload } from 'payload'
import { relationID } from '../access/policies.ts'
import { eligiblePoster } from '../media/approval.ts'
import { limits, mediaPool } from '../media/model.ts'
import { fetchFile } from '../media/storage.ts'
import { publicationRefusal, type PublicationRequest } from './authorization.ts'
import {
  assetsOf, emptySnapshot, fileKey, hash, jsonBytes, parsePointer, parseRelease, parseSection, sections,
  validateSnapshot, version, maxPublicJSON, type Asset, type Pointer, type Release, type Rows,
  type Snapshot, type Video,
} from './contract.ts'
import { isApprovedVideo, type PendingRow } from './projection.ts'
import { readSnapshot } from './releases.ts'
import { missing, publicationEnvironment, ReleaseStore } from './store.ts'

type Job = PublicationRequest & { id: number; release: string; created_at: Date; tentativas: string }
type Approved = {
  capa?: { source: string; alt: string }
  video?: { source: string; poster: { source: string; alt: string } }
}
type Hooks = {
  beforeActivate?: () => Promise<void>
  afterActivate?: () => Promise<void>
}

class Refusal extends Error {}

async function approvalSnapshot(payload: Payload, selected: PendingRow[]) {
  const pool = mediaPool(payload)
  const read = await pool.connect()
  const result = new Map<string, Approved>()
  try {
    await read.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
    const load = async (id: number) => {
      const { rows: [asset] } = await read.query<Record<string, unknown>>(`
        SELECT tipo, fase, regional_id AS regional, digest, otimizado, publicado, alt, poster, posterior
        FROM midias WHERE id = $1
      `, [id])
      return asset
    }
    const image = async (id: number, regional: number | undefined) => {
      const asset = await load(id)
      if (!eligiblePoster(asset, regional, true) || typeof asset.alt !== 'string') {
        throw new Refusal('midia_invalida')
      }
      return { source: asset.otimizado, alt: asset.alt.trim() }
    }
    for (const record of selected) {
      const dependencies: Approved = {}
      if (record.capa) dependencies.capa = await image(record.capa, record.unidade)
      if (record.video) {
        const asset = await load(record.video)
        if (!isApprovedVideo(asset, record.unidade)) throw new Refusal('midia_invalida')
        const custom = relationID(asset.posterior)
        if (asset.posterior != null && !custom) throw new Refusal('midia_invalida')
        const title = record.dado && 'titulo' in record.dado ? record.dado.titulo : ''
        dependencies.video = {
          source: String(asset.otimizado),
          poster: custom ? await image(custom, record.unidade) : {
            source: String(asset.poster), alt: `Quadro do vídeo ${title}`.slice(0, 250),
          },
        }
      }
      result.set(record.id, dependencies)
    }
    await read.query('COMMIT')
    return result
  } catch (error) {
    await read.query('ROLLBACK')
    throw error
  } finally {
    read.release()
  }
}

async function copyMedia(
  store: ReleaseStore,
  source: string,
  extension: 'mp4' | 'webp',
  revoked: Set<string>,
) {
  if (!/^privado\/derivados\/[0-9a-f-]{36}\/\d+\/(?:otimizado|poster)$/.test(source)) {
    throw new Refusal('midia_invalida')
  }
  const dir = await mkdtemp(join(tmpdir(), 'ospapas-pub-'))
  try {
    const filename = join(dir, 'derivado')
    try {
      await fetchFile(source, filename, extension === 'mp4' ? limits.video : limits.imagem)
    } catch (error) {
      if (missing(error)) throw new Refusal('midia_ausente')
      throw error
    }
    store.operations++
    const bytes = await readFile(filename)
    const key = `midias/${hash(bytes)}.${extension}`
    if (!bytes.length || revoked.has(key)) throw new Refusal('conteudo_revogado')
    try {
      await store.verifyMedia(key)
      store.reused++
    } catch (error) {
      if (!missing(error)) throw error
      await store.putImmutable('media', key, bytes, extension === 'mp4' ? 'video/mp4' : 'image/webp')
    }
    return key
  } finally {
    await rm(dir, { force: true, recursive: true })
  }
}

async function patchSnapshot(
  store: ReleaseStore,
  payload: Payload,
  snapshot: Snapshot,
  selected: PendingRow[],
  revoked: string[],
) {
  const denied = new Set(revoked)
  const approvals = await approvalSnapshot(payload, selected)
  const copied = new Map<string, string>()
  const copy = async (key: string, extension: 'mp4' | 'webp') => {
    if (!copied.has(key)) copied.set(key, await copyMedia(store, key, extension, denied))
    return copied.get(key)!
  }
  const removedUnits = new Set<string>()
  for (const item of selected) {
    const rows: Rows[typeof item.colecao][] = snapshot[item.colecao]
    const index = rows.findIndex(row => row.id === item.id)
    if (item.dado === null) {
      if (index >= 0) rows.splice(index, 1)
      if (item.colecao === 'sedes') removedUnits.add(item.id)
      continue
    }
    if (denied.has(item.id)) throw new Refusal('conteudo_revogado')
    const next = { ...item.dado }
    const { capa, video } = approvals.get(item.id) ?? {}
    if (capa) {
      const cover: Asset = { arquivo: await copy(capa.source, 'webp'), alt: capa.alt }
      Object.assign(next, { capa: cover })
    }
    if (video) {
      const current: Video = {
        arquivo: await copy(video.source, 'mp4'),
        poster: { arquivo: await copy(video.poster.source, 'webp'), alt: video.poster.alt },
      }
      Object.assign(next, { video: current })
    }
    if (index < 0) rows.push(next)
    else rows[index] = next
  }
  for (const section of sections) {
    const rows: Rows[typeof section][] = snapshot[section]
    for (let i = rows.length - 1; i >= 0; i--) {
      if (rows[i].regional && removedUnits.has(rows[i].regional!)) rows.splice(i, 1)
    }
  }
}

function revoke(snapshot: Snapshot, target: string) {
  const units = new Set(snapshot.sedes.filter(unit => unit.id === target || assetsOf(unit).includes(target)).map(unit => unit.id))
  for (const section of sections) {
    const rows: Rows[typeof section][] = snapshot[section]
    for (let i = rows.length - 1; i >= 0; i--) {
      const item = rows[i]
      if (item.id === target || (item.regional && units.has(item.regional)) || assetsOf(item).includes(target)) rows.splice(i, 1)
    }
  }
}

async function prepareRelease(
  payload: Payload,
  store: ReleaseStore,
  job: Job,
  previous: Pointer | undefined,
) {
  const started = performance.now()
  const intent = job.pedido
  let revoked = previous?.revogados ?? []
  let ancestors = previous ? [previous.ativa, ...previous.anteriores].slice(0, 3) : []
  let snapshot: Snapshot
  if (intent.acao === 'restaurar') {
    const old = previous?.anteriores.find(ref => ref.id === intent.release)
    if (!old) throw new Refusal('restauracao_indisponivel')
    snapshot = await readSnapshot(store, old)
  } else {
    snapshot = previous ? await readSnapshot(store, previous.ativa) : emptySnapshot()
    if (intent.acao === 'revogar') {
      revoked = [...new Set([...revoked, intent.alvo])].sort()
      revoke(snapshot, intent.alvo)
      ancestors = []
    } else {
      await patchSnapshot(store, payload, snapshot, intent.registros, revoked)
    }
  }
  snapshot.sedes.sort((a, b) => a.ordem - b.ordem || a.slug.localeCompare(b.slug))
  const media = validateSnapshot(snapshot, revoked)
  for (const key of media) {
    try {
      await store.verifyMedia(key)
    } catch (error) {
      if (missing(error)) throw new Refusal('midia_ausente')
      throw error
    }
  }
  const files = sections.map(section => [section, jsonBytes({
    versao: version, release: job.release, dados: snapshot[section],
  })] as const)
  const release: Release = {
    versao: version, ambiente: store.environment, id: job.release, sequencia: job.id,
    solicitadoEm: job.created_at.toISOString(),
    arquivos: Object.fromEntries(files.map(([key, bytes]) => [key, { checksum: hash(bytes), tamanho: bytes.length }])) as Release['arquivos'],
    midias: media,
  }
  const manifest = jsonBytes(release)
  if (manifest.length > maxPublicJSON || files.some(([, bytes]) => bytes.length > maxPublicJSON)) {
    throw new Refusal('release_grande')
  }
  const ref = { id: job.release, sequencia: job.id, checksum: hash(manifest) }
  const pointer = parsePointer({
    versao: version, ambiente: store.environment, ativa: ref, anteriores: ancestors, revogados: revoked, ativadaEm: new Date().toISOString(),
  }, store.environment)
  if (jsonBytes(pointer).length > maxPublicJSON) throw new Refusal('release_grande')
  parseRelease(manifest, ref, store.environment)
  const snapshotMs = Math.round(performance.now() - started)
  let jsonSize = manifest.length
  for (const [section, bytes] of files) {
    parseSection(section, bytes, release)
    jsonSize += bytes.length
    await store.putImmutable('releases', fileKey(job.release, section), bytes, 'application/json')
  }
  await store.putImmutable('releases', fileKey(job.release, 'manifest'), manifest, 'application/json')
  return { pointer, snapshotMs, jsonSize, jsonFiles: files.map(([key, bytes]) => [key, bytes.length]) }
}

export async function publishOnce(payload: Payload, environment = publicationEnvironment(), hooks: Hooks = {}) {
  if (environment !== publicationEnvironment()) throw new Error('Worker deve operar no ambiente configurado.')
  const started = performance.now()
  const client = await mediaPool(payload).connect()
  let locked = false
  try {
    const { rows: [lock] } = await client.query<{ acquired: boolean }>(
      'SELECT pg_try_advisory_lock(502020, $1) AS acquired', [['dev', 'hml', 'prd'].indexOf(environment)],
    )
    locked = lock.acquired
    if (!locked) return
    const { rows: [job] } = await client.query<Job>(`
      WITH next AS (
        SELECT id, estado, expira FROM publicacoes
        WHERE ambiente = $1 AND estado IN ('pendente','processando')
        ORDER BY id LIMIT 1 FOR UPDATE
      )
      UPDATE publicacoes SET estado = 'processando', expira = now() + interval '2 minutes', tentativas = tentativas + 1
      FROM next WHERE publicacoes.id = next.id AND (next.estado = 'pendente' OR next.expira <= now())
      RETURNING publicacoes.*
    `, [environment])
    if (!job) return
    const store = new ReleaseStore(environment)
    const confirm = () => client.query(`
      UPDATE publicacoes SET estado = 'publicado', erro = null, expira = null, updated_at = now()
      WHERE id = $1 AND estado = 'processando' AND ambiente = $2
    `, [job.id, environment])
    let activating = false
    try {
      const current = await store.pointer()
      if (current?.value.ativa.id === job.release && current.value.ativa.sequencia === job.id) {
        await confirm()
        return { status: 'reconciliado', operations: store.operations }
      }
      if (current && current.value.ativa.sequencia >= job.id) throw new Refusal('release_obsoleta')
      const preflight = await publicationRefusal(client, job)
      if (preflight) throw new Refusal(preflight)
      const result = await prepareRelease(payload, store, job, current?.value)
      await hooks.beforeActivate?.()
      await client.query('BEGIN ISOLATION LEVEL READ COMMITTED')
      try {
        // Os bloqueios impedem mudanças de autorização até o fim da escrita condicional.
        const refusal = await publicationRefusal(client, job, { lock: true })
        if (refusal) throw new Refusal(refusal)
        activating = true
        await store.activate(jsonBytes({ ...result.pointer, ativadaEm: new Date().toISOString() }), current?.etag)
        await client.query('COMMIT')
      } catch (error) {
        await client.query('ROLLBACK')
        throw error
      }
      await hooks.afterActivate?.()
      await confirm()
      return {
        status: 'publicado', snapshotMs: result.snapshotMs, elapsedMs: Math.round(performance.now() - started),
        jsonSize: result.jsonSize, jsonFiles: result.jsonFiles, operations: store.operations, reused: store.reused,
        rssKiB: process.resourceUsage().maxRSS,
      }
    } catch (error) {
      if (activating && !(error instanceof Error && ['PreconditionFailed', 'ConditionalRequestConflict'].includes(error.name))) {
        return { status: 'processando', operations: store.operations }
      }
      const reason = activating ? 'conflito_manifesto' : error instanceof Refusal ? error.message : 'preparacao'
      await client.query(`
        UPDATE publicacoes SET estado = 'falhou', erro = $2, expira = null, updated_at = now()
        WHERE id = $1 AND estado = 'processando' AND ambiente = $3
      `, [job.id, reason, environment])
      return { status: 'falhou', reason, operations: store.operations }
    }
  } finally {
    try {
      if (locked) await client.query('SELECT pg_advisory_unlock(502020, $1)', [['dev', 'hml', 'prd'].indexOf(environment)])
    } finally {
      client.release()
    }
  }
}
