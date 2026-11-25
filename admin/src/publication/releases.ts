import {
  fileKey, parseRelease, parseSection, sections, type Release, type ReleaseRef, type Snapshot, validateSnapshot,
} from './contract.ts'
import type { ReleaseStore } from './store.ts'

export async function readRelease(store: ReleaseStore, ref: ReleaseRef) {
  const { bytes } = await store.read('releases', fileKey(ref.id, 'manifest'))
  return parseRelease(bytes, ref, store.environment)
}

export async function readSnapshot(store: ReleaseStore, ref: ReleaseRef, verified?: Release) {
  const release = verified ?? await readRelease(store, ref)
  const entries = await Promise.all(sections.map(async section => {
    const { bytes: body } = await store.read('releases', fileKey(ref.id, section))
    return [section, parseSection(section, body, release)] as const
  }))
  const snapshot = Object.fromEntries(entries) as Snapshot
  if (JSON.stringify(validateSnapshot(snapshot)) !== JSON.stringify(release.midias)) {
    throw new Error('Referências da release divergentes.')
  }
  return snapshot
}
