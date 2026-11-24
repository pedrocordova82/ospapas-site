import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createReadStream, readFileSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { limits, MiB, type Media } from './model.ts'

type Metrics = { ffmpegRssKiB: number }
type Stream = {
  codec_type: string
  codec_name: string
  width?: number
  height?: number
  avg_frame_rate?: string
  pix_fmt?: string
  side_data_list?: { rotation?: number }[]
}
type Probe = { streams: Stream[]; format: { duration: string } }

function tool(binary: string, args: string[], metrics: Metrics) {
  return new Promise<string>((resolve, reject) => {
    const process = execFile(binary, args, { timeout: 75_000, killSignal: 'SIGKILL', maxBuffer: MiB }, (error, stdout) => {
      clearInterval(poller)
      if (error) reject(new Error('Ferramenta de mídia recusou o arquivo ou excedeu o limite.'))
      else resolve(stdout)
    })
    const poller = setInterval(() => {
      if (!process.pid) return
      try {
        const rss = readFileSync(`/proc/${process.pid}/status`, 'utf8').match(/^VmRSS:\s+(\d+)/m)?.[1]
        if (rss) metrics.ffmpegRssKiB = Math.max(metrics.ffmpegRssKiB, Number(rss))
      } catch {
        return
      }
    }, 25)
    poller.unref()
  })
}

const input = (file: string) => [
  '-protocol_whitelist', 'file', '-max_alloc', String(96 * MiB),
  '-threads', '2', '-f', 'mov', '-enable_drefs', '0', '-use_absolute_path', '0', '-i', file,
]
const ffmpeg = (args: string[], metrics: Metrics) => tool(process.env.POC_FFMPEG ?? 'ffmpeg', [
  '-nostdin', '-hide_banner', '-loglevel', 'error', '-filter_threads', '1', ...args,
], metrics)

export async function hashFile(file: string) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

export async function verifyOriginal(row: Media, file: string) {
  if ((await stat(file)).size !== Number(row.tamanho) || await hashFile(file) !== row.digest) {
    throw new Error('O conteúdo original diverge da reserva.')
  }
}

async function probe(file: string, metrics: Metrics) {
  const raw = await tool(process.env.POC_FFPROBE ?? 'ffprobe', [
    '-v', 'error', '-protocol_whitelist', 'file', '-max_alloc', String(96 * MiB),
    '-f', 'mov', '-enable_drefs', '0', '-use_absolute_path', '0', '-show_format', '-show_streams', '-of', 'json', file,
  ], metrics)
  const { streams, format } = JSON.parse(raw) as Probe
  const video = streams.find(stream => stream.codec_type === 'video')
  const audio = streams.find(stream => stream.codec_type === 'audio')
  const duration = Number(format.duration)
  const [frames, seconds] = (video?.avg_frame_rate ?? '').split('/').map(Number)
  const fps = frames / seconds
  if (!video?.width || !video.height || !Number.isFinite(duration) || duration <= 0 ||
      duration > limits.videoSeconds || Math.max(video.width, video.height) > 4096 ||
      video.width * video.height > 4096 * 2160 || !Number.isFinite(fps) || fps <= 0 || fps > 60 ||
      streams.filter(stream => stream.codec_type === 'video').length !== 1) {
    throw new Error('Vídeo fora dos limites experimentais.')
  }
  return { video, audio, duration, width: video.width, height: video.height }
}

const sharpInput = (file: string) => sharp(file, { limitInputPixels: limits.imagePixels, failOn: 'warning' })

export async function optimizeImage(file: string, dir: string) {
  const optimized = join(dir, 'otimizado.webp')
  const thumbnail = join(dir, 'miniatura.webp')
  const meta = await sharpInput(file).metadata()
  if (!meta.format || !['jpeg', 'png', 'webp'].includes(meta.format) || (meta.pages ?? 1) !== 1) {
    throw new Error('Formato de imagem indisponível.')
  }
  const { width, height } = await sharpInput(file).autoOrient()
    .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 }).toFile(optimized)
  await sharpInput(optimized)
    .resize(320, 320, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 76, effort: 3 }).toFile(thumbnail)
  return { optimized, thumbnail, width, height }
}

const within1080 = (width: number, height: number) =>
  Math.max(width, height) <= 1920 && Math.min(width, height) <= 1080

export async function optimizeVideo(file: string, dir: string, metrics: Metrics) {
  const original = await probe(file, metrics)
  const { video, audio, width, height } = original
  const canCopy = video.codec_name === 'h264' && video.pix_fmt === 'yuv420p' &&
    (!audio || audio.codec_name === 'aac') && within1080(width, height) &&
    !video.side_data_list?.some(sideData => sideData.rotation)
  const optimized = join(dir, 'otimizado.mp4')
  const codecs = canCopy ? ['-c', 'copy'] : [
    '-vf', "scale=w='min(iw,if(gte(iw,ih),1920,1080))':h='min(ih,if(gte(iw,ih),1080,1920))':force_original_aspect_ratio=decrease:force_divisible_by=2",
    '-c:v', 'libx264', '-threads', '2', '-preset', 'fast', '-crf', '23',
    '-pix_fmt', 'yuv420p', '-maxrate', '5M', '-bufsize', '10M', '-c:a', 'aac', '-b:a', '96k',
  ]
  await ffmpeg([
    ...input(file), '-map', '0:v:0', '-map', '0:a:0?', '-map_metadata', '-1',
    '-map_chapters', '-1', ...codecs, '-movflags', '+faststart', '-fs', String(limits.video), optimized,
  ], metrics)
  const output = await probe(optimized, metrics)
  if (!within1080(output.width, output.height) || output.video.codec_name !== 'h264' ||
      (audio && output.audio?.codec_name !== 'aac') || Math.abs(output.duration - original.duration) > 0.25 ||
      (await stat(optimized)).size > limits.video) throw new Error('A saída de vídeo não passou pela validação.')
  return { optimized, width: output.width, height: output.height, duration: output.duration, canCopy }
}

export async function extractPoster(file: string, dir: string, second: number, metrics: Metrics) {
  const frame = join(dir, 'quadro.png')
  const poster = join(dir, 'poster.webp')
  await ffmpeg([
    '-ss', String(second), ...input(file), '-map', '0:v:0', '-frames:v', '1',
    '-vf', "scale=w='min(iw,640)':h='min(ih,640)':force_original_aspect_ratio=decrease",
    '-threads', '1', frame,
  ], metrics)
  await sharpInput(frame).webp({ quality: 80 }).toFile(poster)
  return poster
}
