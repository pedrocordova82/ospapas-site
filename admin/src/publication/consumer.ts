import { limits } from '../media/model.ts'
import {
  fileKey, hash, idPattern, isSection, jsonBytes, mediaPattern, parsePointer, parseRelease, parseSection,
  sections, validateSnapshot, type Environment, type ReleaseRef, type Snapshot,
} from './contract.ts'
import { missing, ReleaseStore } from './store.ts'

export async function loadPublication(get: (path: string) => Promise<Buffer>, environment: Environment) {
  const pointer = parsePointer(JSON.parse((await get('manifest.json')).toString()), environment)
  const { ativa } = pointer
  const release = parseRelease(await get(fileKey(ativa.id, 'manifest')), ativa, environment)
  const records = await Promise.all(sections.map(async section =>
    [section, parseSection(section, await get(fileKey(ativa.id, section)), release)] as const))
  const snapshot = Object.fromEntries(records) as Snapshot
  if (JSON.stringify(validateSnapshot(snapshot, pointer.revogados)) !== JSON.stringify(release.midias)) {
    throw new Error('Referências públicas divergentes.')
  }
  return { release: ativa.id, snapshot }
}

function encode(value: string) {
  return value.replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]!)
}

export function renderPublication(release: string, snapshot: Snapshot) {
  const list = (items: string[]) => `<ul>${items.map(item => `<li>${encode(item)}</li>`).join('')}</ul>`
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Publicação institucional experimental</title><main data-release="${encode(release)}">
<h1>Publicação institucional experimental</h1>
<h2>Diretoria</h2>${list(snapshot.diretoria.map(row => row.nome))}
<h2>Sedes, contatos e membros</h2>${snapshot.sedes.map(unit =>
  `<section><h3>${encode(unit.nome)}</h3><p>${encode(unit.whatsapp)}</p>${list(
    snapshot.membros.filter(member => member.regional === unit.id).map(member => member.nome))}</section>`).join('')}
<h2>Agenda</h2>${list(snapshot.agenda.map(row => row.titulo))}
<h2>Eventos</h2>${list(snapshot.eventos.map(row => row.titulo))}
</main></html>`
}

export async function publicObject(store: ReleaseStore, path: string) {
  const pointer = (await store.pointer())?.value
  if (!pointer) return null
  const { ativa, anteriores, revogados } = pointer
  if (path === 'manifest.json') return { bytes: jsonBytes(pointer), type: 'application/json' }
  const recent = Date.now() - Date.parse(pointer.ativadaEm) <= 5 * 60_000
  const available = recent ? [ativa, ...anteriores] : [ativa]
  const readManifest = async (ref: ReleaseRef) => {
    const value = await store.read('releases', fileKey(ref.id, 'manifest'))
    return { ...value, release: parseRelease(value.bytes, ref, store.environment) }
  }
  if (mediaPattern.test(path) && !revogados.includes(path)) {
    for (const ref of available) {
      if (!(await readManifest(ref)).release.midias.includes(path)) continue
      const { bytes } = await store.read('media', path, path.endsWith('.mp4') ? limits.video : limits.imagem)
      if (hash(bytes) !== path.split('/')[1].split('.')[0]) throw new Error('Bytes públicos divergentes.')
      return { bytes, type: path.endsWith('.mp4') ? 'video/mp4' : 'image/webp' }
    }
    return null
  }
  const [, id, file] = path.match(/^releases\/([0-9a-f-]+)\/([a-z]+)\.json$/) ?? []
  if (!id || !idPattern.test(id) || !(file === 'manifest' || isSection(file))) return null
  const ref = available.find(candidate => candidate.id === id)
  if (!ref) return null
  try {
    const manifest = await readManifest(ref)
    if (file === 'manifest') return { bytes: manifest.bytes, type: 'application/json' }
    const { bytes } = await store.read('releases', path)
    parseSection(file, bytes, manifest.release)
    return { bytes, type: 'application/json' }
  } catch (error) {
    if (missing(error)) throw new Error('Release indisponível.')
    throw error
  }
}
