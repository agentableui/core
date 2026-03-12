import { describe, it, expect } from 'vitest'
import { buildManifest } from '../src/manifest/builder'
import type { AgentableConfig } from '../src/types'

const config: AgentableConfig = {
  name: 'test-store',
  baseUrl: 'https://store.com',
  entrypoint: 'home',
  states: {
    home: {
      route: '/',
      description: 'Home',
      actions: {
        search: {
          params: { query: { type: 'string', required: true } },
          transitions: 'results',
        },
        'go-admin': { transitions: 'admin' },
      },
    },
    results: {
      route: '/results',
      description: 'Results',
      actions: { 'go-home': { transitions: 'home' } },
    },
    admin: {
      route: '/admin',
      description: 'Admin panel',
      actions: {
        'delete-user': {
          params: { userId: { type: 'string', required: true } },
          returnToPrevious: true,
        },
      },
    },
  },
  auth: { public: ['home', 'results'], admin: '*' },
  security: {
    requireApiKey: true,
    rateLimit: { requests: 100, window: '1m', scope: 'per-key' },
    publicActions: ['search', 'go-home'],
    authenticatedActions: ['delete-user'],
  },
}

describe('buildManifest', () => {
  it('filters states by role', () => {
    const manifest = buildManifest(config, 'public')
    expect(Object.keys(manifest.states)).toEqual(['home', 'results'])
    expect(manifest.states.admin).toBeUndefined()
  })

  it('removes actions with dangling transitions', () => {
    const manifest = buildManifest(config, 'public')
    expect(manifest.states.home.actions['go-admin']).toBeUndefined()
  })

  it('includes all states for wildcard role', () => {
    const manifest = buildManifest(config, 'admin')
    expect(Object.keys(manifest.states)).toEqual(['home', 'results', 'admin'])
  })

  it('marks authenticated actions with auth: true', () => {
    const manifest = buildManifest(config, 'admin')
    expect(manifest.states.admin.actions['delete-user'].auth).toBe(true)
  })

  it('strips returnToPrevious from manifest output', () => {
    const manifest = buildManifest(config, 'admin')
    expect((manifest.states.admin.actions['delete-user'] as any).returnToPrevious).toBeUndefined()
  })

  it('sets version, versionHash, name, baseUrl, entrypoint, role', () => {
    const manifest = buildManifest(config, 'public')
    expect(manifest.version).toBe('1.0')
    expect(manifest.name).toBe('test-store')
    expect(manifest.baseUrl).toBe('https://store.com')
    expect(manifest.entrypoint).toBe('home')
    expect(manifest.role).toBe('public')
    expect(manifest.versionHash).toMatch(/^[a-f0-9]{8}$/)
  })

  it('throws for unknown role', () => {
    expect(() => buildManifest(config, 'nonexistent')).toThrow(/role/)
  })
})
