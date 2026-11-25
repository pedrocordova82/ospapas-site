import { createHash } from 'node:crypto'

export const maxPublicJSON = 4 * 1024 ** 2
export const version = 1 as const
export const sections = ['diretoria', 'sedes', 'membros', 'agenda', 'eventos'] as const
export type Section = typeof sections[number]
export type Environment = 'dev' | 'hml' | 'prd'
export type Asset = { arquivo: string; alt: string }
export type Video = { arquivo: string; poster: Asset }
type Identity = { id: string; regional: string | null }
type Cover = { capa?: Asset }
export type Rows = {
  diretoria: Identity & Cover & { nome: string }
  sedes: Identity & Cover & {
    nome: string; slug: string; tipo: string; cidade: string; estado: string; sobre: string
    whatsapp: string; instagram: string; endereco: string; localizacao: string; ordem: number
  }
  membros: Identity & { nome: string; patente: string }
  agenda: Identity & Cover & { titulo: string }
  eventos: Identity & Cover & { titulo: string; video?: Video }
}
export type Snapshot = { [K in Section]: Rows[K][] }
export type ReleaseRef = { id: string; sequencia: number; checksum: string }
type FileRef = { checksum: string; tamanho: number }
export type Release = {
  versao: 1; ambiente: Environment; id: string; sequencia: number; solicitadoEm: string
  arquivos: Record<Section, FileRef>; midias: string[]
}
export type Pointer = {
  versao: 1; ambiente: Environment; ativa: ReleaseRef; anteriores: ReleaseRef[]
  revogados: string[]; ativadaEm: string; geracao?: string
  linhagem?: string; revisao?: number; diario?: string
}
export type InitialManifest = {
  versao: 1; ambiente: Environment; ativa: null; geracao: string; linhagem: string; revisao: number
}
export type PublicationManifest = Pointer | InitialManifest

export const hash = (bytes: string | Uint8Array) => createHash('sha256').update(bytes).digest('hex')
export const jsonBytes = (value: unknown) => Buffer.from(JSON.stringify(value))
export const emptySnapshot = (): Snapshot => ({ diretoria: [], sedes: [], membros: [], agenda: [], eventos: [] })
export const fileKey = (id: string, file: string) => `releases/${id}/${file}.json`

export const isSection = (value: unknown): value is Section =>
  typeof value === 'string' && sections.some(section => section === value)
export const isEnvironment = (value: unknown): value is Environment =>
  value === 'dev' || value === 'hml' || value === 'prd'
export const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
export const hashPattern = /^[0-9a-f]{64}$/
export const mediaPattern = /^midias\/[0-9a-f]{64}\.(?:webp|mp4)$/

function check(condition: unknown): asserts condition {
  if (!condition) throw new Error('Contrato público inválido ou incompatível.')
}

export function plain(input: unknown): input is Record<string, unknown> {
  return Boolean(input && typeof input === 'object' && !Array.isArray(input))
}

function exact(obj: Record<string, unknown>, required: readonly string[], optional: readonly string[] = []) {
  return required.every(key => Object.hasOwn(obj, key)) &&
    Object.keys(obj).every(key => required.includes(key) || optional.includes(key))
}

function stringMatching(value: unknown, pattern: RegExp) {
  return typeof value === 'string' && pattern.test(value)
}

function parseRef(value: unknown): value is ReleaseRef {
  return plain(value) && exact(value, ['id', 'sequencia', 'checksum']) && stringMatching(value.id, idPattern) &&
    Number.isSafeInteger(value.sequencia) && Number(value.sequencia) > 0 && stringMatching(value.checksum, hashPattern)
}

export function parsePointer(input: unknown, environment: Environment): Pointer {
  check(plain(input) && exact(input, ['versao', 'ambiente', 'ativa', 'anteriores', 'revogados', 'ativadaEm'],
    ['geracao', 'linhagem', 'revisao', 'diario']))
  check(input.versao === version && input.ambiente === environment && parseRef(input.ativa))
  check(typeof input.ativadaEm === 'string' && Number.isFinite(Date.parse(input.ativadaEm)))
  check(!Object.hasOwn(input, 'geracao') || stringMatching(input.geracao, idPattern))
  if (Object.hasOwn(input, 'revisao') || Object.hasOwn(input, 'linhagem')) {
    check(stringMatching(input.linhagem, idPattern) && stringMatching(input.geracao, idPattern) &&
      Number.isSafeInteger(input.revisao) && Number(input.revisao) > 0)
  }
  check(!Object.hasOwn(input, 'diario') || stringMatching(input.diario, hashPattern))
  const activeSequence = input.ativa.sequencia
  check(Array.isArray(input.anteriores) && input.anteriores.length <= 3 &&
    input.anteriores.every(ref => parseRef(ref) && ref.sequencia < activeSequence) &&
    new Set(input.anteriores.map(ref => ref.id)).size === input.anteriores.length)
  check(Array.isArray(input.revogados) && input.revogados.length <= 1000 &&
    input.revogados.every(id => stringMatching(id, hashPattern) || stringMatching(id, mediaPattern)))
  return input as unknown as Pointer
}

export function parseManifest(input: unknown, environment: Environment): PublicationManifest {
  if (plain(input) && input.ativa === null) {
    check(exact(input, ['versao', 'ambiente', 'ativa', 'geracao', 'linhagem', 'revisao']) &&
      input.versao === version && input.ambiente === environment &&
      stringMatching(input.geracao, idPattern) && stringMatching(input.linhagem, idPattern) &&
      Number.isSafeInteger(input.revisao) && Number(input.revisao) >= 0)
    return input as unknown as InitialManifest
  }
  return parsePointer(input, environment)
}

export function parseRelease(bytes: Buffer, ref: ReleaseRef, environment: Environment): Release {
  check(hash(bytes) === ref.checksum)
  const input: unknown = JSON.parse(bytes.toString())
  check(plain(input) && exact(input, ['versao', 'ambiente', 'id', 'sequencia', 'solicitadoEm', 'arquivos', 'midias']))
  check(input.versao === version && input.ambiente === environment && input.id === ref.id &&
    input.sequencia === ref.sequencia && typeof input.solicitadoEm === 'string' && Number.isFinite(Date.parse(input.solicitadoEm)))
  const files = input.arquivos
  check(plain(files) && exact(files, sections))
  for (const section of sections) {
    const file = files[section]
    check(plain(file) && exact(file, ['checksum', 'tamanho']) &&
      stringMatching(file.checksum, hashPattern) && Number.isSafeInteger(file.tamanho) && Number(file.tamanho) > 0)
  }
  check(Array.isArray(input.midias) && input.midias.every(key => stringMatching(key, mediaPattern)))
  return input as unknown as Release
}

const textKeys: Record<Section, readonly string[]> = {
  diretoria: ['nome'],
  sedes: ['nome', 'slug', 'tipo', 'cidade', 'estado', 'sobre', 'whatsapp', 'instagram', 'endereco', 'localizacao'],
  membros: ['nome', 'patente'],
  agenda: ['titulo'],
  eventos: ['titulo'],
}

function validAsset(input: unknown) {
  return plain(input) && exact(input, ['arquivo', 'alt']) &&
    stringMatching(input.arquivo, /^midias\/[0-9a-f]{64}\.webp$/) &&
    typeof input.alt === 'string' && /[\p{L}\p{N}]/u.test(input.alt) && input.alt.length <= 250
}

function row(section: Section, input: unknown) {
  const optional = section === 'eventos' ? ['capa', 'video'] : section === 'membros' ? [] : ['capa']
  const required = ['id', 'regional', ...textKeys[section], ...(section === 'sedes' ? ['ordem'] : [])]
  check(plain(input) && exact(input, required, optional))
  check(stringMatching(input.id, hashPattern) && (input.regional === null || stringMatching(input.regional, hashPattern)))
  check(textKeys[section].every(key => typeof input[key] === 'string'))
  if (section === 'sedes') {
    check(input.regional === null && stringMatching(input.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/) &&
      typeof input.ordem === 'number' && Number.isFinite(input.ordem))
  }
  if (section === 'diretoria') check(input.regional === null)
  if (section === 'membros') check(input.regional !== null)
  if (Object.hasOwn(input, 'capa')) check(validAsset(input.capa))
  if (Object.hasOwn(input, 'video')) {
    const video = input.video
    check(plain(video) && exact(video, ['arquivo', 'poster']) &&
      stringMatching(video.arquivo, /^midias\/[0-9a-f]{64}\.mp4$/) && validAsset(video.poster))
  }
}

export function parseSection<K extends Section>(section: K, bytes: Buffer, release: Release): Rows[K][] {
  const file = release.arquivos[section]
  check(file.tamanho === bytes.length && file.checksum === hash(bytes))
  const input: unknown = JSON.parse(bytes.toString())
  check(plain(input) && exact(input, ['versao', 'release', 'dados']) &&
    input.versao === version && input.release === release.id && Array.isArray(input.dados))
  for (const item of input.dados) row(section, item)
  return input.dados as Rows[K][]
}

export function assetsOf(item: Rows[Section]) {
  const keys: string[] = []
  if ('capa' in item && item.capa) keys.push(item.capa.arquivo)
  if ('video' in item && item.video) keys.push(item.video.arquivo, item.video.poster.arquivo)
  return keys
}

export function validateSnapshot(snapshot: Snapshot, revoked: string[] = []) {
  const denied = new Set(revoked)
  const units = new Set(snapshot.sedes.map(unit => unit.id))
  const slugs = new Set(snapshot.sedes.map(unit => unit.slug))
  check(slugs.size === snapshot.sedes.length)
  const ids = new Set<string>()
  const media = new Set<string>()
  for (const section of sections) {
    for (const item of snapshot[section]) {
      row(section, item)
      check(!ids.has(item.id) && !denied.has(item.id) && (!item.regional || units.has(item.regional)))
      ids.add(item.id)
      for (const key of assetsOf(item)) {
        check(!denied.has(key))
        media.add(key)
      }
    }
  }
  return [...media].sort()
}
