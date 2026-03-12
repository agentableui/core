import { describe, it, expect } from 'vitest'
import { validateParams } from '../src/validation/params'
import type { ActionConfig } from '../src/types'

const action: ActionConfig = {
  params: {
    query: { type: 'string', required: true },
    limit: { type: 'number', required: false },
    active: { type: 'boolean', required: true },
    sort: { type: 'enum', required: true, values: ['asc', 'desc'] },
  },
}

describe('validateParams', () => {
  it('returns empty array for valid params', () => {
    const errors = validateParams(action, { query: 'shoes', active: true, sort: 'asc' })
    expect(errors).toEqual([])
  })

  it('errors on missing required param', () => {
    const errors = validateParams(action, { active: true, sort: 'asc' })
    expect(errors).toEqual([{ param: 'query', message: 'Required parameter "query" is missing' }])
  })

  it('errors on wrong type (string expected, number given)', () => {
    const errors = validateParams(action, { query: 123, active: true, sort: 'asc' })
    expect(errors[0].param).toBe('query')
    expect(errors[0].message).toMatch(/string/)
  })

  it('errors on wrong type (number expected, string given)', () => {
    const errors = validateParams(action, { query: 'q', limit: 'ten', active: true, sort: 'asc' })
    expect(errors[0].param).toBe('limit')
  })

  it('errors on invalid enum value', () => {
    const errors = validateParams(action, { query: 'q', active: true, sort: 'random' })
    expect(errors[0].param).toBe('sort')
    expect(errors[0].message).toMatch(/asc/)
  })

  it('allows missing optional param', () => {
    const errors = validateParams(action, { query: 'q', active: false, sort: 'desc' })
    expect(errors).toEqual([])
  })

  it('returns empty array for action with no params defined', () => {
    const errors = validateParams({}, { anything: 'goes' })
    expect(errors).toEqual([])
  })

  it('rejects NaN', () => {
    const errors = validateParams(action, { query: 'q', limit: NaN, active: true, sort: 'asc' })
    expect(errors).toHaveLength(1)
    expect(errors[0].param).toBe('limit')
    expect(errors[0].message).toContain('finite')
  })

  it('rejects Infinity', () => {
    const errors = validateParams(action, { query: 'q', limit: Infinity, active: true, sort: 'asc' })
    expect(errors).toHaveLength(1)
    expect(errors[0].param).toBe('limit')
  })

  it('rejects -Infinity', () => {
    const errors = validateParams(action, { query: 'q', limit: -Infinity, active: true, sort: 'asc' })
    expect(errors).toHaveLength(1)
    expect(errors[0].param).toBe('limit')
  })

  it('accepts 0, negative numbers, and floats', () => {
    const numAction: ActionConfig = { params: { n: { type: 'number', required: true } } }
    expect(validateParams(numAction, { n: 0 })).toEqual([])
    expect(validateParams(numAction, { n: -5 })).toEqual([])
    expect(validateParams(numAction, { n: 3.14 })).toEqual([])
  })

  it('rejects non-string value for enum param', () => {
    const errors = validateParams(action, { query: 'q', active: true, sort: 42 })
    expect(errors).toHaveLength(1)
    expect(errors[0].param).toBe('sort')
  })

  it('treats null as missing for optional param', () => {
    const errors = validateParams(action, { query: 'q', limit: null, active: true, sort: 'asc' })
    expect(errors).toEqual([])
  })
})
