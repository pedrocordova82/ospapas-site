import { randomUUID } from 'node:crypto'
import { sql } from '@payloadcms/db-postgres'
import { APIError, type CollectionBeforeChangeHook, type CollectionConfig, type Endpoint, type PayloadRequest } from 'payload'
import { actor, deny, relationID } from '../access/policies.ts'
import { mediaPool } from '../media/model.ts'
import { publicationEnvironment } from '../publication/store.ts'
import { activeUnit, session, type DatabaseClient } from './database.ts'
import { checkSecurity, conflictingMutation, coordinatePayload } from './coordination.ts'

const identifiers = new WeakMap<PayloadRequest, string>()

function correlation(req: PayloadRequest) {
  const id = identifiers.get(req) ?? randomUUID()
  identifiers.set(req, id)
  return id
}

export async function checkUnit(req: PayloadRequest, user: { perfil?: unknown; regional?: unknown } | undefined = actor(req)) {
  if (user) await checkSecurity(req)
  const region = relationID(user?.regional)
  if (user?.perfil === 'regional' && (!region || !await activeUnit(req, region))) {
    deny('Unidade administrativa inativa.')
  }
}

export const auditChange: CollectionBeforeChangeHook = async ({ collection, req, data, originalDoc }) => {
  const transaction = await session(req)
  if (!transaction) throw new APIError('Alteração exige transação.', 409)
  const user = actor(req)
  const id = relationID(user?.id)
  const region = relationID(user?.regional)
  if (user && id) {
    const { rows: [current] } = await transaction.execute(sql`
      SELECT perfil, ativo, regional_id FROM users WHERE id = ${id} FOR SHARE
    `)
    if (current?.ativo !== true || current.perfil !== user?.perfil ||
        (user.perfil === 'regional' && relationID(current.regional_id) !== region)) deny()
    if (user.perfil === 'regional') {
      const { rows: [unit] } = await transaction.execute(sql`
        SELECT ativo FROM regionais WHERE id = ${region} FOR SHARE
      `)
      if (unit?.ativo !== true) deny('Unidade administrativa inativa.')
    }
  }
  const expected = req.headers.get('if-match')
  if (collection.slug === 'membros' && expected !== null) {
    const record = relationID(originalDoc?.id)
    if (!record) throw new APIError('A revisão só se aplica a um membro existente.', 409)
    const { rows: [current] } = await transaction.execute(sql`
      SELECT to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS revision
      FROM membros WHERE id = ${record} FOR UPDATE
    `)
    if (current?.revision == null || expected !== JSON.stringify(current.revision)) {
      throw new APIError('O registro mudou. Consulte a versão atual antes de editar.', 409)
    }
  }
  await transaction.execute(sql`
    SELECT set_config('poc.operador', ${id == null ? '' : String(id)}, true),
           set_config('poc.ambiente', ${publicationEnvironment()}, true),
           set_config('poc.correlacao', ${correlation(req)}, true),
           set_config('poc.operacao', ${req.routeParams?.versionID ? 'restaurar' : ''}, true)
  `)
  const conflict = conflictingMutation(collection.slug, data, originalDoc)
  if (conflict) await coordinatePayload(req, conflict)
  return data
}

export function protectCollection(collection: CollectionConfig) {
  const access = { ...collection.access }
  for (const mode of ['read', 'create', 'update', 'readVersions'] as const) {
    const original = access[mode]
    if (!original) continue
    access[mode] = async args => {
      await checkUnit(args.req)
      return original(args)
    }
  }
  return {
    ...collection, access,
    hooks: { ...collection.hooks, beforeChange: [...(collection.hooks?.beforeChange ?? []), auditChange] },
  }
}

export async function auditContext(client: DatabaseClient, req: PayloadRequest) {
  await client.query(`SELECT set_config('poc.operador', $1, true), set_config('poc.ambiente', $2, true),
    set_config('poc.correlacao', $3, true)`, [String(actor(req)?.id ?? ''), publicationEnvironment(), correlation(req)])
}

export async function lockOperator(client: DatabaseClient, req: PayloadRequest) {
  const user = actor(req)
  if (!user) deny()
  const { rows: [current] } = await client.query('SELECT perfil, ativo, regional_id FROM users WHERE id = $1 FOR SHARE', [user.id])
  if (current?.ativo !== true || current.perfil !== user.perfil) deny()
  if (user.perfil === 'regional') {
    if (relationID(current.regional_id) !== relationID(user.regional)) deny()
    const { rows: [unit] } = await client.query('SELECT ativo FROM regionais WHERE id = $1 FOR SHARE', [current.regional_id])
    if (unit?.ativo !== true) deny('Unidade administrativa inativa.')
  }
}

export function databaseConflict(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  if ('code' in error && (error.code === '40001' || error.code === '40P01')) return true
  return 'cause' in error && databaseConflict(error.cause)
}

const monitored = new Set(['users', 'regionais', 'membros', 'agenda', 'eventos', 'diretoria', 'midias', 'publicacoes', 'auditoria'])

export async function auditDenial(req: PayloadRequest, status: number) {
  const entity = new URL(req.url ?? '', 'http://localhost').pathname.split('/')[2]
  if (![401, 403, 429].includes(status) || !monitored.has(entity)) return
  const user = actor(req)
  await mediaPool(req.payload).query(`
    INSERT INTO poc_audit (operador, processo, ambiente, operacao, entidade, resultado, correlacao, janela)
    VALUES ($1, 'api', $2, 'autorizar', $3, 'recusado', $4, date_trunc('minute', now()))
    ON CONFLICT (ambiente, entidade, janela) DO NOTHING
  `, [relationID(user?.id) ?? null, publicationEnvironment(), entity, correlation(req)])
}

export const readAudit: Endpoint = {
  method: 'get', path: '/auditoria',
  handler: async req => {
    const user = actor(req)
    if (!user) deny()
    const cursor = parseAuditCursor(req)
    const client = await mediaPool(req.payload).connect()
    try {
      await client.query('BEGIN ISOLATION LEVEL READ COMMITTED')
      await lockOperator(client, req)
      const { rows } = await client.query(`
        SELECT id, instante, operador, processo, ambiente, regional, operacao, entidade, registro,
          anterior, novo, resultado, correlacao FROM poc_audit
        WHERE ambiente = $1 AND ($2::integer IS NULL OR regional = $2)
        AND ($3::timestamptz IS NULL OR instante < $3)
        ORDER BY instante DESC LIMIT 100
      `, [publicationEnvironment(), user.perfil === 'regional' ? relationID(user.regional) : null, cursor])
      await client.query('COMMIT')
      return Response.json({ eventos: rows }, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  },
}

function parseAuditCursor(req: PayloadRequest) {
  const value = new URL(req.url ?? '', 'http://localhost').searchParams.get('antes')
  if (value === null) return null
  if (value.length > 30 || !Number.isFinite(Date.parse(value))) throw new APIError('Cursor inválido.', 400)
  return new Date(value).toISOString()
}
