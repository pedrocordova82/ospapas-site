import { sql, type PostgresAdapter } from '@payloadcms/db-postgres'
import { randomUUID } from 'node:crypto'
import { APIError, type CollectionConfig, type PayloadRequest, type Where } from 'payload'
import { actor, deny, relationID } from '../access/policies.ts'
import { mediaPool } from '../media/model.ts'
import { hash, hashPattern, idPattern, isSection, mediaPattern, plain } from './contract.ts'
import { capture, type Intent, type Selection } from './projection.ts'
import { publicationEnvironment } from './store.ts'

const enqueue = Symbol('publicação autorizada')

export const publicacoes: CollectionConfig = {
  slug: 'publicacoes',
  labels: { singular: 'Publicação experimental', plural: 'Publicações experimentais' },
  admin: { useAsTitle: 'release' },
  access: {
    read: ({ req }): false | Where => {
      const user = actor(req)
      if (!user) return false
      const ambiente = { equals: publicationEnvironment() }
      return user.perfil === 'geral' ? { ambiente } : { ambiente, operador: { equals: user.id } }
    },
    create: ({ req }) => Boolean(actor(req)) && req.context.publication === enqueue,
    update: () => false,
    delete: () => false,
  },
  fields: [
    { name: 'chave', type: 'text', unique: true, required: true },
    { name: 'assinatura', type: 'text', required: true },
    { name: 'release', type: 'text', unique: true, required: true },
    { name: 'ambiente', type: 'text', required: true, index: true },
    { name: 'operador', type: 'number', required: true, index: true },
    { name: 'estado', type: 'text', required: true, index: true },
    { name: 'pedido', type: 'json', required: true, access: { read: () => false } },
    { name: 'tentativas', type: 'number', defaultValue: 0, required: true },
    { name: 'expira', type: 'date' },
    { name: 'erro', type: 'text' },
  ],
  endpoints: [
    { method: 'post', path: '/solicitar', handler: requestPublication },
    { method: 'post', path: '/:id/repetir', handler: retry },
  ],
}

async function readJSON(req: PayloadRequest) {
  const reader = req.body?.getReader()
  if (!reader) throw new APIError('Solicitação vazia.', 400)
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    for (;;) {
      const chunk = await reader.read()
      if (chunk.done) break
      length += chunk.value.byteLength
      if (length > 8192) {
        await reader.cancel()
        throw new APIError('Solicitação excede o limite.', 413)
      }
      chunks.push(chunk.value)
    }
  } finally {
    reader.releaseLock()
  }
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString())
    if (plain(value)) return value
  } catch {
    // A API devolve uma mensagem estável para corpos inválidos.
  }
  throw new APIError('Solicitação inválida.', 400)
}

function selections(input: unknown): Selection[] {
  if (!Array.isArray(input) || input.length < 1 || input.length > 30) {
    throw new APIError('Selecione de um a trinta registros.', 400)
  }
  const seen = new Set<string>()
  return input.map(item => {
    if (!plain(item) || Object.keys(item).length !== 2 || !isSection(item.colecao) ||
        typeof item.id !== 'number' || !relationID(item.id)) throw new APIError('Seleção inválida.', 400)
    const key = `${item.colecao}:${item.id}`
    if (seen.has(key)) throw new APIError('Registro repetido.', 400)
    seen.add(key)
    return { colecao: item.colecao, id: item.id }
  })
}

async function requestPublication(req: PayloadRequest) {
  const user = actor(req)
  if (!user) deny()
  const key = req.headers.get('idempotency-key') ?? ''
  if (!/^[A-Za-z0-9_-]{8,80}$/.test(key)) throw new APIError('Chave de idempotência inválida.', 400)
  const input = await readJSON(req)
  const ambiente = publicationEnvironment()
  if (input.ambiente !== ambiente) deny('O destino deve ser o ambiente desta instância.')
  const acao = input.acao
  if (!['publicar', 'restaurar', 'revogar'].includes(String(acao))) throw new APIError('Ação inválida.', 400)
  const parameter = acao === 'publicar' ? 'registros' : acao === 'restaurar' ? 'release' : 'alvo'
  if (Object.keys(input).some(field => !['acao', 'ambiente', parameter].includes(field))) {
    throw new APIError('Parâmetro de publicação não permitido.', 400)
  }
  if (acao !== 'publicar' && user.perfil !== 'geral') deny()

  const chosen = acao === 'publicar' ? selections(input.registros) : []
  const release = typeof input.release === 'string' ? input.release : ''
  const alvo = typeof input.alvo === 'string' ? input.alvo : ''
  if (acao === 'restaurar' && !idPattern.test(release)) throw new APIError('Release inválida.', 400)
  if (acao === 'revogar' && !hashPattern.test(alvo) && !mediaPattern.test(alvo)) throw new APIError('Alvo inválido.', 400)
  const assinatura = hash(JSON.stringify([acao, ambiente, chosen, release, alvo]))
  const chave = hash(`${ambiente}:${user.id}:${key}`)
  const lookup = async () => {
    const { docs: [job] } = await req.payload.find({
      collection: 'publicacoes', where: { chave: { equals: chave } }, limit: 1, depth: 0,
      overrideAccess: false, req,
    })
    if (job && job.assinatura !== assinatura) throw new APIError('Chave já usada para outro pedido.', 409)
    return job
  }
  const answer = (job: { id: number | string; [key: string]: unknown }) =>
    Response.json({ id: job.id, release: job.release, estado: job.estado }, { status: 202 })
  const existing = await lookup()
  if (existing) return answer(existing)

  const transaction = await req.payload.db.beginTransaction({ isolationLevel: 'repeatable read' })
  if (transaction == null) throw new APIError('Transação indisponível.', 503)
  req.transactionID = transaction
  try {
    let pedido: Intent
    if (acao === 'publicar') {
      const registros = []
      for (const item of chosen) registros.push(await capture(req, item))
      pedido = { acao, registros }
    } else {
      pedido = acao === 'restaurar' ? { acao, release } : { acao: 'revogar', alvo }
    }
    const db = req.payload.db as typeof req.payload.db & Pick<PostgresAdapter, 'sessions'>
    const session = db.sessions[String(transaction)]
    if (!session) throw new APIError('Sessão de publicação indisponível.', 503)
    await session.db.execute(sql`SELECT pg_advisory_xact_lock(502021)`)
    await req.payload.create({
      collection: 'publicacoes', req, overrideAccess: false, context: { publication: enqueue },
      data: { pedido, chave, assinatura, ambiente, operador: Number(user.id), estado: 'pendente', release: randomUUID() },
    })
    await req.payload.db.commitTransaction(transaction)
  } catch (error) {
    await req.payload.db.rollbackTransaction(transaction)
    delete req.transactionID
    const winner = await lookup()
    if (winner) return answer(winner)
    throw error
  } finally {
    delete req.transactionID
  }
  const committed = await lookup()
  if (!committed) throw new APIError('Gravação da intenção não confirmada.', 503)
  return answer(committed)
}

async function retry(req: PayloadRequest) {
  const id = relationID(req.routeParams?.id)
  if (!actor(req) || !id) deny()
  const doc = await req.payload.findByID({
    collection: 'publicacoes', id, req, depth: 0, overrideAccess: false, disableErrors: true,
  })
  if (!doc) deny()
  const result = await mediaPool(req.payload).query(`
    UPDATE publicacoes SET estado = 'pendente', erro = null, expira = null
    WHERE id = $1 AND ambiente = $2 AND estado = 'falhou' AND tentativas < 8
  `, [id, publicationEnvironment()])
  if (!result.rowCount) throw new APIError('Pedido indisponível para repetição.', 409)
  return Response.json({ estado: 'pendente' }, { status: 202 })
}
