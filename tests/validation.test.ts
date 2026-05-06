import { describe, it, expect } from 'vitest'
import {
  sanitizeString,
  sanitizeCurrency,
  validateRequired,
  validateRowIndex,
  validateTableNumber,
  validateEmail,
  validatePhone,
} from '../app/lib/validation'

describe('sanitizeString', () => {
  it('trims and limits string length', () => {
    expect(sanitizeString('  hello  ', 10)).toBe('hello')
    expect(sanitizeString('a'.repeat(600), 500).length).toBe(500)
  })

  it('removes angle brackets', () => {
    expect(sanitizeString('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(123 as unknown as string)).toBe('')
    expect(sanitizeString(null as unknown as string)).toBe('')
    expect(sanitizeString(undefined as unknown as string)).toBe('')
  })
})

describe('sanitizeCurrency', () => {
  it('formats valid currency', () => {
    expect(sanitizeCurrency('₱1,234.56')).toBe('₱1234.56')
    expect(sanitizeCurrency('100')).toBe('₱100.00')
  })

  it('handles invalid input', () => {
    expect(sanitizeCurrency('abc')).toBe('₱0.00')
    expect(sanitizeCurrency('')).toBe('₱0.00')
    expect(sanitizeCurrency('-50')).toBe('₱0.00')
  })
})

describe('validateRequired', () => {
  it('returns null when all fields present', () => {
    expect(validateRequired({ name: 'John', age: 25 }, ['name', 'age'])).toBeNull()
  })

  it('returns error when field missing', () => {
    expect(validateRequired({ name: 'John' }, ['name', 'email'])).toBe('email is required')
  })

  it('returns error when field is empty string', () => {
    expect(validateRequired({ name: '' }, ['name'])).toBe('name is required')
  })
})

describe('validateRowIndex', () => {
  it('accepts valid row index', () => {
    expect(validateRowIndex(0)).toBeNull()
    expect(validateRowIndex(100)).toBeNull()
  })

  it('rejects invalid values', () => {
    expect(validateRowIndex(-1)).toContain('must be a non-negative integer')
    expect(validateRowIndex(1.5)).toContain('must be a non-negative integer')
    expect(validateRowIndex('abc' as unknown as undefined)).toContain('must be a number')
    expect(validateRowIndex(undefined)).toContain('required')
  })

  it('rejects out of range', () => {
    expect(validateRowIndex(10001)).toContain('out of range')
  })
})

describe('validateTableNumber', () => {
  it('accepts valid table numbers', () => {
    expect(validateTableNumber(1)).toBeNull()
    expect(validateTableNumber(50)).toBeNull()
  })

  it('rejects invalid values', () => {
    expect(validateTableNumber(0)).toContain('must be a positive integer')
    expect(validateTableNumber(-1)).toContain('must be a positive integer')
    expect(validateTableNumber(101)).toContain('out of range')
  })
})

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true)
  })

  it('accepts empty string', () => {
    expect(validateEmail('')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false)
  })
})

describe('validatePhone', () => {
  it('accepts valid phone numbers', () => {
    expect(validatePhone('+63 917 123 4567')).toBe(true)
    expect(validatePhone('0917-123-4567')).toBe(true)
  })

  it('accepts empty string', () => {
    expect(validatePhone('')).toBe(true)
  })

  it('rejects invalid phone numbers', () => {
    expect(validatePhone('abc-def-ghij')).toBe(false)
  })
})
