import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import { collections } from './access/collections.ts'

import { midias } from './media/collection.ts'

const { DATABASE_URL, PAYLOAD_SECRET, POC_PREPARE_SCHEMA } = process.env

if (!DATABASE_URL || !PAYLOAD_SECRET || PAYLOAD_SECRET.length < 32) {
  throw new Error('Configure DATABASE_URL e PAYLOAD_SECRET (mínimo de 32 caracteres).')
}

export default buildConfig({
  admin: { user: 'users' },
  collections: [...collections, midias],
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
