import { ZipArchive, type ArchiverError } from 'archiver'
import { basename, extname } from 'node:path'
import { Readable } from 'node:stream'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { getDatabase } from '@/lib/onboarding/db'
import { apiError, privateJson } from '@/lib/onboarding/http'
import { createObjectReadStream } from '@/lib/onboarding/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ clientId: string }> }

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function safeSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'klient'
}

function uniqueEntryName(originalName: string, usedNames: Set<string>, index: number) {
  const cleaned = basename(originalName.replaceAll('\\', '/'))
    .replace(/[\u0000-\u001f\u007f]/g, '_')
    .trim()
  const safeName = cleaned && cleaned !== '.' && cleaned !== '..' ? cleaned : `asset-${index + 1}`
  const extension = extname(safeName)
  const stem = extension ? safeName.slice(0, -extension.length) : safeName
  let candidate = safeName
  let suffix = 2

  while (usedNames.has(candidate.toLocaleLowerCase('sk'))) {
    candidate = `${stem}-${suffix}${extension}`
    suffix += 1
  }
  usedNames.add(candidate.toLocaleLowerCase('sk'))
  return candidate
}

export async function GET(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })

  try {
    const { clientId } = await params
    if (!UUID_PATTERN.test(clientId)) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })

    const sql = getDatabase()
    const clients = await sql<{ clientLabel: string }[]>`
      select display_name as "clientLabel"
      from clients
      where id = ${clientId}
      limit 1
    `
    if (!clients[0]) return privateJson({ error: 'Klient sa nenašiel.' }, { status: 404 })

    const assets = await sql<{ name: string; objectKey: string }[]>`
      select original_filename as name, storage_key as "objectKey"
      from onboarding_assets
      where client_id = ${clientId}
        and status = 'uploaded'
        and asset_category = 'source'
      order by created_at asc
    `
    if (!assets.length) return privateJson({ error: 'Klient zatiaľ nemá žiadne podklady.' }, { status: 404 })

    const archive = new ZipArchive({ forceZip64: true, store: true })
    const usedNames = new Set<string>()
    assets.forEach((asset, index) => {
      archive.append(createObjectReadStream(asset.objectKey), {
        name: uniqueEntryName(asset.name, usedNames, index),
      })
    })

    archive.on('warning', (error: ArchiverError) => archive.destroy(error))
    void archive.finalize().catch((error: unknown) => {
      archive.destroy(error instanceof Error ? error : new Error(String(error)))
    })

    const fileName = `${safeSlug(clients[0].clientLabel)}-assets.zip`
    return new Response(Readable.toWeb(archive) as ReadableStream<Uint8Array>, {
      headers: {
        'Cache-Control': 'no-store, private',
        'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'Content-Type': 'application/zip',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    })
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
