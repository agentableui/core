import { describe, it, expect } from 'vitest'
import { resolveHandler } from '../src/pipeline/resolve-handler'
import type { ActionConfig, HandlerFn } from '../src/types'

const mockHandler: HandlerFn<any> = async () => ({ ok: true })

describe('resolveHandler', () => {
  it('returns scoped handler (state.action) first', () => {
    const handlers = { 'home.search': mockHandler, search: async () => ({ fallback: true }) }
    const result = resolveHandler('home', 'search', handlers, { params: { q: { type: 'string', required: true } } })
    expect(result).toBe(mockHandler)
  })

  it('falls back to action-only key', () => {
    const handlers = { search: mockHandler }
    const result = resolveHandler('home', 'search', handlers, { params: { q: { type: 'string', required: true } } })
    expect(result).toBe(mockHandler)
  })

  it('returns null for pure transition (no params, errors, redirects, available, returnToPrevious)', () => {
    const result = resolveHandler('home', 'go-back', {}, { transitions: 'landing' })
    expect(result).toBeNull()
  })

  it('returns null for pure transition with description only', () => {
    const result = resolveHandler('home', 'go-back', {}, { transitions: 'landing', description: 'Go back' })
    expect(result).toBeNull()
  })

  it('throws for non-pure action with no handler', () => {
    expect(() =>
      resolveHandler('home', 'search', {}, { params: { q: { type: 'string', required: true } } })
    ).toThrow(/handler/)
  })

  it('throws for action with available but no handler', () => {
    expect(() =>
      resolveHandler('cart', 'checkout', {}, { transitions: 'checkout', available: 'cart-not-empty' })
    ).toThrow(/handler/)
  })
})
