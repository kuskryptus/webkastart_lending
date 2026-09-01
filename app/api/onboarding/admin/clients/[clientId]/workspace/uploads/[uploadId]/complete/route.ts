import { completePendingAsset } from '@/lib/onboarding/assets'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { apiError, privateJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
type Context = { params: Promise<{ clientId: string; uploadId: string }> }

export async function POST(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
  try {
    const { clientId, uploadId } = await params
    const result = await completePendingAsset(clientId, uploadId, 'admin')
    return 'error' in result
      ? privateJson({ error: result.error }, { status: result.status })
      : privateJson(result)
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
