import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { disposableDatabaseURL, requireExperimentalEnvironment } from './config.ts'
import { postgres, query } from './security/recovery-db.ts'

export const experimentalBootstrap = Symbol('primeira conta experimental')

export async function assertDisposableDatabase(input = process.env.DATABASE_URL) {
  requireExperimentalEnvironment()
  const database = disposableDatabaseURL(input)
  const dir = await mkdtemp(join(tmpdir(), 'ospapas-destino-'))
  try {
    const run = await postgres(database, dir)
    const result = await query(run, `SELECT current_database() || ':' ||
      coalesce(shobj_description(oid, 'pg_database'), '') FROM pg_database
      WHERE datname = current_database() AND inet_server_addr() IN ('127.0.0.1', '::1')`)
    if (result !== `${database.pathname.slice(1)}:ospapas-poc-disposable`) {
      throw new Error('O PostgreSQL não confirmou a marca de banco descartável.')
    }
    return database
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}
