import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type Access, type CollectionConfig } from 'payload'

const { DATABASE_URL, PAYLOAD_SECRET, POC_PREPARE_SCHEMA } = process.env

if (!DATABASE_URL || !PAYLOAD_SECRET || PAYLOAD_SECRET.length < 32) {
  throw new Error('Configure DATABASE_URL e PAYLOAD_SECRET (mínimo de 32 caracteres).')
}

const authenticated: Access = ({ req }) => Boolean(req.user)

const users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  auth: true,
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [],
}

const records: CollectionConfig = {
  slug: 'registros-experimentais',
  labels: { singular: 'Registro experimental', plural: 'Registros experimentais' },
  admin: { useAsTitle: 'titulo' },
  access: {
    create: authenticated,
    read: authenticated,
    update: authenticated,
    delete: authenticated,
  },
  fields: [{ name: 'titulo', type: 'text', label: 'Título', required: true }],
}

export default buildConfig({
  admin: { user: users.slug },
  collections: [users, records],
  db: postgresAdapter({
    pool: { connectionString: DATABASE_URL, max: 3, connectionTimeoutMillis: 5_000 },
    push: POC_PREPARE_SCHEMA === '1',
    disableCreateDatabase: true,
  }),
  graphQL: { disable: true },
  secret: PAYLOAD_SECRET,
  typescript: { autoGenerate: false },
})
