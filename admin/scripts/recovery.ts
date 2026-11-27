import { getPayload } from 'payload'
import { assertDisposableDatabase } from '../src/experimental.ts'
import { closeStorage } from '../src/media/storage.ts'
import { isEnvironment } from '../src/publication/contract.ts'
import { backup, restore } from '../src/security/recovery.ts'

const [operation, id, environment, label] = process.argv.slice(2)
const target = process.env.POC_RECOVERY_DATABASE_URL
if (operation !== 'backup' && (operation !== 'restore' || !id || !isEnvironment(environment) || !label || !target)) {
  throw new Error('Informe backup ou restore <id> <ambiente> <rótulo> com destino descartável configurado.')
}

await assertDisposableDatabase()
if (operation === 'restore') await assertDisposableDatabase(target)
const { default: config } = await import('../src/payload.config.ts')
const payload = await getPayload({ config })
try {
  const result = operation === 'backup'
    ? await backup(payload)
    : await restore(payload, id, target!, isEnvironment(environment) ? environment : 'dev', label)
  console.info(JSON.stringify(result))
} catch {
  console.error('Operação de recuperação recusada ou com falha. Consulte a auditoria e o roteiro da Etapa 02G.')
  process.exitCode = 1
} finally {
  closeStorage()
  await payload.destroy()
}
