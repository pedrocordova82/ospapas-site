import { requireExperimentalEnvironment } from '../src/config.ts'
import { closeStorage } from '../src/media/storage.ts'
import { publicationEnvironment, ReleaseStore } from '../src/publication/store.ts'

requireExperimentalEnvironment()

try {
  await new ReleaseStore(publicationEnvironment()).prepare()
  console.info('Destinos experimentais de publicação disponíveis.')
} finally {
  closeStorage()
}
