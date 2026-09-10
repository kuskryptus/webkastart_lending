import {
  createSharedImageComment,
  findSharedAsset,
  listSharedImageComments,
} from '@/lib/onboarding/asset-share'
import { checkRateLimit } from '@/lib/onboarding/db'
import { apiError, getClientIp, privateJson, readSmallJson } from '@/lib/onboarding/http'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ assetId: string; shareToken: string }> }

function serializeComment(comment: Awaited<ReturnType<typeof createSharedImageComment>>) {
  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
  }
}

async function getImage(assetId: string, shareToken: string) {
  const asset = await findSharedAsset(assetId, shareToken)
  return asset?.mimeType.startsWith('image/') ? asset : null
}

export async function GET(request: Request, { params }: Context) {
  try {
    const { assetId, shareToken } = await params
    const asset = await getImage(assetId, shareToken)
    if (!asset) return privateJson({ error: 'Obrázok sa nenašiel.' }, { status: 404 })

    const allowed = await checkRateLimit({
      action: 'shared-image-comments-read',
      identity: `${assetId}:${getClientIp(request)}`,
      limit: 120,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa požiadaviek.' }, { status: 429 })

    const comments = await listSharedImageComments(asset.id)
    return privateJson({ comments: comments.map(serializeComment) })
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const { assetId, shareToken } = await params
    const asset = await getImage(assetId, shareToken)
    if (!asset) return privateJson({ error: 'Obrázok sa nenašiel.' }, { status: 404 })

    const allowed = await checkRateLimit({
      action: 'shared-image-comment-write',
      identity: `${assetId}:${getClientIp(request)}`,
      limit: 20,
    })
    if (!allowed) return privateJson({ error: 'Príliš veľa komentárov. Skúste to o chvíľu.' }, { status: 429 })

    const input = await readSmallJson(request, 10_000)
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return privateJson({ error: 'Komentár nemá správny formát.' }, { status: 400 })
    }

    const record = input as Record<string, unknown>
    const authorName = typeof record.authorName === 'string' ? record.authorName.trim() : ''
    const body = typeof record.body === 'string' ? record.body.trim() : ''
    const positionX = typeof record.positionX === 'number' ? record.positionX : Number.NaN
    const positionY = typeof record.positionY === 'number' ? record.positionY : Number.NaN

    if (
      authorName.length > 80
      || body.length < 1
      || body.length > 2000
      || !Number.isFinite(positionX)
      || !Number.isFinite(positionY)
      || positionX < 0
      || positionX > 1
      || positionY < 0
      || positionY > 1
    ) {
      return privateJson({ error: 'Skontrolujte text komentára a označené miesto.' }, { status: 400 })
    }

    const comment = await createSharedImageComment({
      assetId: asset.id,
      authorName,
      body,
      positionX,
      positionY,
    })
    return privateJson({ comment: serializeComment(comment) }, { status: 201 })
  } catch (error) {
    if (error instanceof SyntaxError) {
      return privateJson({ error: 'Komentár nemá správny formát.' }, { status: 400 })
    }
    if (error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE') {
      return privateJson({ error: 'Komentár je príliš dlhý.' }, { status: 413 })
    }
    return apiError(error)
  }
}
