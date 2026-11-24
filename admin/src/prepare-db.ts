import { getPayload } from 'payload'

if (process.env.NODE_ENV === 'production') {
  throw new Error('Prepare o banco descartável antes de iniciar o servidor em produção.')
}

const { DATABASE_URL, POC_ADMIN_EMAIL, POC_ADMIN_PASSWORD } = process.env
const database = DATABASE_URL && new URL(DATABASE_URL)

if (
  !database ||
  !['postgres:', 'postgresql:'].includes(database.protocol) ||
  !['localhost', '127.0.0.1', '[::1]'].includes(database.hostname)
) {
  throw new Error('A preparação do esquema exige um PostgreSQL local e descartável.')
}

if (!POC_ADMIN_EMAIL || !POC_ADMIN_PASSWORD || POC_ADMIN_PASSWORD.length < 16) {
  throw new Error('Informe um e-mail fictício e uma senha temporária de pelo menos 16 caracteres.')
}

process.env.POC_PREPARE_SCHEMA = '1'
const { default: config } = await import('./payload.config')
const payload = await getPayload({ config })

try {
  const { totalDocs } = await payload.count({ collection: 'users' })
  if (totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: POC_ADMIN_EMAIL, password: POC_ADMIN_PASSWORD },
    })
    console.info('Esquema preparado e primeira conta experimental criada.')
  } else {
    console.info('Esquema preparado e conta existente preservada.')
  }
} finally {
  await payload.destroy()
}
