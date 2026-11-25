import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { closeStorage } from '../src/media/storage.ts'
import { idPattern } from '../src/publication/contract.ts'
import { reconcileSecurity } from '../src/security/coordination.ts'
import { databaseURL } from '../src/security/recovery-db.ts'

const id = process.argv[2]
databaseURL(process.env.DATABASE_URL)
if (!id || !idPattern.test(id)) throw new Error('Informe o UUID da mudança de segurança pendente.')
const payload = await getPayload({ config })
try {
  console.info(JSON.stringify({ id, estado: await reconcileSecurity(payload, id, 'inspect') }))
} finally {
  await payload.destroy()
  closeStorage()
}
