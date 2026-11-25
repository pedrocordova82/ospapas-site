import {
  fileKey, hash, parseRelease, parseSection, sections, type ReleaseRef, type Snapshot, validateSnapshot,
} from './contract.ts'
import type { ReleaseStore } from './store.ts'

export async function readSnapshot(store: ReleaseStore, ref: ReleaseRef) {
  const { bytes } = await store.read('releases', fileKey(ref.id, 'manifest'))
  const release = parseRelease(bytes, ref, store.environment)
  const entries = await Promise.all(sections.map(async section => {
    const { bytes: body } = await store.read('releases', fileKey(ref.id, section))
    return [section, parseSection(section, body, release)] as const
  }))
  const snapshot = Object.fromEntries(entries) as Snapshot
  if (JSON.stringify(validateSnapshot(snapshot)) !== JSON.stringify(release.midias) || hash(bytes) !== ref.checksum) {
    throw new Error('Referências da release divergentes.')
  }
  return snapshot
}
