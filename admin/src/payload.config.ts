import { postgresAdapter } from '@payloadcms/db-postgres'
import { APIError, buildConfig } from 'payload'
import { adminConfig } from './config.ts'
import { assertDisposableDatabase } from './experimental.ts'
import { collections } from './access/collections.ts'

import { publicacoes } from './publication/queue.ts'
import { midias } from './media/collection.ts'
import { mediaPool } from './media/model.ts'
import { auditDenial, databaseConflict, protectCollection, readAudit } from './security/controls.ts'
import { assertOperational, prepareSecurity } from './security/database.ts'
import { bindSecurityTransactions } from './security/coordination.ts'

function createConfig(database: URL, secret: string, prepareSchema: boolean) {
  return buildConfig({
    admin: { user: 'users' },
    collections: [...collections, midias, publicacoes].map(protectCollection),
    endpoints: [readAudit],
    hooks: {
      afterError: [async ({ error, req }) => {
        if (databaseConflict(error)) {
          return { status: 409, response: { errors: [{ message: 'Conflito concorrente. Consulte o estado atual.' }] } }
        }
        if (error instanceof APIError) {
          await auditDenial(req, error.status).catch(() => req.payload.logger.warn('Falha ao registrar recusa de acesso.'))
        }
      }],
    },
    onInit: async payload => {
      if (prepareSchema) await prepareSecurity(payload)
      await assertOperational(mediaPool(payload))
      bindSecurityTransactions(payload)
    },
    db: postgresAdapter({
      pool: { connectionString: database.href, max: 3, connectionTimeoutMillis: 5_000 },
      transactionOptions: { isolationLevel: 'serializable' },
      push: prepareSchema,
      disableCreateDatabase: true,
    }),
    graphQL: { disable: true },
    secret,
    typescript: { autoGenerate: false },
  })
}

export async function experimentalSchemaConfig() {
  const { database, secret } = adminConfig()
  const disposable = await assertDisposableDatabase(database.href)
  return createConfig(disposable, secret, true)
}

const { database, secret } = adminConfig()
export default createConfig(database, secret, false)
