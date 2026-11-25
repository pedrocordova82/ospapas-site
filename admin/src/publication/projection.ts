import { createHmac } from 'node:crypto'
import { APIError, type PayloadRequest } from 'payload'
import { actor, deny, relationID } from '../access/policies.ts'
import { eligiblePoster } from '../media/approval.ts'
import type { Rows, Section } from './contract.ts'

export type Selection = { colecao: Section; id: number }
export type PendingRow = {
  colecao: Section
  id: string
  sourceId: number
  dado: Rows[Section] | null
  capa?: number
  video?: number
  unidade?: number
}
export type Intent =
  | { acao: 'publicar'; registros: PendingRow[] }
  | { acao: 'restaurar'; release: string }
  | { acao: 'revogar'; alvo: string }

export function stableID(section: Section, id: number) {
  const key = process.env.POC_PUBLIC_ID_SECRET ?? process.env.PAYLOAD_SECRET
  if (!key || key.length < 32) throw new Error('Configure a chave de identificadores públicos.')
  return createHmac('sha256', key).update(`${section}:${id}`).digest('hex')
}

export function isApprovedVideo(doc: Record<string, unknown> | null | undefined, regional: number | undefined) {
  return doc?.tipo === 'video' && doc.fase === 'pronta' && doc.publicado === true &&
    relationID(doc.regional) === regional && typeof doc.digest === 'string' && /^[0-9a-f]{64}$/.test(doc.digest) &&
    typeof doc.otimizado === 'string' && Boolean(doc.otimizado.trim()) &&
    (doc.posterior != null || (typeof doc.poster === 'string' && Boolean(doc.poster.trim())))
}

async function loadMedia(req: PayloadRequest, id: number) {
  return req.payload.findByID({
    collection: 'midias', id, depth: 0, overrideAccess: false, req, disableErrors: true,
  })
}

function cleanURL(value: string) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : ''
  } catch {
    return ''
  }
}

export async function capture(req: PayloadRequest, selection: Selection): Promise<PendingRow> {
  const { colecao, id } = selection
  const user = actor(req)
  if (!user) deny()
  const doc = await req.payload.findByID({
    collection: colecao === 'sedes' ? 'regionais' : colecao, id, depth: 0,
    overrideAccess: false, req, disableErrors: true, ...(colecao === 'agenda' ? { draft: false } : {}),
  })
  if (!doc) deny('Registro fora do escopo de publicação.')
  const unidade = colecao === 'sedes' ? id : relationID(doc.regional)
  if (user.perfil === 'regional' && (colecao === 'diretoria' || unidade !== relationID(user.regional))) deny()
  if (colecao === 'agenda' && doc._status !== 'published') {
    throw new APIError('A Agenda deve ser aprovada no CMS antes da geração pública.', 409)
  }
  const publicId = stableID(colecao, id)
  if (doc.ativo !== true) return { colecao, id: publicId, sourceId: id, dado: null, unidade }

  const regional = colecao === 'sedes' || !unidade ? null : stableID('sedes', unidade)
  const identity = { id: publicId, regional }
  const text = (field: string) => typeof doc[field] === 'string' ? doc[field] as string : ''
  let dado: Rows[Section]
  switch (colecao) {
    case 'diretoria':
      dado = { ...identity, nome: text('nomePublico') }
      break
    case 'sedes':
      dado = {
        ...identity, nome: text('nome'), slug: text('slug'), tipo: text('tipo'),
        cidade: text('cidade'), estado: text('estado'), sobre: text('sobre'), whatsapp: /^\+?[0-9() -]{7,24}$/.test(text('whatsapp')) ? text('whatsapp') : '',
        instagram: text('instagram'), endereco: text('endereco'),
        localizacao: cleanURL(text('localizacao')), ordem: Number(doc.ordem ?? 0),
      }
      break
    case 'membros':
      dado = { ...identity, nome: text('titulo'), patente: text('patente') }
      break
    default:
      dado = { ...identity, titulo: text('titulo') }
  }
  const capa = relationID(doc.capaMidia)
  const video = colecao === 'eventos' ? relationID(doc.videoMidia) : undefined
  if (capa && !eligiblePoster(await loadMedia(req, capa), unidade, true)) {
    throw new APIError('A capa deve estar aprovada e pertencer ao mesmo âmbito.', 409)
  }
  if (video) {
    const media = await loadMedia(req, video)
    if (!isApprovedVideo(media, unidade) ||
        (media?.posterior != null && !eligiblePoster(await loadMedia(req, media.posterior), unidade, true))) {
      throw new APIError('O vídeo e seu pôster devem estar aprovados no mesmo âmbito.', 409)
    }
  }
  return { colecao, id: publicId, sourceId: id, dado, capa, video, unidade }
}
