import { createPartUrlsForPendingAsset } from '@/lib/onboarding/assets'
import { isAdminRequest } from '@/lib/onboarding/admin-auth'
import { apiError, privateJson, readSmallJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
type Context = { params: Promise<{ clientId: string; uploadId: string }> }

export async function POST(request: Request, { params }: Context) {
  if (!isAdminRequest(request)) return privateJson({ error: 'Najprv sa prihláste.' }, { status: 401 })
  try {
    const { clientId, uploadId } = await params
    const payload = await readSmallJson(request, 5_000)
    const body = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {}
    const result = await createPartUrlsForPendingAsset({
      actor: 'admin',
      assetId: uploadId,
      clientId,
      partNumbers: body.partNumbers,
    })
    return 'error' in result
      ? privateJson({ error: result.error }, { status: result.status })
      : privateJson(result)
  } catch (error) {
    return apiError(error, { exposeDetails: true })
  }
}
