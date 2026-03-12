import { describe, it, expect } from 'vitest'
import { defineAgentable } from '../src/define/agentable'

const validConfig = {
  name: 'test-app',
  baseUrl: 'https://example.com',
  entrypoint: 'home',
  states: {
    home: {
      route: '/',
      description: 'Home page',
      actions: {
        search: {
          description: 'Search',
          params: { query: { type: 'string' as const, required: true } },
          transitions: 'results',
        },
        'go-login': { transitions: 'login' },
      },
    },
    results: {
      route: '/results',
      description: 'Results',
      actions: {
        'go-home': { transitions: 'home' },
      },
    },
    login: {
      route: '/login',
      description: 'Login',
      actions: {
        authenticate: {
          params: { token: { type: 'string' as const, required: true } },
          transitions: 'home',
          returnToPrevious: true,
        },
      },
    },
  },
  auth: {
    public: ['home', 'results', 'login'],
    user: '*' as const,
  },
  security: {
    requireApiKey: true,
    rateLimit: { requests: 100, window: '1m', scope: 'per-key' as const },
    publicActions: ['search', 'go-home', 'go-login'],
    authenticatedActions: ['authenticate'],
  },
}

describe('defineAgentable', () => {
  it('returns config when valid', () => {
    const result = defineAgentable(validConfig)
    expect(result).toEqual(validConfig)
  })

  it('throws if entrypoint not in states', () => {
    expect(() =>
      defineAgentable({ ...validConfig, entrypoint: 'nonexistent' })
    ).toThrow(/entrypoint/)
  })

  it('throws if transition target not in states', () => {
    expect(() =>
      defineAgentable({
        ...validConfig,
        states: {
          home: {
            route: '/',
            description: 'Home',
            actions: { go: { transitions: 'nowhere' } },
          },
        },
      })
    ).toThrow(/transition/)
  })

  it('throws if name is empty', () => {
    expect(() => defineAgentable({ ...validConfig, name: '' })).toThrow(/name/)
  })

  it('throws if enum param missing values', () => {
    expect(() =>
      defineAgentable({
        ...validConfig,
        states: {
          home: {
            route: '/',
            description: 'Home',
            actions: {
              act: {
                params: { p: { type: 'enum', required: true } },
                transitions: 'home',
              },
            },
          },
        },
      })
    ).toThrow(/values/)
  })
})
