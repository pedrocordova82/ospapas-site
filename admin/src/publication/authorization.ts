import { relationID } from '../access/policies.ts'
import type { mediaPool } from '../media/model.ts'
import { isSection, type Section } from './contract.ts'
import type { Intent } from './projection.ts'

type Client = Pick<ReturnType<typeof mediaPool>, 'query'>
type Account = { id: number; perfil: string; ativo: boolean; regional_id: number | null }
export type PublicationRequest = { operador: number | string; pedido: Intent }

const tables: Record<Section, string> = {
  sedes: 'regionais', membros: 'membros', agenda: 'agenda', eventos: 'eventos', diretoria: 'diretoria',
}

function activeAdministrator(account: Account | undefined): account is Account {
  return account?.ativo === true &&
    (account.perfil === 'geral' || (account.perfil === 'regional' && relationID(account.regional_id) !== undefined))
}

export async function publicationRefusal(
  client: Client,
  { operador, pedido }: PublicationRequest,
  { lock = false, requester }: { lock?: boolean; requester?: number } = {},
) {
  const operatorID = relationID(operador)
  if (!operatorID) return 'autorizacao_revogada'
  const share = lock ? 'FOR SHARE' : ''
  const { rows: accounts } = await client.query<Account>(`
    SELECT id, perfil, ativo, regional_id FROM users WHERE id = ANY($1::integer[]) ORDER BY id ${share}
  `, [[operatorID, requester ?? operatorID]])
  const operator = accounts.find(account => account.id === operatorID)
  const caller = accounts.find(account => account.id === (requester ?? operatorID))
  if (!activeAdministrator(operator) || !activeAdministrator(caller) ||
      (caller.id !== operatorID && caller.perfil !== 'geral')) return 'autorizacao_revogada'
  if (operator.perfil === 'regional') {
    const { rows: [unit] } = await client.query(`SELECT ativo FROM regionais WHERE id = $1 ${share}`, [operator.regional_id])
    if (unit?.ativo !== true) return 'autorizacao_revogada'
  }

  if (pedido.acao === 'restaurar' || pedido.acao === 'revogar') {
    if (operator.perfil !== 'geral' || caller.perfil !== 'geral') return 'autorizacao_revogada'
    return
  }
  if (pedido.acao !== 'publicar') return 'autorizacao_revogada'

  for (const record of pedido.registros) {
    const section = record.colecao
    if (!isSection(section)) return 'registro_alterado'
    const hasRegion = section !== 'sedes' && section !== 'diretoria'
    const { rows: [source] } = await client.query<{ ativo: boolean; regional: number | null; status: string | null }>(`
      SELECT ativo, ${hasRegion ? 'regional_id' : 'null'} AS regional,
        ${section === 'agenda' ? '_status' : 'null'} AS status
      FROM ${tables[section]} WHERE id = $1 ${share}
    `, [record.sourceId])
    if (!source) return 'registro_alterado'
    const owner = section === 'sedes' ? record.sourceId : relationID(source.regional)
    if (operator.perfil === 'regional' && (section === 'diretoria' || owner !== relationID(operator.regional_id))) {
      return 'autorizacao_revogada'
    }
    if (owner !== record.unidade || source.ativo !== Boolean(record.dado) ||
        (section === 'agenda' && source.status !== 'published')) return 'registro_alterado'
  }
}
