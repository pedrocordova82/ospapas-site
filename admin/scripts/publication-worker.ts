import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { closeStorage } from '../src/media/storage.ts'
import { publishOnce } from '../src/publication/worker.ts'

const payload = await getPayload({ config })
try {
  console.info(JSON.stringify(await publishOnce(payload) ?? { status: 'ocioso' }))
} finally {
  closeStorage()
  await payload.destroy()
}
