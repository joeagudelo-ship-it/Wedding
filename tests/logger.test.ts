import { describe, it, expect, vi } from 'vitest'
import { logInfo, logWarn, logError, safeJsonParse } from '../app/lib/logger'

describe('logger', () => {
  it('logInfo calls console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    logInfo('test message')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('logWarn calls console.warn', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    logWarn('test warning')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it('logError calls console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    logError('test error', new Error('fail'))
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})

describe('safeJsonParse', () => {
  it('parses valid JSON objects', () => {
    const result = safeJsonParse('{"key": "value"}')
    expect(result).toEqual({ key: 'value' })
  })

  it('returns null for invalid JSON', () => {
    expect(safeJsonParse('not json')).toBeNull()
  })

  it('returns null for arrays', () => {
    expect(safeJsonParse('[1, 2, 3]')).toBeNull()
  })

  it('returns null for null/undefined input', () => {
    expect(safeJsonParse(null)).toBeNull()
    expect(safeJsonParse('')).toBeNull()
  })
})
