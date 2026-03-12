import { randomBytes, createHash } from 'node:crypto'
import type { GeneratedKey, KeyOptions } from '../types'
import { loadKeys, saveKeys } from './store'

const DEFAULT_KEYS_PATH = '.agentable/keys.json'

export async function generateKey(
  name: string,
  options: KeyOptions = {},
  storePath: string = DEFAULT_KEYS_PATH
): Promise<GeneratedKey> {
  const role = options.role ?? 'user'
  const random = randomBytes(16).toString('hex')
  const key = `agui_k1_${random}`
  const prefix = key.slice(0, 12)
  const hash = createHash('sha256').update(key).digest('hex')

  const store = await loadKeys(storePath)
  store.keys.push({
    prefix,
    name,
    hash,
    role,
    createdAt: new Date().toISOString(),
    revokedAt: null,
  })
  await saveKeys(storePath, store)

  return { key, prefix, name, role }
}
