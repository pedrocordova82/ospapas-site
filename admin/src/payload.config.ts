import { postgresAdapter } from '@payloadcms/db-postgres'
import { APIError, buildConfig } from 'payload'
import { collections } from './access/collections.ts'

import { publicacoes } from './publication/queue.ts'
import { midias } from './media/collection.ts'
import { mediaPool } from './media/model.ts'
import { auditDenial, databaseConflict, protectCollection, readAudit } from './security/controls.ts'
import { assertOperational, prepareSecurity } from './security/database.ts'
import { bindSecurityTransactions } from './security/coordination.ts'

const { DATABASE_URL, PAYLOAD_SECRET, POC_PREPARE_SCHEMA } = process.env

if (!DATABASE_URL || !PAYLOAD_SECRET || PAYLOAD_SECRET.length < 32) {
  throw new Error('Configure DATABASE_URL e PAYLOAD_SECRET (mínimo de 32 caracteres).')
}

export default buildConfig({
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
    if (POC_PREPARE_SCHEMA === '1') await prepareSecurity(payload)
    await assertOperational(mediaPool(payload))
    bindSecurityTransactions(payload)
  },
  db: postgresAdapter({
    pool: { connectionString: DATABASE_URL, max: 3, connectionTimeoutMillis: 5_000 },
    transactionOptions: { isolationLevel: 'serializable' },
    push: POC_PREPARE_SCHEMA === '1',
    disableCreateDatabase: true,
  }),
  graphQL: { disable: true },
  secret: PAYLOAD_SECRET,
  typescript: { autoGenerate: false },
})
