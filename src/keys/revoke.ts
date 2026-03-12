import { loadKeys, saveKeys } from './store'

const DEFAULT_KEYS_PATH = '.agentable/keys.json'

export async function revokeKey(keyPrefix: string, storePath: string = DEFAULT_KEYS_PATH): Promise<boolean> {
  const store = await loadKeys(storePath)
  const key = store.keys.find(k => k.prefix === keyPrefix)
  if (!key) return false
  key.revokedAt = new Date().toISOString()
  await saveKeys(storePath, store)
  return true
}
