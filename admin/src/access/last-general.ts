import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { APIError, type PayloadRequest } from 'payload'

function postgresCode(error: unknown): unknown {
  if (!error || typeof error !== 'object') return
  if ('code' in error) return error.code
  if ('cause' in error) return postgresCode(error.cause)
}

export async function retainActiveGeneral(req: PayloadRequest) {
  const transactionID = await req.transactionID
  const database = req.payload.db as typeof req.payload.db & Pick<PostgresAdapter, 'sessions'>
  const transaction = transactionID && database.sessions[transactionID]?.db
  if (!transaction) throw new APIError('Esta alteração exige uma transação.', 409)

  // O bloqueio na mesma transação impede que duas reduções concorrentes sejam aceitas.
  try {
    const { rows } = await transaction.execute(sql`
      SELECT id FROM users
      WHERE perfil = 'geral' AND ativo = true
      ORDER BY id
      FOR UPDATE
    `)
    if (rows.length <= 1) throw new APIError('Mantenha pelo menos um Administrador Geral ativo.', 409)
  } catch (error) {
    if (['40001', '40P01'].includes(String(postgresCode(error)))) {
      throw new APIError('As contas gerais foram alteradas simultaneamente. Consulte o estado atual.', 409)
    }
    throw error
  }
}
