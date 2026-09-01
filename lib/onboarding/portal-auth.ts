import 'server-only'

import { checkRateLimit, pruneRateLimits } from './db'
import { getClientIp, isValidToken, privateJson } from './http'
import { findClientByPortalToken } from './workspace'

export async function authorizePortalRequest(
  request: Request,
  token: string,
  action: string,
  limit = 120,
) {
  if (!isValidToken(token)) {
    return { response: privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 }) }
  }
  const client = await findClientByPortalToken(token)
  if (!client) {
    return { response: privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 }) }
  }
  const allowed = await checkRateLimit({
    action,
    identity: `${client.portalTokenHash}:${getClientIp(request)}`,
    limit,
  })
  void pruneRateLimits()
  if (!allowed) {
    return { response: privateJson({ error: 'Príliš veľa požiadaviek. Skúste to o chvíľu.' }, { status: 429 }) }
  }
  return { client }
}
