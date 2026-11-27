import { execFile } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'
export { disposableDatabaseURL as databaseURL } from '../config.ts'

const exec = promisify(execFile)
type Tool = 'pg_dump' | 'pg_restore' | 'psql'

export async function postgres(url: URL, dir: string) {
  const fields = [url.hostname.replace(/^\[|\]$/g, ''), url.port || '5432',
    url.pathname.slice(1), decodeURIComponent(url.username), decodeURIComponent(url.password)]
  if (fields.some(field => /[\r\n]/.test(field))) throw new Error('Configuração PostgreSQL inválida.')
  const passwordFile = join(dir, 'pgpass')
  const line = fields.map(field => field.replaceAll('\\', '\\\\').replaceAll(':', '\\:')).join(':')
  await writeFile(passwordFile, line + '\n', { flag: 'wx', mode: 0o600 })
  const [PGHOST, PGPORT, PGDATABASE, PGUSER] = fields
  const path = process.env.POC_RECOVERY_DB_TOOLS
  return async (tool: Tool, args: string[]) => {
    try {
      return (await exec(path ? join(path, tool) : tool, args, {
        env: { NODE_ENV: process.env.NODE_ENV, PATH: process.env.PATH, LC_ALL: 'C', PGPASSFILE: passwordFile, PGHOST,
          PGPORT, PGDATABASE, PGUSER, PGCONNECT_TIMEOUT: '5' },
        timeout: 120_000, maxBuffer: 2 * 1024 ** 2,
      })).stdout.trim()
    } catch {
      throw new Error(`${tool} falhou no banco descartável.`)
    }
  }
}

export async function samePostgresMajor(run: Awaited<ReturnType<typeof postgres>>, tool: 'pg_dump' | 'pg_restore') {
  const version = Number((await run(tool, ['--version'])).match(/\(PostgreSQL\) (\d+)/)?.[1])
  const server = Number(await query(run, 'SHOW server_version_num'))
  if (!Number.isInteger(version) || Math.floor(server / 10_000) !== version) {
    throw new Error('Versões principais do cliente e do PostgreSQL devem coincidir.')
  }
  return version
}

export function query(run: Awaited<ReturnType<typeof postgres>>, statement: string) {
  return run('psql', ['-X', '-qAt', '-w', '-v', 'ON_ERROR_STOP=1', '-c', statement])
}
