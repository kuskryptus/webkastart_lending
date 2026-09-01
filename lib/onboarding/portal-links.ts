import 'server-only'

import { randomBytes } from 'node:crypto'
import { getDatabase, hashOnboardingToken } from './db'
import { decryptPortalToken, encryptPortalToken } from './portal-token'

export async function getRecoverablePortalToken(clientId: string) {
  const sql = getDatabase()
  const rows = await sql<{ encryptedToken: string }[]>`
    select encrypted_token as "encryptedToken"
    from client_portal_links
    where client_id = ${clientId} and encrypted_token is not null
    order by created_at desc
    limit 1
  `
  const encryptedToken = rows[0]?.encryptedToken
  return encryptedToken ? decryptPortalToken(encryptedToken) : null
}

export async function createAdditionalPortalToken(clientId: string) {
  const sql = getDatabase()
  const token = randomBytes(32).toString('base64url')
  const encryptedToken = encryptPortalToken(token)
  if (!encryptedToken) throw new Error('Portal link encryption is not configured')
  const rows = await sql<{ id: string }[]>`
    insert into client_portal_links (client_id, token_hash, encrypted_token)
    select id, ${hashOnboardingToken(token)}, ${encryptedToken}
    from clients where id = ${clientId}
    returning id
  `
  if (!rows[0]) return null
  return token
}
