import { getPayload } from 'payload'
import { assertDisposableDatabase } from '../src/experimental.ts'
import { closeStorage } from '../src/media/storage.ts'
import { publishOnce } from '../src/publication/worker.ts'

await assertDisposableDatabase()
const { default: config } = await import('../src/payload.config.ts')
const payload = await getPayload({ config })
try {
  console.info(JSON.stringify(await publishOnce(payload) ?? { status: 'ocioso' }))
} finally {
  closeStorage()
  await payload.destroy()
}
