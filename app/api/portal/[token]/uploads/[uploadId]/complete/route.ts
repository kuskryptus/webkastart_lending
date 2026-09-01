import { completePendingAsset } from '@/lib/onboarding/assets'
import { apiError, privateJson } from '@/lib/onboarding/http'
import { authorizePortalRequest } from '@/lib/onboarding/portal-auth'
import { getWorkspaceSection } from '@/lib/onboarding/workspace'

export const runtime = 'nodejs'
type Context = { params: Promise<{ token: string; uploadId: string }> }

export async function POST(request: Request, { params }: Context) {
  try {
    const { token, uploadId } = await params
    const auth = await authorizePortalRequest(request, token, 'portal-upload-complete', 120)
    if ('response' in auth) return auth.response
    const permission = await getWorkspaceSection(auth.client.id, 'files')
    if (!permission?.clientVisible || !permission.clientEditable) {
      return privateJson({ error: 'Nahrávanie súborov nie je povolené.' }, { status: 403 })
    }
    const result = await completePendingAsset(auth.client.id, uploadId, 'client')
    return 'error' in result
      ? privateJson({ error: result.error }, { status: result.status })
      : privateJson(result)
  } catch (error) {
    return apiError(error)
  }
}
