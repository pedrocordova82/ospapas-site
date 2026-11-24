import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

const localEnv = new URL('../.env.poc', import.meta.url)

if (existsSync(localEnv)) {
  loadEnvFile(localEnv)
}

await import('../node_modules/next/dist/bin/next')
