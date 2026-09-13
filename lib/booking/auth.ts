import 'server-only'

import { timingSafeEqual } from 'node:crypto'

export function isTeamGoRequest(request: Request) {
  const configuredKey = process.env.BOOKING_API_KEY
  const authorization = request.headers.get('authorization') || ''
  const providedKey = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : ''
  if (!configuredKey || configuredKey.length < 24 || !providedKey) return false

  const expected = Buffer.from(configuredKey)
  const provided = Buffer.from(providedKey)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

export function teamGoCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('origin')
  const allowed = (process.env.TEAM_GO_ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!origin || !allowed.includes(origin)) return {}
  return {
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Origin': origin,
    Vary: 'Origin',
  }
}

export function teamGoJson(request: Request, data: unknown, init?: ResponseInit) {
  const response = Response.json(data, init)
  response.headers.set('Cache-Control', 'no-store, private')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  for (const [name, value] of Object.entries(teamGoCorsHeaders(request))) {
    response.headers.set(name, value)
  }
  return response
}
