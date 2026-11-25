import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { CreateBucketCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { hash, type Environment } from '../publication/contract.ts'

export const maximumObject = 224 * 1024 ** 2
const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])

export function localURL(input: string | undefined, protocols: string[]) {
  let url: URL
  try {
    url = new URL(input ?? '')
  } catch {
    throw new Error('Configure um endereço local válido.')
  }
  if (!protocols.includes(url.protocol) || !loopback.has(url.hostname)) {
    throw new Error('A recuperação só pode usar recursos locais descartáveis.')
  }
  return url
}

export class RecoveryStorage {
  readonly client: S3Client
  readonly bucket: string
  readonly environment: Environment
  readonly #key: Buffer
  operations = 0

  constructor(environment: Environment) {
    this.environment = environment
    const {
      POC_BACKUP_ENDPOINT, POC_BACKUP_PREFIX, POC_BACKUP_ACCESS_KEY, POC_BACKUP_SECRET_KEY, POC_BACKUP_KEY,
      POC_S3_ACCESS_KEY, POC_S3_SECRET_KEY,
    } = process.env
    const endpoint = localURL(POC_BACKUP_ENDPOINT, ['http:', 'https:'])
    if (environment === 'prd' || !POC_BACKUP_PREFIX || !/^[a-z0-9][a-z0-9-]{1,25}$/.test(POC_BACKUP_PREFIX) ||
        !POC_BACKUP_ACCESS_KEY || !POC_BACKUP_SECRET_KEY || POC_BACKUP_ACCESS_KEY === POC_S3_ACCESS_KEY ||
        POC_BACKUP_SECRET_KEY === POC_S3_SECRET_KEY || !POC_BACKUP_KEY || !/^[0-9a-f]{64}$/i.test(POC_BACKUP_KEY)) {
      throw new Error('Configure credenciais de recuperação separadas, chave AES-256 e ambiente local DEV ou HML.')
    }
    this.bucket = `${POC_BACKUP_PREFIX}-${environment}-backup`
    if (this.bucket === process.env.POC_S3_BUCKET) throw new Error('Separe o armazenamento de recuperação da mídia privada.')
    this.#key = Buffer.from(POC_BACKUP_KEY, 'hex')
    this.client = new S3Client({
      endpoint: endpoint.href, region: 'us-east-1', forcePathStyle: true, maxAttempts: 1,
      credentials: { accessKeyId: POC_BACKUP_ACCESS_KEY, secretAccessKey: POC_BACKUP_SECRET_KEY },
      requestChecksumCalculation: 'WHEN_REQUIRED', responseChecksumValidation: 'WHEN_REQUIRED',
    })
  }

  async prepare(bucket = this.bucket) {
    this.operations++
    await this.client.send(new CreateBucketCommand({ Bucket: bucket }), { abortSignal: AbortSignal.timeout(30_000) })
  }

  async get(key: string) {
    return (await this.readVersion(key)).bytes
  }

  async readVersion(key: string) {
    this.operations++
    const { bytes, etag } = await readObject(this.client, this.bucket, key)
    if (bytes.length < 28) throw new Error('Objeto cifrado inválido.')
    const decipher = createDecipheriv('aes-256-gcm', this.#key, bytes.subarray(0, 12))
    decipher.setAAD(Buffer.from(`${this.bucket}/${key}`))
    decipher.setAuthTag(bytes.subarray(12, 28))
    try {
      return { bytes: Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]), etag }
    } catch {
      throw new Error('Falha de integridade do objeto cifrado.')
    }
  }

  async put(key: string, bytes: Buffer, deduplicate = false, etag?: string) {
    if (bytes.length > maximumObject) throw new Error('Objeto excede o limite da recuperação local.')
    const nonce = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.#key, nonce)
    cipher.setAAD(Buffer.from(`${this.bucket}/${key}`))
    const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()])
    try {
      await this.putObject(this.bucket, key, Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]), 'application/octet-stream', etag)
    } catch (error) {
      if (!deduplicate || !(error instanceof Error) ||
          !['PreconditionFailed', 'ConditionalRequestConflict'].includes(error.name)) throw error
      if (hash(await this.get(key)) !== hash(bytes)) throw new Error('Objeto de backup preexistente divergente.')
    }
  }

  async putObject(bucket: string, key: string, bytes: Buffer, type: string, etag?: string) {
    this.operations++
    await this.client.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: bytes, ContentType: type, ...(etag ? { IfMatch: etag } : { IfNoneMatch: '*' }),
    }), { abortSignal: AbortSignal.timeout(30_000) })
  }

  close() {
    this.#key.fill(0)
    this.client.destroy()
  }
}

export async function readObject(client: S3Client, bucket: string, key: string) {
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }), {
    abortSignal: AbortSignal.timeout(30_000),
  })
  if (!response.Body) throw new Error('Objeto obrigatório sem conteúdo.')
  const stream = response.Body.transformToWebStream()
  if ((response.ContentLength ?? 0) > maximumObject + 28) {
    await stream.cancel()
    throw new Error('Objeto excede o limite da recuperação local.')
  }
  const reader = stream.getReader()
  let size = 0
  const chunks: Buffer[] = []
  try {
    for (;;) {
      const next = await reader.read()
      if (next.done) break
      size += next.value.length
      if (size > maximumObject + 28) throw new Error('Objeto excede o limite da recuperação local.')
      chunks.push(Buffer.from(next.value))
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined)
    throw error
  } finally {
    reader.releaseLock()
  }
  if (response.ContentLength !== undefined && size !== response.ContentLength) throw new Error('Objeto truncado.')
  return {
    bytes: Buffer.concat(chunks), type: response.ContentType ?? 'application/octet-stream',
    etag: response.ETag ?? null, version: response.VersionId ?? null,
  }
}
