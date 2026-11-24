import { createHash } from 'node:crypto'
import { createWriteStream } from 'node:fs'
import { open } from 'node:fs/promises'
import { Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { APIError } from 'payload'

export async function receiveBody(body: ReadableStream<Uint8Array>, file: string, expected: number, signal?: AbortSignal) {
  const hash = createHash('sha256')
  let size = 0
  const measure = new Transform({
    transform(chunk: Buffer, _, callback) {
      size += chunk.length
      if (size > expected) return callback(new APIError('Arquivo maior que a reserva.', 413))
      hash.update(chunk)
      callback(null, chunk)
    },
  })
  await pipeline(body, measure, createWriteStream(file, { flags: 'wx', mode: 0o600 }), {
    signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(120_000)]) : AbortSignal.timeout(120_000),
  })
  if (size !== expected) throw new APIError('Tamanho recebido difere da reserva.', 400)
  return hash.digest('hex')
}

export async function detectMedia(file: string) {
  const fd = await open(file, 'r')
  const head = Buffer.alloc(16)
  try {
    await fd.read(head)
  } finally {
    await fd.close()
  }
  if (head.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return 'image/jpeg'
  if (head.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png'
  if (head.toString('ascii', 0, 4) === 'RIFF' && head.toString('ascii', 8, 12) === 'WEBP') return 'image/webp'
  if (head.toString('ascii', 4, 8) === 'ftyp') {
    const brand = head.toString('ascii', 8, 12)
    if (brand === 'qt  ') return 'video/quicktime'
    if (/^(isom|iso[2-9]|mp4[12]|avc1|M4V )$/.test(brand)) return 'video/mp4'
  }
}
