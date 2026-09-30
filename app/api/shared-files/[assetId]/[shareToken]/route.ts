import { findSharedAsset } from '@/lib/onboarding/asset-share'
import { checkRateLimit } from '@/lib/onboarding/db'
import { apiError, getClientIp, privateJson, privateRedirect } from '@/lib/onboarding/http'
import { createAssetReadUrl } from '@/lib/onboarding/storage'

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

    const searchParams = new URL(request.url).searchParams
    const download = searchParams.get('download') === '1'
    const preview = !download && searchParams.get('preview') === '1' && asset.mimeType.startsWith('image/')
    const url = await createAssetReadUrl({
      disposition: download ? 'attachment' : 'inline',
      key: asset.objectKey,
      mimeType: asset.mimeType,
      originalName: asset.name,
      preview,
    })
    return privateRedirect(url)
  } catch (error) {
    return apiError(error)
  }
}
