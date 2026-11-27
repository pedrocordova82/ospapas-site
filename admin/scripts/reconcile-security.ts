import { getPayload } from 'payload'
import { assertDisposableDatabase } from '../src/experimental.ts'
import { closeStorage } from '../src/media/storage.ts'
import { idPattern } from '../src/publication/contract.ts'
import { reconcileSecurity } from '../src/security/coordination.ts'

const id = process.argv[2]
if (!id || !idPattern.test(id)) throw new Error('Informe o UUID da mudança de segurança pendente.')
await assertDisposableDatabase()
const { default: config } = await import('../src/payload.config.ts')
const payload = await getPayload({ config })
try {
  console.info(JSON.stringify({ id, estado: await reconcileSecurity(payload, id, 'inspect') }))
} finally {
  await payload.destroy()
  closeStorage()
}
