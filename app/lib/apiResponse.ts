import { NextResponse } from 'next/server'
import { logError } from './logger'

export function apiError(message: string, error: unknown, status = 500): NextResponse {
  logError(message, error)
  return NextResponse.json({ error: message }, { status })
}

export function apiSuccess(data: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(data, { status })
}

export function apiBadRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 })
}

export function apiNotFound(message = 'Resource not found'): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 })
}
