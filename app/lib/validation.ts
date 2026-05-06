const MAX_FIELD_LENGTH = 500
const MAX_NAME_LENGTH = 100
const MAX_NOTES_LENGTH = 1000

export function sanitizeString(input: string, maxLength = MAX_FIELD_LENGTH): string {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim().slice(0, maxLength)
  return trimmed.replace(/[<>]/g, '').replace(/<\/?/g, '')
}

export function sanitizeCurrency(input: string): string {
  if (typeof input !== 'string') return '₱0.00'
  const cleaned = input.replace(/[^\d.]/g, '')
  const num = parseFloat(cleaned)
  if (isNaN(num) || num < 0 || input.includes('-')) return '₱0.00'
  return `₱${num.toFixed(2)}`
}

export function validateRequired(fields: Record<string, unknown>, required: string[]): string | null {
  for (const field of required) {
    if (!fields[field] || (typeof fields[field] === 'string' && !(fields[field] as string).trim())) {
      return `${field} is required`
    }
  }
  return null
}

export function validateRowIndex(rowIndex: unknown): string | null {
  if (rowIndex === undefined || rowIndex === null) return 'rowIndex is required'
  if (typeof rowIndex !== 'number') return 'rowIndex must be a number'
  if (rowIndex < 0 || !Number.isInteger(rowIndex)) {
    return 'rowIndex must be a non-negative integer'
  }
  if (rowIndex > 10000) return 'rowIndex out of range'
  return null
}

export function validateRowNumber(rowNumber: unknown): string | null {
  if (rowNumber === undefined || rowNumber === null) return 'rowNumber is required'
  if (typeof rowNumber !== 'number' || rowNumber < 1 || !Number.isInteger(rowNumber)) {
    return 'rowNumber must be a positive integer'
  }
  if (rowNumber > 10000) return 'rowNumber out of range'
  return null
}

export function validateTableNumber(tableNumber: unknown): string | null {
  if (tableNumber === undefined || tableNumber === null) return 'tableNumber is required'
  if (typeof tableNumber !== 'number' || tableNumber < 1 || !Number.isInteger(tableNumber)) {
    return 'tableNumber must be a positive integer'
  }
  if (tableNumber > 100) return 'tableNumber out of range'
  return null
}

export function validateEmail(email: string): boolean {
  if (!email) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length <= 15
}
