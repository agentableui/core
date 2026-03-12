import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { generateKey } from '../src/keys/generate'
import { loadKeys } from '../src/keys/store'

let tempDir: string
let keysPath: string

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'agentable-keys-'))
  keysPath = join(tempDir, 'keys.json')
})

afterEach(async () => {
  await rm(tempDir, { recursive: true })
})

describe('generateKey', () => {
  it('returns key with correct prefix format', async () => {
    const result = await generateKey('test-agent', { role: 'user' }, keysPath)
    expect(result.key).toMatch(/^agui_k1_[a-f0-9]{32}$/)
    expect(result.prefix).toBe(result.key.slice(0, 12))
    expect(result.name).toBe('test-agent')
    expect(result.role).toBe('user')
  })

  it('stores hashed key in keys.json', async () => {
    const result = await generateKey('test-agent', {}, keysPath)
    const store = await loadKeys(keysPath)
    expect(store.keys).toHaveLength(1)
    expect(store.keys[0].prefix).toBe(result.prefix)
    expect(store.keys[0].name).toBe('test-agent')
    expect(store.keys[0].hash).toBeTruthy()
    expect(JSON.stringify(store)).not.toContain(result.key)
  })

  it('defaults role to user', async () => {
    const result = await generateKey('agent', {}, keysPath)
    expect(result.role).toBe('user')
  })

  it('appends to existing keys', async () => {
    await generateKey('agent-1', {}, keysPath)
    await generateKey('agent-2', {}, keysPath)
    const store = await loadKeys(keysPath)
    expect(store.keys).toHaveLength(2)
  })
})

import { listKeys } from '../src/keys/list'
import { revokeKey } from '../src/keys/revoke'

describe('listKeys', () => {
  it('returns empty array for nonexistent store', async () => {
    const keys = await listKeys(join(tempDir, 'nonexistent.json'))
    expect(keys).toEqual([])
  })

  it('returns key info without hash', async () => {
    await generateKey('agent', {}, keysPath)
    const keys = await listKeys(keysPath)
    expect(keys).toHaveLength(1)
    expect(keys[0].name).toBe('agent')
    expect((keys[0] as any).hash).toBeUndefined()
  })
})

describe('revokeKey', () => {
  it('marks key as revoked', async () => {
    const { prefix } = await generateKey('agent', {}, keysPath)
    const result = await revokeKey(prefix, keysPath)
    expect(result).toBe(true)
    const keys = await listKeys(keysPath)
    expect(keys[0].revokedAt).toBeTruthy()
  })

  it('returns false for unknown prefix', async () => {
    await generateKey('agent', {}, keysPath)
    const result = await revokeKey('agui_k1_xxxx', keysPath)
    expect(result).toBe(false)
  })
})
