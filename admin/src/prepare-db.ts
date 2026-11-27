import { getPayload } from 'payload'
import { requireExperimentalEnvironment } from './config.ts'
import { experimentalBootstrap } from './experimental.ts'

requireExperimentalEnvironment()
if (process.env.NODE_ENV === 'production') {
  throw new Error('Execute db:prepare antes de iniciar o runtime de produção local.')
}

const { POC_ADMIN_EMAIL, POC_ADMIN_PASSWORD } = process.env

if (!POC_ADMIN_EMAIL || !/^[^\s@]+@example\.invalid$/i.test(POC_ADMIN_EMAIL) || !POC_ADMIN_PASSWORD || POC_ADMIN_PASSWORD.length < 16) {
  throw new Error('Informe um e-mail em example.invalid e uma senha temporária de pelo menos 16 caracteres.')
}

const { experimentalSchemaConfig } = await import('./payload.config.ts')
const payload = await getPayload({ config: await experimentalSchemaConfig() })

try {
  const { totalDocs } = await payload.count({ collection: 'users', overrideAccess: true })
  if (totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: POC_ADMIN_EMAIL, password: POC_ADMIN_PASSWORD, perfil: 'geral' },
      context: { pocBootstrap: experimentalBootstrap },
      overrideAccess: true,
    })
    console.info('Esquema preparado e primeira conta experimental criada.')
  } else {
    console.info('Esquema preparado e conta existente preservada.')
  }
} finally {
  await payload.destroy()
}
