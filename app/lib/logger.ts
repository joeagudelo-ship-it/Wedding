type LogLevel = 'info' | 'warn' | 'error'

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString()
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`
  if (data) {
    try {
      return `${base} ${JSON.stringify(data)}`
    } catch {
      return `${base} [data unavailable]`
    }
  }
  return base
}

export function logInfo(message: string, data?: unknown): void {
  console.log(formatLog('info', message, data))
}

export function logWarn(message: string, data?: unknown): void {
  console.warn(formatLog('warn', message, data))
}

export function logError(message: string, error?: unknown): void {
  const errorDetails = error instanceof Error
    ? { message: error.message, stack: error.stack }
    : error
  console.error(formatLog('error', message, errorDetails))
}

export function safeJsonParse(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return null
    }
    return parsed as Record<string, unknown>
  } catch (e) {
    logError('Failed to parse JSON', e)
    return null
  }
}
