import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import {
  adminConfig, disposableDatabaseURL, localStorageEndpoint, publicationNamespace,
} from '../src/config.ts'

const env = {
  ADMIN_ENV: 'dev',
  NODE_ENV: 'production' as const,
  DATABASE_URL: 'postgresql://fixture:senha-ficticia@127.0.0.1:5432/ospapas_poc_config',
  PAYLOAD_SECRET: 'segredo-sintetico-usado-apenas-nos-testes',
}
const root = new URL('../', import.meta.url)

test('build de produção local continua DEV', () => {
  const config = adminConfig(env)
  assert.equal(config.environment, 'dev')
  assert.equal(config.database.pathname, '/ospapas_poc_config')
  assert.equal(publicationNamespace(env), 'dev')
})

test('ambiente deve ser explícito e namespaces simulados só divergem em DEV', () => {
  for (const ADMIN_ENV of [undefined, 'production', 'DEV', 'dev ']) {
    assert.throws(() => adminConfig({ ...env, ADMIN_ENV }), /ADMIN_ENV/)
  }
  assert.equal(publicationNamespace({ ...env, POC_PUBLIC_ENV: 'hml' }), 'hml')
  assert.throws(() => adminConfig({ ...env, ADMIN_ENV: 'prd', POC_PUBLIC_ENV: 'dev' }), /incompatível/)
  assert.throws(() => adminConfig({ ...env, POC_PUBLIC_ENV: 'inválido' }), /inválido/)
})

test('segredos ausentes ou curtos e endereços inválidos geram erros sanitizados', () => {
  for (const PAYLOAD_SECRET of [undefined, 'curto', ' '.repeat(32)]) {
    assert.throws(() => adminConfig({ ...env, PAYLOAD_SECRET }), /PAYLOAD_SECRET/)
  }
  for (const DATABASE_URL of [undefined, 'url-com-segredo-ficticio', 'https://example.invalid/fixture']) {
    assert.throws(() => adminConfig({ ...env, DATABASE_URL }), {
      message: 'Configure uma DATABASE_URL PostgreSQL válida, com banco explícito.',
    })
  }
  assert.throws(() => localStorageEndpoint('endereco-com-segredo-ficticio'), {
    message: 'Configure um endpoint S3 local válido para o emulador.',
  })
})

test('destino descartável exige loopback, nome reservado e parâmetros inequívocos', () => {
  assert.equal(disposableDatabaseURL(env.DATABASE_URL).port, '5432')
  for (const url of [
    env.DATABASE_URL.replace('127.0.0.1', 'db.example.invalid'),
    env.DATABASE_URL.replace('ospapas_poc_config', 'postgres'),
    env.DATABASE_URL + '?host=db.example.invalid',
    env.DATABASE_URL + '?dbname=postgres',
    env.DATABASE_URL + '?options=-csearch_path=outro',
    env.DATABASE_URL.replace(':senha-ficticia', ''),
  ]) {
    assert.throws(() => disposableDatabaseURL(url), /PostgreSQL/)
  }
  assert.throws(() => adminConfig({ ...env, DATABASE_URL: env.DATABASE_URL.replace('127.0.0.1', 'db.example.invalid') }), /loopback/)
  assert.throws(() => localStorageEndpoint('https://s3.example.invalid'), /emulador/)
})

test('flag herdada não autoriza preparação pelo backend em nenhum ambiente', () => {
  for (const ADMIN_ENV of ['dev', 'hml', 'prd']) {
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', "await import('./src/payload.config.ts')"], {
      cwd: root, env: { ...env, ADMIN_ENV, POC_PREPARE_SCHEMA: '1' }, encoding: 'utf8',
    })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Use npm run db:prepare/)
    assert.doesNotMatch(result.stderr, /senha-ficticia|segredo-sintetico/)
  }
})

test('preparação, emuladores e demonstração recusam HML e PRD antes de acessar destinos', () => {
  for (const ADMIN_ENV of ['hml', 'prd']) {
    for (const entry of ['src/prepare-db.ts', 'scripts/prepare-storage.ts', 'scripts/prepare-publication.ts',
      'scripts/publication-demo.ts', 'scripts/recovery.ts']) {
      const result = spawnSync(process.execPath, [entry, 'backup'], {
        cwd: root, env: { ...env, NODE_ENV: 'development', ADMIN_ENV }, encoding: 'utf8',
      })
      assert.equal(result.status, 1, entry)
      assert.match(result.stderr, /somente em ADMIN_ENV=dev/, entry)
    }
  }
})
