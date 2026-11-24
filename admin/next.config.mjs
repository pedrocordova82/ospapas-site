import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))

export default withPayload({
  output: 'standalone',
  outputFileTracingRoot: root,
  poweredByHeader: false,
  turbopack: { root },
})
