import { closeStorage, prepareStorage } from '../src/media/storage.ts'

try {
  await prepareStorage()
  console.info('Bucket experimental disponível no emulador local.')
} finally {
  closeStorage()
}
