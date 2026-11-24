import type { CollectionBeforeChangeHook, CollectionConfig, Field } from 'payload'
import { actor, deny, limitToRegion, rejectNested, relationID } from '../access/policies.ts'
import { mediaEndpoints } from './endpoints.ts'
import { reservation } from './model.ts'

const texts = ['mime', 'alt', 'digest', 'origem', 'otimizado', 'miniatura', 'poster', 'erro'] as const
const numbers = ['largura', 'altura', 'duracao', 'posterior', 'segundo'] as const

export const midias: CollectionConfig = {
  slug: 'midias',
  labels: { singular: 'Mídia experimental', plural: 'Mídias experimentais' },
  admin: { useAsTitle: 'arquivo' },
  access: {
    create: ({ req }) => Boolean(actor(req)) && req.context.mediaReservation === reservation,
    read: limitToRegion(),
    update: () => false,
    delete: () => false,
  },
  endpoints: mediaEndpoints,
  fields: [
    { name: 'uuid', type: 'text', unique: true, required: true },
    { name: 'arquivo', type: 'text', required: true },
    { name: 'tipo', type: 'select', options: ['imagem', 'video'], required: true },
    { name: 'tamanho', type: 'number', required: true },
    { name: 'regional', type: 'relationship', relationTo: 'regionais', index: true },
    { name: 'operador', type: 'number', required: true, index: true },
    {
      name: 'fase', type: 'select', required: true, index: true, defaultValue: 'reservada',
      options: ['reservada', 'recebendo', 'pendente', 'processando', 'pronta', 'falhou'],
    },
    { name: 'publicado', type: 'checkbox', defaultValue: false, required: true },
    { name: 'tentativa', type: 'number', defaultValue: 0, required: true },
    { name: 'expira', type: 'date', index: true },
    ...texts.map((name): Field => ({ name, type: 'text' })),
    ...numbers.map((name): Field => ({ name, type: 'number' })),
  ],
}

export const coverField: Field = {
  name: 'capaMidia', label: 'Capa experimental', type: 'relationship', relationTo: 'midias', maxDepth: 0, index: true,
}

export const validateCover: CollectionBeforeChangeHook = async ({ collection, data, originalDoc, req }) => {
  const value = Object.hasOwn(data, 'capaMidia') ? data.capaMidia : originalDoc?.capaMidia
  rejectNested(value)
  const id = relationID(value)
  if (!id) return data
  const doc = await req.payload.findByID({
    collection: 'midias', id, depth: 0, overrideAccess: false, req, disableErrors: true,
  })
  const regional = collection.slug === 'regionais'
    ? originalDoc?.id
    : Object.hasOwn(data, 'regional') ? data.regional : originalDoc?.regional
  const publicReference = collection.slug === 'diretoria' || (data._status ?? originalDoc?._status) === 'published'
  if (!doc || doc.tipo !== 'imagem' || doc.fase !== 'pronta' ||
      relationID(doc.regional) !== relationID(regional) || (publicReference && !doc.publicado)) {
    deny('A capa deve estar pronta, autorizada e no mesmo âmbito do conteúdo.')
  }
  return data
}
