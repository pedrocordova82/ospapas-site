import assert from 'node:assert/strict'
import { spawn, type ChildProcess } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { cp, mkdtemp, rm } from 'node:fs/promises'
import { createServer } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'
import { setTimeout as delay } from 'node:timers/promises'
import { createLocalReq, getPayload, type Payload } from 'payload'

type Doc = { id: number; [key: string]: unknown }
type Page = { docs: Doc[]; totalDocs: number; totalPages: number }
type Session = { token: string; user: Doc }
type Content = 'regionais' | 'membros' | 'agenda' | 'eventos' | 'diretoria' | 'users'

const { DATABASE_URL, POC_ADMIN_EMAIL, POC_ADMIN_PASSWORD } = process.env
const database = new URL(DATABASE_URL ?? 'postgresql://invalid')
assert.ok(['postgres:', 'postgresql:'].includes(database.protocol) && ['localhost', '127.0.0.1', '[::1]'].includes(database.hostname), 'Use PostgreSQL descartável no loopback.')
assert.ok(POC_ADMIN_EMAIL && POC_ADMIN_PASSWORD)
const password = randomBytes(24).toString('hex')
const suffix = randomBytes(4).toString('hex')
const regionEmail = (name: string) => `${name}-${suffix}@example.invalid`
let payload: Payload
let bundle: string
let child: ChildProcess | undefined
let base: string
let geral: Session
let brasilia: Session
let brasilia2: Session
let rio: Session
let df: Doc
let rj: Doc
let membroDF: Doc
let membroRJ: Doc
let agendaDF: Doc
let agendaRJ: Doc
let eventoDF: Doc
let eventoRJ: Doc
let nacional: Doc
let diretor: Doc

async function api(path: string, session?: Session, method = 'GET', body?: object) {
  const headers = new Headers()
  if (session) headers.set('Authorization', `JWT ${session.token}`)
  if (body) headers.set('Content-Type', 'application/json')
  return fetch(base + '/api/' + path, {
    method, headers, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(10_000),
  })
}

async function json<T>(response: Response, expected = 200): Promise<T> {
  assert.equal(response.status, expected, `${response.url.replace(base, '')}`)
  return response.json() as Promise<T>
}

async function denied(response: Response, statuses = [401, 403, 404]) {
  assert.ok(statuses.includes(response.status), `HTTP inesperado ${response.status} em ${response.url.replace(base, '')}`)
  await response.body?.cancel()
}

async function write(path: string, session: Session, data: object, create = false) {
  const response = await api(path, session, create ? 'POST' : 'PATCH', data)
  return (await json<{ doc: Doc }>(response, create ? 201 : 200)).doc
}

async function login(email: string, pass = password) {
  return json<Session>(await api('users/login', undefined, 'POST', { email, password: pass }))
}

async function local(session: Session) {
  const headers = new Headers({ Authorization: `JWT ${session.token}` })
  const { user } = await payload.auth({ headers })
  assert.ok(user)
  return createLocalReq({ user, req: { headers } }, payload)
}

async function persisted(collection: Content, id: number) {
  return (await payload.findByID({ collection, id, depth: 0, overrideAccess: true })) as Doc
}

async function start() {
  const listener = createServer().listen(0, '127.0.0.1')
  await once(listener, 'listening')
  const address = listener.address()
  assert.ok(address && typeof address === 'object')
  const port = address.port
  await new Promise<void>((resolve, reject) => listener.close(error => error ? reject(error) : resolve()))
  base = `http://127.0.0.1:${port}`
  const runtime: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: 'production', PORT: String(port), HOSTNAME: '127.0.0.1' }
  delete runtime.POC_ADMIN_EMAIL
  delete runtime.POC_ADMIN_PASSWORD
  delete runtime.POC_PREPARE_SCHEMA
  child = spawn(process.execPath, ['server.js'], { cwd: bundle, env: runtime, stdio: 'ignore' })
  for (let attempt = 0; attempt < 100; attempt++) {
    assert.equal(child.exitCode, null, 'O processo standalone foi encerrado.')
    const health = await fetch(base + '/healthz').catch(() => undefined)
    if (health?.ok) {
      assert.deepEqual(await health.json(), { status: 'ok' })
      return
    }
    await delay(50)
  }
  assert.fail('O standalone não respondeu ao health check.')
}

async function stop() {
  if (!child || child.exitCode !== null || child.signalCode !== null) return
  const running = child
  const exited = once(running, 'exit')
  running.kill('SIGTERM')
  const forceStop = setTimeout(() => running.kill('SIGKILL'), 2500)
  try {
    await exited
  } finally {
    clearTimeout(forceStop)
  }
}

before(async () => {
  const { default: config } = await import('../src/payload.config.ts')
  payload = await getPayload({ config })
  assert.equal((await payload.count({ collection: 'users', overrideAccess: true })).totalDocs, 1, 'Prepare um banco vazio para cada execução.')
  assert.equal((await payload.count({ collection: 'regionais', overrideAccess: true })).totalDocs, 0, 'Prepare um banco vazio para cada execução.')
  bundle = await mkdtemp(join(tmpdir(), 'ospapas-acesso-'))
  await cp('.next/standalone', bundle, { recursive: true })
  await cp('.next/static', join(bundle, '.next/static'), { recursive: true })
  await start()
  geral = await login(POC_ADMIN_EMAIL!, POC_ADMIN_PASSWORD!)
  df = await write('regionais', geral, { nome: 'Brasília fictícia', tipo: 'regional', slug: 'brasilia-experimento' }, true)
  rj = await write('regionais', geral, { nome: 'Rio de Janeiro fictício', tipo: 'regional', slug: 'rio-experimento' }, true)
  for (const [nome, regional] of [['brasilia-1', df.id], ['brasilia-2', df.id], ['rio', rj.id]] as const) {
    await write('users', geral, { email: regionEmail(nome), password, perfil: 'regional', regional }, true)
  }
  brasilia = await login(regionEmail('brasilia-1'))
  brasilia2 = await login(regionEmail('brasilia-2'))
  rio = await login(regionEmail('rio'))
  membroDF = await write('membros', brasilia, { titulo: 'Integrante Brasília' }, true)
  membroRJ = await write('membros', rio, { titulo: 'Integrante Rio' }, true)
  agendaDF = await write('agenda', brasilia, { titulo: 'Compromisso Brasília', _status: 'published' }, true)
  agendaRJ = await write('agenda', rio, { titulo: 'Compromisso Rio', _status: 'published' }, true)
  eventoDF = await write('eventos', brasilia, { titulo: 'Evento Brasília', compromisso: agendaDF.id }, true)
  eventoRJ = await write('eventos', rio, { titulo: 'Evento Rio', compromisso: agendaRJ.id }, true)
  nacional = await write('agenda', geral, { titulo: 'Compromisso nacional', _status: 'published' }, true)
  await write('eventos', geral, { titulo: 'Evento nacional', compromisso: nacional.id }, true)
  diretor = await write('diretoria', geral, { nomePublico: 'Nome nacional aprovado', membro: membroDF.id }, true)
})

after(async () => {
  await stop()
  await payload?.destroy()
  if (bundle) await rm(bundle, { recursive: true, force: true })
})

test('Painel HTTP disponível e conteúdo administrativo recusado sem sessão', async () => {
  const panel = await fetch(base + '/admin')
  assert.equal(panel.status, 200)
  assert.match(await panel.text(), /login/i)
  for (const path of ['regionais', 'membros', 'agenda?draft=true', 'agenda/versions', 'eventos', 'diretoria', 'users']) {
    await denied(await api(path))
  }
  await denied(await api('users', undefined, 'POST', { email: regionEmail('anonimo'), password, perfil: 'geral' }))
})

test('Geral vê todas as unidades, e dois administradores da mesma unidade compartilham escopo', async () => {
  assert.equal((await json<Page>(await api('regionais', geral))).totalDocs, 2)
  for (const session of [brasilia, brasilia2]) {
    const result = await json<Page>(await api('regionais?depth=2', session))
    assert.deepEqual(result.docs.map(({ id }) => id), [df.id])
    await denied(await api(`regionais/${rj.id}`, session))
    assert.equal((await json<Doc>(await api(`membros/${membroDF.id}`, session))).id, membroDF.id)
  }
  assert.equal((await json<Doc>(await api(`regionais/${rj.id}`, rio))).id, rj.id)
})

test('Minha Sede aceita os seis campos e rejeita alterações protegidas sem gravação parcial', async () => {
  const data = {
    sobre: 'Descrição fictícia', whatsapp: '+5561000000000', instagram: '@regional_experimental',
    endereco: 'Endereço fictício', localizacao: 'https://example.invalid/mapa', capa: 'capa-ficticia',
  }
  await write(`regionais/${df.id}`, brasilia, { ...data, nome: df.nome, tipo: df.tipo, cidade: '', estado: '' })
  const current = await persisted('regionais', df.id)
  for (const [key, value] of Object.entries(data)) assert.equal(current[key], value)
  for (const [key, value] of Object.entries({
    nome: 'Outro nome', tipo: 'sede', cidade: 'Outra cidade', estado: 'RJ', slug: 'outro', ordem: 5, ativo: false,
  })) {
    await denied(await api(`regionais/${df.id}`, brasilia, 'PATCH', { [key]: value, sobre: 'Alteração que deve ser descartada' }), [403])
  }
  await denied(await api(`regionais/${rj.id}`, brasilia, 'PATCH', { sobre: 'Outra unidade' }))
  await denied(await api('regionais', brasilia, 'POST', { nome: 'Outra unidade', tipo: 'regional', slug: 'outra' }))
  assert.deepEqual(await persisted('regionais', df.id), current)
  assert.notEqual((await persisted('regionais', rj.id)).sobre, 'Outra unidade')
})

test('Listas filtradas, contagens e paginação usam a mesma restrição de titularidade', async () => {
  for (const [collection, own, other] of [
    ['membros', membroDF, membroRJ], ['agenda', agendaDF, agendaRJ], ['eventos', eventoDF, eventoRJ],
  ] as const) {
    const page = await json<Page>(await api(`${collection}?limit=1&depth=0`, brasilia))
    assert.deepEqual(page.docs.map(({ id }) => id), [own.id])
    assert.equal(page.totalDocs, 1)
    assert.equal(page.totalPages, 1)
    const filtered = `where[id][equals]=${other.id}`
    assert.equal((await json<Page>(await api(`${collection}?${filtered}`, brasilia))).totalDocs, 0)
    assert.equal((await json<{ totalDocs: number }>(await api(`${collection}/count?${filtered}`, brasilia))).totalDocs, 0)
    await denied(await api(`${collection}/${other.id}`, brasilia))
  }
  await denied(await api(`agenda/${nacional.id}`, brasilia))
  await denied(await api(`agenda/${nacional.id}`, brasilia, 'PATCH', { titulo: 'Sem permissão' }))
  assert.equal((await persisted('agenda', nacional.id)).titulo, 'Compromisso nacional')
})

test('Backend deriva a unidade e reserva a transferência individual de membros ao Geral', async () => {
  assert.equal((await persisted('membros', membroDF.id)).regional, df.id)
  await denied(await api('membros', brasilia, 'POST', { titulo: 'Atribuição conflitante', regional: rj.id }), [403])
  await denied(await api(`membros/${membroDF.id}`, brasilia, 'PATCH', { regional: rj.id }), [403])
  const member = await write('membros', brasilia, { titulo: 'Integrante para transferência' }, true)
  await write(`membros/${member.id}`, geral, { regional: rj.id })
  assert.equal((await persisted('membros', member.id)).regional, rj.id)
  await denied(await api(`membros/${member.id}`, brasilia))
  assert.equal((await json<Doc>(await api(`membros/${member.id}`, rio))).id, member.id)
})

test('Atualização em lote atua sobre o escopo autorizado e exclusão permanente é negada', async () => {
  const previous = await persisted('eventos', eventoRJ.id)
  const result = await json<{ docs: Doc[] }>(await api(
    `eventos?where[id][in]=${eventoDF.id},${eventoRJ.id}`, brasilia, 'PATCH', { ativo: false },
  ))
  assert.deepEqual(result.docs.map(({ id }) => id), [eventoDF.id])
  assert.equal((await persisted('eventos', eventoDF.id)).ativo, false)
  assert.deepEqual(await persisted('eventos', eventoRJ.id), previous)
  await write(`eventos/${eventoDF.id}`, brasilia, { ativo: true })
  assert.equal((await persisted('eventos', eventoDF.id)).ativo, true)
  await denied(await api(`eventos/${eventoDF.id}`, brasilia, 'DELETE'))
  await denied(await api('eventos?where[id][exists]=true', geral, 'DELETE'))
  await denied(await api('membros?where[id][exists]=true', brasilia, 'PATCH', { regional: rj.id }), [403])
  assert.equal((await persisted('membros', membroDF.id)).regional, df.id)
  assert.equal((await persisted('eventos', eventoDF.id)).id, eventoDF.id)
})

test('Relacionamentos só aceitam entidades acessíveis do mesmo âmbito', async () => {
  const shallow = await json<Doc>(await api(`eventos/${eventoDF.id}?depth=0`, brasilia))
  assert.equal(shallow.compromisso, agendaDF.id)
  const deep = await json<Doc>(await api(`eventos/${eventoDF.id}?depth=2`, brasilia))
  assert.equal((deep.compromisso as Doc).id, agendaDF.id)
  assert.equal(((deep.compromisso as Doc).regional as Doc).id, df.id)
  const previous = await persisted('eventos', eventoDF.id)
  for (const target of [agendaRJ.id, nacional.id, { id: agendaRJ.id, titulo: 'Outro título' }]) {
    await denied(await api(`eventos/${eventoDF.id}`, brasilia, 'PATCH', { compromisso: target }), [403])
  }
  await denied(await api(`eventos/${eventoDF.id}`, geral, 'PATCH', { compromisso: agendaRJ.id }), [403])
  assert.deepEqual(await persisted('eventos', eventoDF.id), previous)
  assert.equal((await persisted('agenda', agendaRJ.id)).titulo, 'Compromisso Rio')
})

test('Diretoria é nacional e mantém uma cópia independente dos dados regionais', async () => {
  await denied(await api(`diretoria/${diretor.id}?depth=2`, brasilia))
  await denied(await api(`diretoria/${diretor.id}`, brasilia, 'PATCH', { nomePublico: 'Nome regional' }))
  await write(`membros/${membroDF.id}`, brasilia, { titulo: 'Nome regional revisado' })
  const board = await json<Doc>(await api(`diretoria/${diretor.id}?depth=2`, geral))
  assert.equal(board.nomePublico, 'Nome nacional aprovado')
  assert.equal(board.membro, membroDF.id)
  await write(`diretoria/${diretor.id}`, geral, { nomePublico: 'Revisão autorizada pelo Geral' })
  assert.equal((await persisted('diretoria', diretor.id)).nomePublico, 'Revisão autorizada pelo Geral')
})

test('Regional cria e publica rascunho sem aprovação central', async () => {
  const draft = await write('agenda?draft=true', brasilia, { titulo: 'Rascunho Brasília', _status: 'draft' }, true)
  assert.equal(draft._status, 'draft')
  assert.equal((await json<Doc>(await api(`agenda/${draft.id}?draft=true`, brasilia2))).titulo, 'Rascunho Brasília')
  await denied(await api(`agenda/${draft.id}?draft=true`, rio))
  await denied(await api(`agenda/${draft.id}?draft=true`))
  const published = await write(`agenda/${draft.id}`, brasilia, { titulo: 'Publicado Brasília', _status: 'published' })
  assert.equal(published._status, 'published')
  assert.equal((await persisted('agenda', draft.id)).titulo, 'Publicado Brasília')
})

test('Histórico e restauração usam o escopo vigente e restauração só produz rascunho', async () => {
  const initial = await json<Page>(await api(`agenda/versions?where[parent][equals]=${agendaDF.id}`, brasilia))
  const foreign = await json<Page>(await api(`agenda/versions?where[parent][equals]=${agendaRJ.id}`, rio))
  const original = initial.docs[0].id
  const other = foreign.docs[0].id
  assert.equal((await json<Page>(await api(`agenda/versions?where[parent][equals]=${agendaRJ.id}`, brasilia))).totalDocs, 0)
  const access = { req: await local(brasilia), overrideAccess: false as const, depth: 0 }
  assert.equal((await payload.findVersionByID({ collection: 'agenda', id: String(original), ...access })).id, original)
  await assert.rejects(payload.findVersionByID({ collection: 'agenda', id: String(other), ...access }))
  await denied(await api(`agenda/versions/${other}`, brasilia))
  await denied(await api(`agenda/versions/${other}?draft=true`, brasilia, 'POST'))
  await denied(await api(`agenda/${agendaDF.id}?draft=true`, brasilia, 'PATCH', { regional: rj.id }), [403])
  await write(`agenda/${agendaDF.id}`, brasilia, { titulo: 'Versão nova', _status: 'published' })
  await denied(await api(`agenda/versions/${original}`, brasilia, 'POST'), [400])
  await denied(await api(`agenda/${agendaDF.id}`, geral, 'PATCH', { regional: rj.id }), [403])
  await json(await api(`agenda/versions/${original}?draft=true`, brasilia2, 'POST'))
  const draft = await json<Doc>(await api(`agenda/${agendaDF.id}?draft=true&depth=0`, brasilia))
  assert.equal(draft.titulo, 'Compromisso Brasília')
  assert.equal(draft._status, 'draft')
  assert.equal(draft.regional, df.id)
  assert.equal((await persisted('agenda', agendaDF.id)).titulo, 'Versão nova')
  assert.equal((await persisted('agenda', agendaRJ.id)).regional, rj.id)
})

test('Local API com contexto autenticado aplica filtros, população e autorização de escrita', async () => {
  const req = await local(brasilia)
  const access = { req, overrideAccess: false as const }
  const list = await payload.find({ collection: 'eventos', depth: 2, ...access })
  assert.deepEqual(list.docs.map(({ id }) => id), [eventoDF.id])
  assert.equal(list.docs[0].compromisso.id, agendaDF.id)
  assert.equal((await payload.count({ collection: 'eventos', ...access })).totalDocs, 1)
  await assert.rejects(payload.findByID({ collection: 'membros', id: membroRJ.id, ...access }))
  await assert.rejects(payload.update({ collection: 'membros', id: membroRJ.id, data: { titulo: 'Outro membro' }, ...access }))
  await assert.rejects(payload.delete({ collection: 'membros', id: membroDF.id, ...access }))
  assert.equal((await persisted('membros', membroRJ.id)).titulo, 'Integrante Rio')
  const result = await payload.update({ collection: 'membros', id: membroDF.id, data: { patente: 'Patente fictícia' }, ...access })
  assert.equal(result.patente, 'Patente fictícia')
})

test('Conta regional só consulta a si e pode trocar a própria senha', async () => {
  const self = await json<Page>(await api('users', brasilia))
  assert.deepEqual(self.docs.map(({ id }) => id), [brasilia.user.id])
  await denied(await api(`users/${rio.user.id}`, brasilia))
  await denied(await api(`users/${rio.user.id}`, brasilia, 'PATCH', { password }))
  await denied(await api('users/unlock', brasilia, 'POST', { email: regionEmail('rio') }), [403])
  await denied(await api('users', brasilia, 'POST', { email: regionEmail('extra'), password, perfil: 'geral' }))
  const path = `users/${brasilia.user.id}`
  const previous = await persisted('users', brasilia.user.id)
  for (const data of [{ perfil: 'geral' }, { regional: rj.id }, { ativo: false }]) {
    await denied(await api(path, brasilia, 'PATCH', data), [403])
  }
  for (const field of ['perfil', 'regional', 'ativo']) assert.equal((await persisted('users', brasilia.user.id))[field], previous[field])
  const newPassword = randomBytes(24).toString('hex')
  await write(path, brasilia, { password: newPassword, email: previous.email, perfil: previous.perfil, regional: previous.regional })
  brasilia = await login(regionEmail('brasilia-1'), newPassword)
  assert.equal(brasilia.user.id, previous.id)
})

test('Desativação revoga credenciais emitidas, inclusive após reativação', async () => {
  const path = `users/${brasilia2.user.id}`
  await write(path, geral, { ativo: false })
  await denied(await api('membros', brasilia2))
  await denied(await api(path, brasilia2, 'PATCH', { ativo: true }))
  await denied(await api('users/login', undefined, 'POST', { email: regionEmail('brasilia-2'), password }), [401, 403])
  await write(path, geral, { ativo: true })
  await denied(await api('membros', brasilia2))
  brasilia2 = await login(regionEmail('brasilia-2'))
  assert.equal((await json<Page>(await api('regionais', brasilia2))).totalDocs, 1)
})

test('A última conta Geral fica protegida em alterações sequenciais e concorrentes', async () => {
  await denied(await api(`users/${geral.user.id}`, geral, 'PATCH', { ativo: false }), [409])
  await denied(await api(`users/${geral.user.id}`, geral, 'PATCH', { perfil: 'regional', regional: df.id }), [409])
  const email = regionEmail('segundo-geral')
  const second = await write('users', geral, { email, password, perfil: 'geral' }, true)
  const secondSession = await login(email)
  const requests = await Promise.all([local(geral), local(secondSession)])
  const outcomes = await Promise.allSettled([geral.user.id, second.id].map((id, index) =>
    payload.update({ collection: 'users', id, req: requests[index], overrideAccess: false, data: { ativo: false } }),
  ))
  assert.equal(outcomes.filter(result => result.status === 'fulfilled').length, 1)
  const rejected = outcomes.find(result => result.status === 'rejected')
  assert.equal(rejected?.reason.status, 409)
  assert.equal((await payload.count({
    collection: 'users', overrideAccess: true, where: { perfil: { equals: 'geral' }, ativo: { equals: true } },
  })).totalDocs, 1)
  if (!(await persisted('users', geral.user.id)).ativo) {
    await write(`users/${geral.user.id}`, secondSession, { ativo: true })
    geral = await login(POC_ADMIN_EMAIL!, POC_ADMIN_PASSWORD!)
  }
  if ((await persisted('users', second.id)).ativo) await write(`users/${second.id}`, geral, { ativo: false })
})

test('Reinício do standalone preserva dados e autorização; pool local permanece limitado', async () => {
  await stop()
  await start()
  assert.equal((await json<Doc>(await api(`eventos/${eventoDF.id}`, brasilia))).id, eventoDF.id)
  await denied(await api(`eventos/${eventoRJ.id}`, brasilia))
  assert.equal((await persisted('membros', membroDF.id)).patente, 'Patente fictícia')
  const { pool } = payload.db as unknown as { pool: { options: { max: number }; totalCount: number } }
  assert.equal(pool.options.max, 3)
  assert.ok(pool.totalCount <= 3)
})
