import { setTimeout as delay } from 'node:timers/promises'
import { getPayload } from 'payload'
import { assertDisposableDatabase } from '../src/experimental.ts'
import { closeStorage } from '../src/media/storage.ts'
import { workOnce } from '../src/media/worker.ts'

await assertDisposableDatabase()
const { default: config } = await import('../src/payload.config.ts')
const payload = await getPayload({ config })
let running = process.argv.includes('--loop')
process.once('SIGINT', () => { running = false })
process.once('SIGTERM', () => { running = false })
try {
  do {
    await workOnce(payload)
    if (running) await delay(1000)
  } while (running)
} finally {
  closeStorage()
  await payload.destroy()
}
