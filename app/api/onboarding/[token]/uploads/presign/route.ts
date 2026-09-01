import { randomUUID } from 'node:crypto'
import { checkRateLimit, findOnboardingByToken, getDatabase } from '@/lib/onboarding/db'
import { apiError, getClientIp, isValidToken, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { createUploadUrl } from '@/lib/onboarding/storage'
import { MAX_UPLOAD_FILES, safeStorageFileName, validateUpload } from '@/lib/onboarding/validation'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'

type Context = { params: Promise<{ token: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token } = await params
    if (!isValidToken(token)) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })

    const project = await findOnboardingByToken(token)
    if (!project) return privateJson({ error: 'Tento odkaz nie je platný.' }, { status: 404 })
    const permission = await getWorkspaceSection(project.clientId, 'files')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Nahrávanie súborov nie je povolené.' }, { status: 403 })
    }

    const allowed = await checkRateLimit({
      action: 'upload',
      identity: `${project.tokenHash}:${getClientIp(request)}`,
      limit: 120,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa uploadov. Skúste to o chvíľu.' }, { status: 429 })

    let payload: unknown
    try {
      payload = await readSmallJson(request, 10_000)
    } catch {
      return privateJson({ error: 'Neplatná požiadavka.' }, { status: 400 })
    }
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const validation = validateUpload(body.name, body.mimeType, body.size)
    if ('error' in validation) return privateJson({ error: validation.error }, { status: 422 })

    const sql = getDatabase()
    const retryUploadId = typeof body.retryUploadId === 'string' ? body.retryUploadId : ''
    let upload: { id: string; objectKey: string } | undefined

    if (retryUploadId) {
      const rows = await sql<{ id: string; objectKey: string }[]>`
        select id, storage_key as "objectKey"
        from onboarding_assets
        where id = ${retryUploadId} and client_id = ${project.clientId} and status = 'pending'
          and uploaded_by = 'client'
          and original_filename = ${String(body.name)} and mime_type = ${String(body.mimeType)}
          and size = ${Number(body.size)}
        limit 1
      `
      upload = rows[0]
    }

    if (!upload) {
      const rows = await sql.begin(async (transaction) => {
        await transaction`select id from clients where id = ${project.clientId} for update`
        const countRows = await transaction<{ count: number }[]>`
          select count(*)::int as count from onboarding_assets where client_id = ${project.clientId}
        `
        if ((countRows[0]?.count ?? MAX_UPLOAD_FILES) >= MAX_UPLOAD_FILES) return []

        const fileName = safeStorageFileName(String(body.name), validation.extension)
        const objectKey = `clients/${project.clientId}/uploads/${randomUUID()}-${fileName}`
        return transaction<{ id: string; objectKey: string }[]>`
          insert into onboarding_assets (project_id, client_id, storage_key, original_filename, mime_type, size, uploaded_by, client_visible)
          values (${project.id}, ${project.clientId}, ${objectKey}, ${String(body.name)}, ${String(body.mimeType)}, ${Number(body.size)}, 'client', true)
          returning id, storage_key as "objectKey"
        `
      }) as { id: string; objectKey: string }[]
      if (!rows.length) {
        return privateJson({ error: `Môžete nahrať najviac ${MAX_UPLOAD_FILES} súborov.` }, { status: 422 })
      }
      upload = rows[0]
    }

    if (!upload) throw new Error('Could not create upload')
    const uploadUrl = await createUploadUrl({
      key: upload.objectKey,
      mimeType: String(body.mimeType),
      size: Number(body.size),
    })

    return privateJson({ expiresIn: 600, uploadId: upload.id, uploadUrl })
  } catch (error) {
    return apiError(error)
  }
}
