import { createReadStream, createWriteStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { CreateBucketCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

let client: S3Client | undefined

export function storage() {
  const { POC_S3_ENDPOINT, POC_S3_BUCKET, POC_S3_ACCESS_KEY, POC_S3_SECRET_KEY } = process.env
  const endpoint = POC_S3_ENDPOINT && new URL(POC_S3_ENDPOINT)
  if (!endpoint || !['http:', 'https:'].includes(endpoint.protocol) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname) ||
      !POC_S3_BUCKET || !POC_S3_ACCESS_KEY || !POC_S3_SECRET_KEY) {
    throw new Error('Configure o emulador S3 local e as credenciais fictícias da PoC.')
  }
  client ??= new S3Client({
    endpoint: endpoint.href,
    forcePathStyle: true,
    region: 'us-east-1',
    credentials: { accessKeyId: POC_S3_ACCESS_KEY, secretAccessKey: POC_S3_SECRET_KEY },
    maxAttempts: 1,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
  return { client, bucket: POC_S3_BUCKET }
}

export async function prepareStorage() {
  const { client, bucket } = storage()
  await client.send(new CreateBucketCommand({ Bucket: bucket }))
}

export async function storeFile(key: string, file: string, type: string) {
  const { client, bucket } = storage()
  const body = createReadStream(file)
  try {
    await client.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: body, ContentLength: (await stat(file)).size,
      ContentType: type, IfNoneMatch: '*',
    }), { abortSignal: AbortSignal.timeout(30_000) })
  } finally {
    body.destroy()
  }
}

export async function removeObject(key: string) {
  const { client, bucket } = storage()
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }), { abortSignal: AbortSignal.timeout(15_000) })
}

export function fetchObject(key: string, range?: string) {
  const { client, bucket } = storage()
  return client.send(new GetObjectCommand({ Bucket: bucket, Key: key, Range: range }), {
    abortSignal: AbortSignal.timeout(30_000),
  })
}

export async function fetchFile(key: string, file: string, maximum: number) {
  const { Body, ContentLength } = await fetchObject(key)
  if (!Body) throw new Error('Objeto de mídia sem conteúdo.')
  const stream = Body.transformToWebStream()
  if (ContentLength !== undefined && ContentLength > maximum) {
    await stream.cancel()
    throw new Error('Objeto de mídia excede o tamanho esperado.')
  }
  let size = 0
  const bound = new Transform({
    transform(chunk: Buffer, _, callback) {
      size += chunk.length
      if (size > maximum) return callback(new Error('Objeto de mídia excede o tamanho esperado.'))
      callback(null, chunk)
    },
  })
  await pipeline(stream, bound, createWriteStream(file, { flags: 'wx', mode: 0o600 }), {
    signal: AbortSignal.timeout(30_000),
  })
}

export function closeStorage() {
  client?.destroy()
  client = undefined
}
