import { APIError, type Access, type PayloadRequest, type Where } from 'payload'

type Actor = {
  id: number | string
  collection: 'users'
  perfil: 'geral' | 'regional'
  regional?: unknown
  ativo: boolean
}

export function relationID(value: unknown): number | undefined {
  const id = value && typeof value === 'object' && 'id' in value ? value.id : value
  if (typeof id !== 'number' && !(typeof id === 'string' && /^\d+$/.test(id))) return
  const number = Number(id)
  if (Number.isSafeInteger(number) && number > 0) return number
}

export function actor(req: PayloadRequest): Actor | undefined {
  const user = req.user as Actor | null
  if (user?.collection !== 'users' || user.ativo !== true) return
  if (user.perfil === 'geral' || (user.perfil === 'regional' && relationID(user.regional))) return user
}

export function deny(message = 'Operação fora do escopo autorizado.'): never {
  throw new APIError(message, 403)
}

export const geral = ({ req }: { req: PayloadRequest }) => actor(req)?.perfil === 'geral'

export function limitToRegion(path = 'regional'): Access {
  return ({ req }): boolean | Where => {
    const user = actor(req)
    if (!user) return false
    if (user.perfil === 'geral') return true
    return { [path]: { equals: relationID(user.regional) } }
  }
}

export const canUsePanel = ({ req }: { req: PayloadRequest }) => Boolean(actor(req))

export async function protectFields(
  collection: 'users' | 'regionais',
  { data, id, req }: Parameters<Access>[0],
  editable: ReadonlySet<string>,
  protectedFields: ReadonlySet<string>,
) {
  const submitted = Object.keys(data ?? {}).filter(field => !editable.has(field))
  if (submitted.length === 0) return
  const message = 'O perfil Regional não pode alterar um dos campos enviados.'
  if (id == null || submitted.some(field => !protectedFields.has(field))) deny(message)
  const original = await req.payload.findByID({
    collection, id, req, depth: 0, overrideAccess: false, disableErrors: true,
  })
  if (!original) deny(message)

  for (const field of submitted) {
    const value: unknown = data?.[field]
    const previous: unknown = original[field]
    if (field === 'regional') {
      rejectNested(value)
      if (relationID(value) === relationID(previous)) continue
    }
    if ((field === 'cidade' || field === 'estado') && previous == null && value === '') continue
    if (!Object.is(value, previous)) deny(message)
  }
}

export function rejectNested(value: unknown) {
  if (value != null && (typeof value === 'object' || relationID(value) === undefined)) {
    deny('Informe apenas o identificador do relacionamento autorizado.')
  }
}
