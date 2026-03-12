import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

export interface StoredKey {
  prefix: string
  name: string
  hash: string
  role: string
  createdAt: string
  revokedAt: string | null
}

export interface KeyStore {
  keys: StoredKey[]
}

export async function loadKeys(storePath: string): Promise<KeyStore> {
  try {
    const content = await readFile(storePath, 'utf-8')
    return JSON.parse(content)
  } catch {
    return { keys: [] }
  }
}

export async function saveKeys(storePath: string, store: KeyStore): Promise<void> {
  await mkdir(dirname(storePath), { recursive: true })
  await writeFile(storePath, JSON.stringify(store, null, 2), 'utf-8')
}
