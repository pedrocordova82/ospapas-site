import { hash, hashPattern, idPattern, jsonBytes, mediaPattern, plain, type Pointer } from './contract.ts'
import { RecoveryStorage } from '../security/recovery-storage.ts'

type Event = {
  versao: 1; ambiente: Pointer['ambiente']; linhagem: string; operacao: string
  sequencia: number; alvo: string; anterior: string | null
}

const key = (digest: string) => `diario/revogacoes/${digest}`

function parseEvent(bytes: Buffer, digest: string, pointer: Pointer): Event {
  const value: unknown = JSON.parse(bytes.toString())
  if (hash(bytes) !== digest || !plain(value) || Object.keys(value).length !== 7 || value.versao !== 1 ||
      value.ambiente !== pointer.ambiente || value.linhagem !== pointer.linhagem ||
      typeof value.operacao !== 'string' || !idPattern.test(value.operacao) ||
      !Number.isSafeInteger(value.sequencia) || Number(value.sequencia) <= 0 ||
      typeof value.alvo !== 'string' || (!hashPattern.test(value.alvo) && !mediaPattern.test(value.alvo)) ||
      (value.anterior !== null && (typeof value.anterior !== 'string' || !hashPattern.test(value.anterior)))) {
    throw new Error('Evento do diário inválido.')
  }
  return value as unknown as Event
}

export async function readRevocations(vault: RecoveryStorage, pointer: Pointer) {
  if (vault.environment !== pointer.ambiente) throw new Error('Ambiente do diário divergente.')
  const events = new Map<string, Event>()
  const targets = new Set<string>()
  const operations = new Set<string>()
  let digest = pointer.diario ?? null
  let ceiling = pointer.ativa.sequencia + 1
  while (digest) {
    if (events.size >= 10_000 || events.has(digest)) throw new Error('Cadeia do diário inválida.')
    const event = parseEvent(await vault.get(key(digest)), digest, pointer)
    if (event.sequencia >= ceiling || operations.has(event.operacao)) throw new Error('Ordem do diário inválida.')
    events.set(digest, event)
    operations.add(event.operacao)
    targets.add(event.alvo)
    ceiling = event.sequencia
    digest = event.anterior
  }
  if (targets.size !== pointer.revogados.length || pointer.revogados.some(target => !targets.has(target))) {
    throw new Error('Histórico de revogação incompleto.')
  }
  return events
}

export async function recordRevocation(
  pointer: Pointer, previous: Pointer | undefined, target: string,
) {
  if (!pointer.linhagem) throw new Error('A revogação exige uma linhagem inicializada.')
  const vault = new RecoveryStorage(pointer.ambiente)
  try {
    if (previous) await readRevocations(vault, previous)
    const event: Event = {
      versao: 1, ambiente: pointer.ambiente, linhagem: pointer.linhagem,
      operacao: pointer.ativa.id, sequencia: pointer.ativa.sequencia, alvo: target,
      anterior: previous?.diario ?? null,
    }
    const bytes = jsonBytes(event)
    const digest = hash(bytes)
    await vault.put(key(digest), bytes, true)
    return { digest, operations: vault.operations, bytes: bytes.length }
  } finally {
    vault.close()
  }
}

export async function recoveryRevocations(
  vault: RecoveryStorage, archived: Pointer | undefined, current: Pointer,
) {
  if (!current.linhagem || (archived && (archived.ambiente !== current.ambiente ||
      archived.linhagem !== current.linhagem || current.ativa.sequencia < archived.ativa.sequencia ||
      (current.revisao ?? 0) < (archived.revisao ?? 0) ||
      (current.ativa.sequencia === archived.ativa.sequencia && current.ativa.id !== archived.ativa.id)))) {
    throw new Error('Origem divergente do manifesto arquivado.')
  }
  const events = await readRevocations(vault, current)
  const later: Event[] = []
  for (const [digest, event] of events) {
    if (digest === archived?.diario) break
    later.push(event)
  }
  if (archived?.diario && (!events.has(archived.diario) ||
      events.get(archived.diario)!.sequencia > archived.ativa.sequencia)) {
    throw new Error('Âncora de revogação arquivada ausente.')
  }
  if (archived) {
    const prior = new Set([...events.values()].filter(event => event.sequencia <= archived.ativa.sequencia).map(event => event.alvo))
    if (prior.size !== archived.revogados.length || archived.revogados.some(target => !prior.has(target)) ||
        later.some(event => event.sequencia <= archived.ativa.sequencia)) {
      throw new Error('Histórico arquivado divergente.')
    }
  }
  return { targets: current.revogados, later: later.length }
}
