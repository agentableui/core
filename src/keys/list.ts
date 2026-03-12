import type { KeyInfo } from '../types'
import { loadKeys } from './store'

const DEFAULT_KEYS_PATH = '.agentable/keys.json'

export async function listKeys(storePath: string = DEFAULT_KEYS_PATH): Promise<KeyInfo[]> {
  const store = await loadKeys(storePath)
  return store.keys.map(({ prefix, name, role, createdAt, revokedAt }) => ({
    prefix, name, role, createdAt, revokedAt,
  }))
}
