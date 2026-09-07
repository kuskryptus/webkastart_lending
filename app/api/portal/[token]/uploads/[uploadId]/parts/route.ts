import { createPartUrlsForPendingAsset } from '@/lib/onboarding/assets'
import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { authorizePortalRequest } from '@/lib/onboarding/portal-auth'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
type Context = { params: Promise<{ token: string; uploadId: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token, uploadId } = await params
    const auth = await authorizePortalRequest(request, token, 'portal-upload-parts', 180)
    if ('response' in auth) return auth.response
    const permission = await getWorkspaceSection(auth.client.id, 'files')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Nahrávanie súborov nie je povolené.' }, { status: 403 })
    }
    const payload = await readSmallJson(request, 5_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await createPartUrlsForPendingAsset({
      actor: 'client',
      assetId: uploadId,
      clientId: auth.client.id,
      partNumbers: body.partNumbers,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: result.status })
      : privateJson(result)
  } catch (error) {
    return apiError(error)
  }
}
