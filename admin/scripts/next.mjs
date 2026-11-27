import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'
import { adminConfig } from '../src/config.ts'

const root = new URL('../', import.meta.url)
const nextEnvFiles = ['.env', '.env.local', '.env.development', '.env.development.local',
  '.env.production', '.env.production.local', '.env.test', '.env.test.local']

if (nextEnvFiles.some(file => existsSync(new URL(file, root)))) {
  throw new Error('Remova os arquivos .env carregados pelo Next.js. Use .env.poc em DEV ou variáveis do processo.')
}

const localEnv = new URL('.env.poc', root)
if ((!process.env.ADMIN_ENV || process.env.ADMIN_ENV === 'dev') && existsSync(localEnv)) {
  loadEnvFile(localEnv)
}

adminConfig()
await import('../node_modules/next/dist/bin/next')
