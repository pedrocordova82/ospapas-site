import { createServer } from 'node:http'
import { loadPublication, publicObject, renderPublication } from '../src/publication/consumer.ts'
import { publicationEnvironment, ReleaseStore } from '../src/publication/store.ts'
import { closeStorage } from '../src/media/storage.ts'

const server = createServer(async (req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (req.method !== 'GET') {
    res.writeHead(405).end()
    return
  }
  try {
    if (req.url === '/healthz') {
      res.writeHead(200).end('ok')
      return
    }
    const store = new ReleaseStore(publicationEnvironment())
    const get = (path: string) => publicObject(store, path)
    if (req.url === '/') {
      const { release, snapshot } = await loadPublication(async path => {
        const object = await get(path)
        if (!object) throw new Error('Release indisponível.')
        return object.bytes
      }, store.environment)
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(renderPublication(release, snapshot))
      return
    }
    const object = await get((req.url ?? '/').slice(1))
    if (!object) {
      res.writeHead(404).end('Conteúdo indisponível.')
      return
    }
    res.writeHead(200, { 'Content-Type': object.type }).end(object.bytes)
  } catch {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Publicação temporariamente indisponível.')
  }
})

server.listen(Number(process.env.POC_PUBLIC_PORT ?? 3190), '127.0.0.1')
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => server.close(() => closeStorage()))
}
