import { describe, it, expect } from 'vitest'
import { AgentableError, AgentableRedirect } from '../src/errors'

describe('AgentableError', () => {
  it('stores code and message', () => {
    const err = new AgentableError('OUT_OF_STOCK', 'Item unavailable')
    expect(err).toBeInstanceOf(Error)
    expect(err.code).toBe('OUT_OF_STOCK')
    expect(err.message).toBe('Item unavailable')
    expect(err.name).toBe('AgentableError')
  })
})

describe('AgentableRedirect', () => {
  it('stores reason', () => {
    const err = new AgentableRedirect('auth-required')
    expect(err).toBeInstanceOf(Error)
    expect(err.reason).toBe('auth-required')
    expect(err.name).toBe('AgentableRedirect')
  })
})
