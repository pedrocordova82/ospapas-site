import { createHash } from 'node:crypto'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { PostgresAdapter } from '@payloadcms/db-postgres'
import type { Payload } from 'payload'

export const MiB = 1024 ** 2
export const limits = {
  imagem: 20 * MiB,
  video: 200 * MiB,
  regional: 256 * MiB,
  global: 512 * MiB,
  imagePixels: 32_000_000,
  videoSeconds: 120,
  requestsPerMinute: 10,
  uploadMinutes: 5,
  attempts: 6,
} as const

export type Media = {
  id: number
  uuid: string
  arquivo: string
  tipo: 'imagem' | 'video'
  fase: 'reservada' | 'recebendo' | 'pendente' | 'processando' | 'pronta' | 'falhou'
  regional_id: number | null
  operador: number
  tamanho: number
  digest: string | null
  mime: string | null
  largura: number | null
  altura: number | null
  duracao: number | null
  tentativa: number
  posterior: number | null
  segundo: number | null
  otimizado: string | null
  miniatura: string | null
  poster: string | null
  publicado: boolean
}

export function mediaPool(payload: Payload) {
  return (payload.db as typeof payload.db & Pick<PostgresAdapter, 'pool'>).pool
}

export const originalKey = (uuid: string) => `privado/originais/${uuid}`
export const derivativeKey = (media: Media, kind: string) => `privado/derivados/${media.uuid}/${media.tentativa}/${kind}`
export const reservation = Symbol('reserva validada de mídia')

export function temporaryRoot(kind: 'worker' | 'envios') {
  const namespace = createHash('sha256').update(process.env.DATABASE_URL ?? '').digest('hex').slice(0, 24)
  return join(tmpdir(), `ospapas-${kind}-${namespace}`)
}
