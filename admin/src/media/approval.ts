import { relationID } from '../access/policies.ts'

export function validAlt(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 250 && /[\p{L}\p{N}]/u.test(value)
}

export function eligiblePoster(
  image: Record<string, unknown> | null | undefined,
  regional: number | undefined,
  forPublication: boolean,
): image is Record<string, unknown> & { otimizado: string } {
  return image?.tipo === 'imagem' && image.fase === 'pronta' &&
    relationID(image.regional) === regional &&
    typeof image.digest === 'string' && /^[0-9a-f]{64}$/.test(image.digest) &&
    typeof image.otimizado === 'string' && image.otimizado.trim().length > 0 &&
    (!forPublication || (image.publicado === true && validAlt(image.alt)))
}
