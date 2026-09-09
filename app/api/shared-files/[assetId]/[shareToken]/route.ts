import { findSharedAsset } from '@/lib/onboarding/asset-share'
import { checkRateLimit } from '@/lib/onboarding/db'
import { apiError, getClientIp, privateJson, privateRedirect } from '@/lib/onboarding/http'
import { createDownloadUrl } from '@/lib/onboarding/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ assetId: string; shareToken: string }> }

export async function GET(request: Request, { params }: Context) {
  try {
    const { assetId, shareToken } = await params
    const asset = await findSharedAsset(assetId, shareToken)
    if (!asset) return privateJson({ error: 'Súbor sa nenašiel.' }, { status: 404 })

    const allowed = await checkRateLimit({
      action: 'shared-file-read',
      identity: `${assetId}:${getClientIp(request)}`,
      limit: 240,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })

    const download = new URL(request.url).searchParams.get('download') === '1'
    const url = await createDownloadUrl(asset.objectKey, asset.name, download ? 'attachment' : 'inline')
    return privateRedirect(url)
  } catch (error) {
    return apiError(error)
  }
}
