import {
  CreateBucketCommand, GetObjectCommand, HeadObjectCommand, PutObjectCommand,
} from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'
import { storage } from '../media/storage.ts'
import { hash, isEnvironment, jsonBytes, maxPublicJSON, parseManifest, version, type Environment } from './contract.ts'

export function publicationEnvironment(): Environment {
  const value = process.env.POC_PUBLIC_ENV ?? 'dev'
  if (!isEnvironment(value)) throw new Error('Ambiente de publicação inválido.')
  return value
}

export function destinations(environment: Environment) {
  const prefix = process.env.POC_PUBLIC_PREFIX
  if (!prefix || !/^[a-z0-9][a-z0-9-]{1,35}$/.test(prefix)) throw new Error('Configure o prefixo de publicação local.')
  const releases = `${prefix}-${environment}-releases`
  const media = `${prefix}-${environment}-midias`
  if (['dev', 'hml', 'prd'].some(env => [`${prefix}-${env}-releases`, `${prefix}-${env}-midias`].includes(storage().bucket))) throw new Error('Separe armazenamento privado de destinos públicos.')
  return { releases, media }
}

const noStore = 'no-store'
const immutable = 'public, max-age=31536000, immutable'
export const manifestKey = 'manifest.json'
const initializationKey = 'controle/inicializacao.json'

export function missing(error: unknown) {
  return error instanceof Error && ['NoSuchKey', 'NotFound', 'NoSuchBucket'].includes(error.name)
}

function conflicts(error: unknown) {
  return error instanceof Error && ['PreconditionFailed', 'ConditionalRequestConflict', '412', '409'].includes(error.name)
}

export class ReleaseStore {
  readonly environment: Environment
  readonly buckets: ReturnType<typeof destinations>
  operations = 0
  reused = 0

  constructor(environment: Environment) {
    this.environment = environment
    this.buckets = destinations(environment)
  }

  async prepare() {
    for (const bucket of Object.values(this.buckets)) {
      await storage().client.send(new CreateBucketCommand({ Bucket: bucket }))
    }
    await this.initialize()
  }

  async read(bucket: 'releases' | 'media', key: string, max = maxPublicJSON) {
    this.operations++
    const result = await storage().client.send(new GetObjectCommand({ Bucket: this.buckets[bucket], Key: key }), {
      abortSignal: AbortSignal.timeout(30_000),
    })
    if (!result.Body) throw new Error('Objeto sem corpo.')
    const stream = result.Body.transformToWebStream()
    const chunks: Uint8Array[] = []
    let size = 0
    const reader = stream.getReader()
    try {
      if ((result.ContentLength ?? 0) > max) throw new Error('Objeto excede o limite.')
      for (;;) {
        const item = await reader.read()
        if (item.done) break
        size += item.value.byteLength
        if (size > max) throw new Error('Objeto excede o limite.')
        chunks.push(item.value)
      }
    } catch (error) {
      await reader.cancel()
      throw error
    } finally {
      reader.releaseLock()
    }
    return { bytes: Buffer.concat(chunks), etag: result.ETag }
  }

  async manifest() {
    try {
      const { bytes, etag } = await this.read('releases', manifestKey)
      if (!etag) throw new Error('Manifesto sem ETag.')
      return { value: parseManifest(JSON.parse(bytes.toString()), this.environment), etag }
    } catch (error) {
      if (missing(error)) return null
      throw error
    }
  }

  async pointer() {
    const current = await this.manifest()
    return current?.value.ativa ? { value: current.value, etag: current.etag } : null
  }

  async initialize() {
    const current = await this.manifest()
    if (current) return current
    const lineage = randomUUID()
    const initial = jsonBytes({
      versao: version, ambiente: this.environment, ativa: null, linhagem: lineage, geracao: lineage, revisao: 0,
    })
    try {
      await this.write(initializationKey, initial)
    } catch (error) {
      if (!conflicts(error)) throw error
      const winner = await this.manifest()
      if (winner) return winner
      throw new Error('Inicialização pendente ou manifesto perdido. Reconciliação exige intervenção.')
    }
    try {
      await this.write(manifestKey, initial)
    } catch (error) {
      const observed = await this.manifest()
      if (!observed) throw error
      return observed
    }
    const created = await this.manifest()
    if (!created) throw new Error('Manifesto inicial indisponível.')
    return created
  }

  async verifyMedia(key: string) {
    const checksum = key.split('/')[1].split('.')[0]
    this.operations++
    const head = await storage().client.send(new HeadObjectCommand({ Bucket: this.buckets.media, Key: key }), {
      abortSignal: AbortSignal.timeout(15_000),
    })
    const type = key.endsWith('.mp4') ? 'video/mp4' : 'image/webp'
    if (head.Metadata?.sha256 !== checksum || !head.ContentLength || head.ContentType !== type) {
      throw new Error('Mídia publicada inconsistente.')
    }
  }

  async putImmutable(bucket: 'releases' | 'media', key: string, bytes: Buffer, type: string) {
    const checksum = hash(bytes)
    try {
      this.operations++
      await storage().client.send(new PutObjectCommand({
        Bucket: this.buckets[bucket], Key: key, Body: bytes, ContentType: type,
        CacheControl: immutable, IfNoneMatch: '*', Metadata: { sha256: checksum },
      }), { abortSignal: AbortSignal.timeout(30_000) })
    } catch (error) {
      if (!conflicts(error)) throw error
      if (bucket === 'media') await this.verifyMedia(key)
      else if (hash((await this.read(bucket, key)).bytes) !== checksum) throw new Error('Objeto imutável divergente.')
      this.reused++
    }
  }

  async activate(bytes: Buffer, etag: string) {
    if (!etag) throw new Error('A ativação exige uma geração anterior.')
    await this.write(manifestKey, bytes, etag)
  }

  private async write(key: string, bytes: Buffer, etag?: string) {
    this.operations++
    await storage().client.send(new PutObjectCommand({
      Bucket: this.buckets.releases, Key: key, Body: bytes,
      ContentType: 'application/json', CacheControl: noStore,
      ...(etag ? { IfMatch: etag } : { IfNoneMatch: '*' }),
    }), { abortSignal: AbortSignal.timeout(30_000) })
  }
}
