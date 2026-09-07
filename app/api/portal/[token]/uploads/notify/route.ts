import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'
import { authorizePortalRequest } from '@/lib/onboarding/portal-auth'
import { sendUploadNotification } from '@/lib/onboarding/upload-notification'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
type Context = { params: Promise<{ token: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token } = await params
    const auth = await authorizePortalRequest(request, token, 'portal-upload-notify', 30)
    if ('response' in auth) return auth.response
    const permission = await getWorkspaceSection(auth.client.id, 'files')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Nahrávanie súborov nie je povolené.' }, { status: 403 })
    }
    const payload = await readSmallJson(request, 10_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await sendUploadNotification({
      assetIds: body.assetIds,
      clientId: auth.client.id,
      requestOrigin: new URL(request.url).origin,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: result.status })
      : privateJson(result)
  } catch (error) {
    return apiError(error)
  }
}
