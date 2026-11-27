export type AdminEnvironment = 'dev' | 'hml' | 'prd'

type Env = NodeJS.ProcessEnv
const loopback = new Set(['localhost', '127.0.0.1', '[::1]'])

export function applicationEnvironment(env: Env = process.env): AdminEnvironment {
  const value = env.ADMIN_ENV
  if (value !== 'dev' && value !== 'hml' && value !== 'prd') {
    throw new Error('Configure ADMIN_ENV explicitamente como dev, hml ou prd.')
  }
  return value
}

export function requireExperimentalEnvironment(env: Env = process.env) {
  if (applicationEnvironment(env) !== 'dev') {
    throw new Error('Recursos experimentais são permitidos somente em ADMIN_ENV=dev.')
  }
}

function configuredURL(input: string | undefined, protocols: string[], error: string) {
  if (input && input.trim() === input) {
    try {
      const url = new URL(input)
      if (protocols.includes(url.protocol) && url.hostname && !url.hash) return url
    } catch {
      // Não propagar a URL original, que pode conter credenciais.
    }
  }
  throw new Error(error)
}

export function localStorageEndpoint(input: string | undefined) {
  const error = 'Configure um endpoint S3 local válido para o emulador.'
  const url = configuredURL(input, ['http:', 'https:'], error)
  if (!loopback.has(url.hostname) || url.username || url.password || url.search || url.pathname !== '/') {
    throw new Error(error)
  }
  return url
}

export function postgresURL(input: string | undefined) {
  const error = 'Configure uma DATABASE_URL PostgreSQL válida, com banco explícito.'
  const url = configuredURL(input, ['postgres:', 'postgresql:'], error)
  const identityKeys = ['host', 'hostaddr', 'port', 'user', 'username', 'password', 'database', 'dbname']
  if (url.pathname.length < 2 || [...url.searchParams.keys()].some(key => identityKeys.includes(key.toLowerCase()))) {
    throw new Error(error)
  }
  return url
}

export function publicationNamespace(env: Env = process.env): AdminEnvironment {
  const environment = applicationEnvironment(env)
  const namespace = env.POC_PUBLIC_ENV ?? environment
  if ((namespace !== 'dev' && namespace !== 'hml' && namespace !== 'prd') ||
      (environment !== 'dev' && namespace !== environment)) {
    throw new Error('Ambiente de publicação inválido ou incompatível com ADMIN_ENV.')
  }
  return namespace
}

// As credenciais são consumidas somente no servidor e nunca são expostas à configuração do Next.js.
export function adminConfig(env: Env = process.env) {
  const environment = applicationEnvironment(env)
  publicationNamespace(env)
  if (env.POC_PREPARE_SCHEMA !== undefined && env.POC_PREPARE_SCHEMA !== '0') {
    throw new Error('Use npm run db:prepare para preparar um banco descartável.')
  }
  const database = postgresURL(env.DATABASE_URL)
  if (environment === 'dev' && (!loopback.has(database.hostname) || database.search)) {
    throw new Error('DEV exige PostgreSQL no loopback sem parâmetros na URL.')
  }
  const secret = env.PAYLOAD_SECRET
  if (!secret || secret.trim().length < 32) {
    throw new Error('Configure PAYLOAD_SECRET com pelo menos 32 caracteres.')
  }
  return { environment, database, secret }
}

export function disposableDatabaseURL(input: string | undefined) {
  const url = postgresURL(input)
  if (!loopback.has(url.hostname) || !/^\/ospapas_poc_[a-z0-9_]{1,51}$/.test(url.pathname) ||
      !url.username || !url.password || url.search) {
    throw new Error('Use um PostgreSQL descartável no loopback com banco ospapas_poc_* e credenciais explícitas.')
  }
  url.port ||= '5432'
  return url
}
