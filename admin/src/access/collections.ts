import { APIError, type Access, type CollectionBeforeChangeHook, type CollectionBeforeOperationHook, type CollectionConfig, type Field } from 'payload'
import { coverField, validateCover, validateVideo } from '../media/collection.ts'
import { retainActiveGeneral } from './last-general.ts'
import { actor, canUsePanel, deny, geral, limitToRegion, protectFields, rejectNested, relationID } from './policies.ts'
import { checkUnit } from '../security/controls.ts'

const denyDelete = () => false
const activeField: Field = { name: 'ativo', type: 'checkbox', defaultValue: true, required: true }
const regionalField = (required = false): Field => ({
  name: 'regional',
  type: 'relationship',
  relationTo: 'regionais',
  index: true,
  required,
  access: { create: geral, update: geral },
})

const accountScope: Access = ({ req }) => {
  const user = actor(req)
  if (!user) return false
  return user.perfil === 'geral' || { id: { equals: user.id } }
}
const selfService = new Set(['password'])
const accountFields = new Set(['id', 'email', 'perfil', 'regional', 'ativo', 'createdAt', 'updatedAt'])

const users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuário', plural: 'Usuários' },
  auth: { useSessions: true, depth: 0 },
  access: {
    admin: canUsePanel,
    create: geral,
    read: accountScope,
    update: accountScope,
    unlock: geral,
    delete: denyDelete,
  },
  hooks: {
    beforeOperation: [async ({ operation, args, req }) => {
      if (operation === 'forgotPassword' || operation === 'resetPassword') {
        deny('A recuperação por e-mail está fora desta prova de conceito.')
      }
      if (operation !== 'update') return
      const id = 'id' in args ? relationID(args.id) : undefined
      if (id == null) deny('Altere uma conta administrativa por vez.')
      if (actor(req)?.perfil === 'regional') {
        await protectFields('users', { req, id, data: args.data }, selfService, accountFields)
      }
    }],
    beforeLogin: [async ({ user, req }) => {
      if (user.ativo !== true) deny('Conta administrativa indisponível.')
      await checkUnit(req, user)
      return user
    }],
    beforeChange: [async ({ data, operation, originalDoc, req, context }) => {
      const operator = actor(req)
      if (!operator && !(operation === 'create' && context.pocBootstrap === true)) deny()

      const perfil = data.perfil ?? originalDoc?.perfil
      const ativo = data.ativo ?? originalDoc?.ativo ?? true
      rejectNested(data.regional)
      const regional = Object.hasOwn(data, 'regional') ? data.regional : originalDoc?.regional
      if ((perfil === 'regional') !== Boolean(relationID(regional))) {
        throw new APIError('Vincule apenas contas regionais a uma unidade.', 400)
      }
      if (originalDoc?.perfil === 'geral' && originalDoc.ativo && (perfil !== 'geral' || !ativo)) {
        await retainActiveGeneral(req)
      }
      if (!ativo || (originalDoc && (perfil !== originalDoc.perfil ||
          relationID(regional) !== relationID(originalDoc.regional)))) data.sessions = []
      return data
    }],
  },
  fields: [
    {
      name: 'perfil',
      type: 'select',
      required: true,
      index: true,
      options: [{ label: 'Geral', value: 'geral' }, { label: 'Regional', value: 'regional' }],
      access: { create: geral, update: geral },
    },
    regionalField(),
    { ...activeField, access: { create: geral, update: geral } },
  ],
}

const editableRegionFields = new Set(['sobre', 'whatsapp', 'instagram', 'endereco', 'localizacao', 'capa', 'capaMidia'])
const unitIdentityFields = new Set(['id', 'nome', 'tipo', 'cidade', 'estado', 'slug', 'ordem', 'ativo', 'createdAt', 'updatedAt'])
const regionScope = limitToRegion('id')
const regionais: CollectionConfig = {
  slug: 'regionais',
  labels: { singular: 'Unidade', plural: 'Sedes e Regionais' },
  admin: { useAsTitle: 'nome' },
  access: {
    create: geral,
    read: regionScope,
    update: regionScope,
    delete: denyDelete,
  },
  hooks: { beforeOperation: [async ({ operation, args, req }) => {
    if (operation === 'update' && actor(req)?.perfil === 'regional') {
      const id = 'id' in args ? relationID(args.id) : undefined
      await protectFields('regionais', { req, id, data: args.data }, editableRegionFields, unitIdentityFields)
    }
  }], beforeChange: [validateCover] },
  fields: [
    { name: 'nome', type: 'text', required: true, access: { update: geral } },
    { name: 'tipo', type: 'select', options: ['sede', 'regional'], required: true, access: { update: geral } },
    { name: 'cidade', type: 'text', access: { update: geral } },
    { name: 'estado', type: 'text', access: { update: geral } },
    { name: 'slug', type: 'text', required: true, unique: true, access: { update: geral } },
    { name: 'ordem', type: 'number', defaultValue: 0, access: { update: geral } },
    { ...activeField, access: { update: geral } },
    { name: 'sobre', type: 'textarea' },
    { name: 'whatsapp', type: 'text' },
    { name: 'instagram', type: 'text' },
    { name: 'endereco', type: 'text' },
    { name: 'localizacao', type: 'text' },
    { name: 'capa', type: 'text', label: 'Imagem de capa (referência fictícia)' },
    coverField,
  ],
}

const contentScope = limitToRegion()
const validateContentInput: CollectionBeforeOperationHook = ({ operation, args, req }) => {
  if (operation !== 'create' && operation !== 'update') return
  const user = actor(req)
  if (!user) return
  const { data } = args
  rejectNested(data?.compromisso)
  if (!Object.hasOwn(data ?? {}, 'regional')) return

  rejectNested(data?.regional)
  if (operation === 'update' && (!('id' in args) || args.id == null)) {
    deny('Altere a titularidade apenas em operações individuais autorizadas.')
  }
  if (user.perfil === 'regional' && relationID(data?.regional) !== relationID(user.regional)) {
    deny('A unidade deve ser a da conta autenticada.')
  }
}
const ownership: CollectionBeforeChangeHook = ({ collection, data, operation, originalDoc, req }) => {
  const user = actor(req)
  if (!user) deny()
  rejectNested(data.regional)
  if (operation === 'create' && user.perfil === 'regional') {
    data.regional = relationID(user.regional)
  }
  if (operation === 'update' && collection.slug !== 'membros') {
    const originalRegion = relationID(originalDoc?.regional)
    if (Object.hasOwn(data, 'regional') && relationID(data.regional) !== originalRegion) {
      deny('A unidade de Agenda e Eventos é definida na criação.')
    }
    data.regional = originalRegion ?? null
  }
  return data
}

function regionalContent(slug: string, plural: string, fields: Field[] = []): CollectionConfig {
  return {
    slug,
    labels: { singular: plural, plural },
    admin: { useAsTitle: 'titulo' },
    access: {
      create: canUsePanel,
      read: contentScope,
      update: contentScope,
      delete: denyDelete,
    },
    hooks: { beforeOperation: [validateContentInput], beforeChange: [ownership] },
    fields: [
      { name: 'titulo', type: 'text', label: 'Título', required: true },
      regionalField(slug === 'membros'),
      activeField,
      ...fields,
    ],
  }
}

const membros = regionalContent('membros', 'Membros', [{ name: 'patente', type: 'text' }])
const restoreAgenda: CollectionBeforeOperationHook = async ({ operation, args, req }) => {
  if (operation !== 'restoreVersion') return
  if (!actor(req)) deny()
  await req.payload.findVersionByID({
    collection: 'agenda',
    id: String(args.id),
    depth: 0,
    req,
    overrideAccess: false,
  })
  if (!args.draft) throw new APIError('Restaure a versão como rascunho e publique em uma ação separada.', 400)
}
const agenda: CollectionConfig = {
  ...regionalContent('agenda', 'Agenda', [coverField]),
  versions: { drafts: true, maxPerDoc: 15 },
  hooks: { beforeOperation: [validateContentInput, restoreAgenda], beforeChange: [ownership, validateCover] },
  access: {
    create: canUsePanel,
    read: contentScope,
    update: contentScope,
    delete: denyDelete,
    readVersions: limitToRegion('version.regional'),
  },
}

const validateAgendaLink: CollectionBeforeChangeHook = async ({ data, originalDoc, req }) => {
  rejectNested(data.compromisso)
  const id = relationID(Object.hasOwn(data, 'compromisso') ? data.compromisso : originalDoc?.compromisso)
  if (id === undefined) return data
  const compromisso = await req.payload.findByID({
    collection: 'agenda',
    id,
    depth: 0,
    req,
    overrideAccess: false,
    disableErrors: true,
  })
  const regional = Object.hasOwn(data, 'regional') ? data.regional : originalDoc?.regional
  if (!compromisso || relationID(compromisso.regional) !== relationID(regional)) {
    deny('O compromisso deve ser acessível e pertencer ao mesmo âmbito do evento.')
  }
  return data
}
const eventos: CollectionConfig = {
  ...regionalContent('eventos', 'Eventos', [
    { name: 'compromisso', type: 'relationship', relationTo: 'agenda' },
    coverField,
    { name: 'videoMidia', type: 'relationship', relationTo: 'midias', label: 'Vídeo experimental', maxDepth: 0 },
  ]),
  hooks: { beforeOperation: [validateContentInput], beforeChange: [ownership, validateAgendaLink, validateCover, validateVideo] },
}
const manageBoard: Access = (args) => {
  if (!geral(args)) return false
  rejectNested(args.data?.membro)
  return true
}
const diretoria: CollectionConfig = {
  slug: 'diretoria',
  labels: { singular: 'Diretor', plural: 'Diretoria Nacional' },
  admin: { useAsTitle: 'nomePublico' },
  access: { create: manageBoard, read: geral, update: manageBoard, delete: denyDelete },
  hooks: { beforeChange: [validateCover] },
  fields: [
    { name: 'nomePublico', type: 'text', label: 'Nome público', required: true },
    { name: 'membro', type: 'relationship', relationTo: 'membros', maxDepth: 0 },
    coverField,
    activeField,
  ],
}

export const collections = [users, regionais, membros, agenda, eventos, diretoria]
