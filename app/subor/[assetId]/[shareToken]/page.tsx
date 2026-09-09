import Image from 'next/image'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Download, FileText, LockKeyhole } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { findSharedAsset } from '@/lib/onboarding/asset-share'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Náhľad súboru | WebkaStart',
  robots: { index: false, follow: false, noarchive: true },
}

const previewableImages = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2).replace('.', ',')} GB`
}

export default async function SharedFilePage({
  params,
}: {
  params: Promise<{ assetId: string; shareToken: string }>
}) {
  const { assetId, shareToken } = await params
  const asset = await findSharedAsset(assetId, shareToken)
  if (!asset) notFound()

  const contentUrl = `/api/shared-files/${assetId}/${shareToken}`
  const downloadUrl = `${contentUrl}?download=1`
  const canPreview = previewableImages.has(asset.mimeType)

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <LogoMark />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Súkromný náhľad</span>
      </header>
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:px-8 sm:pt-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Zdieľaný súbor</p>
            <h1 className="mt-3 break-words text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{asset.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{formatBytes(Number(asset.size))}</p>
          </div>
          <a href={downloadUrl} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Download className="size-4" /> Stiahnuť súbor
          </a>
        </div>

        {canPreview ? (
          <div className="relative mt-8 min-h-[55dvh] overflow-hidden rounded-2xl bg-secondary sm:mt-10">
            <Image unoptimized fill loading="eager" sizes="100vw" src={contentUrl} alt={asset.name} className="object-contain" />
          </div>
        ) : (
          <div className="mt-10 flex min-h-64 flex-col items-center justify-center gap-4 border-y border-border py-12 text-center">
            <FileText className="size-9 text-muted-foreground" />
            <p className="max-w-md text-sm leading-6 text-muted-foreground">Tento formát prehliadač nemusí vedieť zobraziť. Súbor si môžete bezpečne stiahnuť tlačidlom vyššie.</p>
          </div>
        )}
      </div>
    </main>
  )
}
