import { ListObjectsV2Command } from '@aws-sdk/client-s3'
import { hash, hashPattern, idPattern, jsonBytes, type Environment, type Pointer, type PublicationManifest } from './contract.ts'
import { missing } from './store.ts'
import type { RecoveryStorage } from '../security/recovery-storage.ts'

type Head = { versao: 1; ambiente: Environment; linhagem: string; ultimo: number }
type Entry = {
  ambiente: Environment; linhagem: string; numero: number; release: string
  revisao: number; digest: string; etag: string
}
type Outcome = 'confirmada' | 'abortada'
type Witness = { value: PublicationManifest; etag: string }
const bound = 10_000
const prefix = (lineage: string) => `diario/evidencias/${lineage}/`
const slot = (lineage: string, number: number) => `${prefix(lineage)}${String(number).padStart(5, '0')}`
const index = (lineage: string) => `${prefix(lineage)}indice`

async function optional<T>(read: () => Promise<T>) {
  try {
    return await read()
  } catch (error) {
    if (missing(error)) return
    throw error
  }
}

async function head(vault: RecoveryStorage, lineage: string) {
  if (!idPattern.test(lineage)) throw new Error('Linhagem de evidência inválida.')
  const stored = await optional(() => vault.readVersion(index(lineage)))
  if (!stored) return
  const value: Head = JSON.parse(stored.bytes.toString())
  if (!stored.etag || value.versao !== 1 || value.ambiente !== vault.environment || value.linhagem !== lineage ||
      !Number.isSafeInteger(value.ultimo) || value.ultimo < 0 || value.ultimo > bound) {
    throw new Error('Índice de evidência inválido.')
  }
  return { value, etag: stored.etag }
}

export async function initializeEvidence(vault: RecoveryStorage, lineage: string) {
  if (!await head(vault, lineage)) {
    if (await entry(vault, lineage, 1)) throw new Error('Índice de evidência ausente.')
    const initial: Head = { versao: 1, ambiente: vault.environment, linhagem: lineage, ultimo: 0 }
    await vault.put(index(lineage), jsonBytes(initial), true)
  }
}

async function entry(vault: RecoveryStorage, lineage: string, number: number) {
  const bytes = await optional(() => vault.get(slot(lineage, number)))
  if (!bytes) return
  const value: Entry = JSON.parse(bytes.toString())
  if (value.ambiente !== vault.environment || value.linhagem !== lineage || value.numero !== number ||
      !idPattern.test(value.release) || !hashPattern.test(value.digest) || !value.etag ||
      !Number.isSafeInteger(value.revisao) || value.revisao <= 0) throw new Error('Reserva de evidência inválida.')
  return { value, bytes }
}

async function outcome(vault: RecoveryStorage, reserved: NonNullable<Awaited<ReturnType<typeof entry>>>) {
  const { linhagem, numero } = reserved.value
  const bytes = await optional(() => vault.get(slot(linhagem, numero) + '.resultado'))
  if (!bytes) return
  const result: { reserva: string; estado: Outcome } = JSON.parse(bytes.toString())
  if (result.reserva !== hash(reserved.bytes) || !['confirmada', 'abortada'].includes(result.estado)) {
    throw new Error('Resultado de evidência inválido.')
  }
  return result.estado
}

export async function reserveEvidence(vault: RecoveryStorage, candidate: Pointer, current: Witness) {
  const lineage = candidate.linhagem!
  if (!current.value.ativa || !current.value.diario) await initializeEvidence(vault, lineage)
  const latest = await head(vault, lineage)
  if (!latest) throw new Error('Índice de evidência ausente.')
  if (latest.value.ultimo > 0) {
    const prior = await entry(vault, lineage, latest.value.ultimo)
    if (!prior || !await outcome(vault, prior)) throw new Error('Revogação anterior pendente de reconciliação.')
  }
  const number = latest.value.ultimo + 1
  if (number > bound) throw new Error('Limite de evidências atingido.')
  const reservation: Entry = {
    ambiente: vault.environment, linhagem: lineage, numero: number, release: candidate.ativa.id,
    revisao: candidate.revisao!, digest: candidate.diario!, etag: current.etag,
  }
  await vault.put(slot(lineage, number), jsonBytes(reservation), true)
  await vault.put(index(lineage), jsonBytes({ ...latest.value, ultimo: number }), false, latest.etag)
}

export async function settleEvidence(vault: RecoveryStorage, current: Witness, release: string, requireConfirmed = false) {
  const lineage = current.value.linhagem
  if (!lineage) throw new Error('Linhagem de evidência ausente.')
  let latest = await head(vault, lineage)
  if (!latest) {
    if (requireConfirmed) throw new Error('Índice de evidência ausente.')
    return
  }
  const orphan = await entry(vault, lineage, latest.value.ultimo + 1)
  if (orphan) {
    if (orphan.value.release !== release || requireConfirmed) throw new Error('Reserva de evidência não indexada.')
    await vault.put(index(lineage), jsonBytes({ ...latest.value, ultimo: orphan.value.numero }), false, latest.etag)
    latest = await head(vault, lineage)
    if (!latest || latest.value.ultimo !== orphan.value.numero) throw new Error('Índice de evidência incerto.')
  }
  const reserved = latest.value.ultimo ? await entry(vault, lineage, latest.value.ultimo) : undefined
  if (!reserved || reserved.value.release !== release) {
    if (requireConfirmed) throw new Error('Reserva de revogação ausente.')
    return
  }
  const accepted = current.value.ativa?.id === release
  const confirmed = current.value.ativa !== null && current.value.ativa.id === release &&
    current.value.diario === reserved.value.digest &&
    (current.value.revisao ?? 0) >= reserved.value.revisao
  const decided = await outcome(vault, reserved)
  if (requireConfirmed && !confirmed) throw new Error('Revogação sem confirmação no manifesto.')
  if (decided) {
    if (confirmed && decided !== 'confirmada') throw new Error('Evidência diverge do manifesto.')
    return
  }
  if (!confirmed && current.etag === reserved.value.etag) throw new Error('Escrita de revogação ainda incerta.')
  if (accepted && !confirmed) throw new Error('Revogação diverge da reserva.')
  await vault.put(slot(lineage, reserved.value.numero) + '.resultado', jsonBytes({
    reserva: hash(reserved.bytes), estado: confirmed ? 'confirmada' : 'abortada',
  }), true)
}

export async function assertLatestEvidence(vault: RecoveryStorage, pointer: PublicationManifest) {
  const lineage = pointer.linhagem
  if (!lineage || pointer.ambiente !== vault.environment) throw new Error('Linhagem de evidência divergente.')
  const digest = pointer.ativa ? pointer.diario : undefined
  const latest = await head(vault, lineage)
  await verifyTail(vault, lineage, latest?.value.ultimo ?? 0)
  for (let number = latest?.value.ultimo ?? 0; number > 0; number--) {
    const reserved = await entry(vault, lineage, number)
    if (!reserved) throw new Error('Lacuna na evidência de revogações.')
    const result = await outcome(vault, reserved)
    if (!result) throw new Error('Revogação sem desfecho independente.')
    if (result === 'confirmada') {
      if (digest !== reserved.value.digest || (pointer.revisao ?? 0) < reserved.value.revisao) {
        throw new Error('Manifesto regredido em relação à evidência de revogações.')
      }
      return
    }
  }
  if (digest) throw new Error('Revogação sem recibo confirmado.')
}

async function verifyTail(vault: RecoveryStorage, lineage: string, number: number) {
  vault.operations++
  const tail = await optional(() => vault.client.send(new ListObjectsV2Command({
    Bucket: vault.bucket, Prefix: prefix(lineage), MaxKeys: 1,
    StartAfter: slot(lineage, number) + '.resultado',
  }), { abortSignal: AbortSignal.timeout(30_000) }))
  if (tail?.Contents?.some(object => object.Key !== index(lineage))) {
    throw new Error('Índice de evidência regredido ou incompleto.')
  }
}

export async function verifyEvidence(
  vault: RecoveryStorage,
  pointer: Pointer,
  committed: Map<string, { operacao: string }>,
) {
  const lineage = pointer.linhagem
  if (!lineage) throw new Error('Linhagem de evidência ausente.')
  const latest = await head(vault, lineage)
  if (!latest) throw new Error('Índice de evidência ausente.')
  const receipts = new Set<string>()
  for (let number = 1; number <= latest.value.ultimo; number++) {
    const current = await entry(vault, lineage, number)
    if (!current) throw new Error('Lacuna na evidência de revogações.')
    const result = await outcome(vault, current)
    if (!result) throw new Error('Revogação sem desfecho independente.')
    const { digest, release, revisao } = current.value
    if (result === 'confirmada') {
      if (receipts.has(digest) || (pointer.revisao ?? 0) < revisao || committed.get(digest)?.operacao !== release) {
        throw new Error('Manifesto regredido ou histórico confirmado truncado.')
      }
      receipts.add(digest)
    }
  }
  await verifyTail(vault, lineage, latest.value.ultimo)
  if (receipts.size !== committed.size) throw new Error('Revogação sem recibo confirmado.')
}
