'use client'

import Image from 'next/image'
import { Check, ImageIcon } from 'lucide-react'
import type { OnboardingAsset } from '@/lib/onboarding/types'
import { MAX_REPRESENTATIVE_PHOTOS } from '@/lib/onboarding/validation'

export function RepresentativePhotoPicker({
  assets,
  getAssetUrl,
  onChange,
  selected,
}: {
  assets: OnboardingAsset[]
  getAssetUrl: (asset: OnboardingAsset) => string
  onChange: (ids: string[]) => void
  selected: string[]
}) {
  const photos = assets.filter((asset) => asset.status === 'uploaded' && asset.mimeType.startsWith('image/'))

  function toggle(id: string) {
    if (selected.includes(id)) {
      onChange(selected.filter((selectedId) => selectedId !== id))
      return
    }
    if (selected.length < MAX_REPRESENTATIVE_PHOTOS) onChange([...selected, id])
  }

  return (
    <div className="sm:col-span-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-muted-foreground">Ktorých 5 fotografií podľa vás najlepšie reprezentuje vašu značku?</p>
        <span className="text-xs tabular-nums text-muted-foreground">{selected.length} / {MAX_REPRESENTATIVE_PHOTOS}</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Vyberte najviac päť už nahraných fotografií.</p>
      {photos.length ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((asset) => {
            const active = selected.includes(asset.id)
            const limitReached = !active && selected.length >= MAX_REPRESENTATIVE_PHOTOS
            return (
              <button
                key={asset.id}
                type="button"
                aria-pressed={active}
                aria-label={`${active ? 'Zrušiť výber' : 'Vybrať'} fotografie ${asset.name}`}
                disabled={limitReached}
                onClick={() => toggle(asset.id)}
                className="group text-left disabled:cursor-not-allowed disabled:opacity-45"
              >
                <span className={`relative block aspect-[4/3] overflow-hidden rounded-xl bg-secondary ring-offset-2 transition-shadow ${active ? 'ring-2 ring-brand' : 'group-hover:ring-1 group-hover:ring-brand/50'} group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-brand`}>
                  <Image unoptimized fill sizes="(min-width: 640px) 33vw, 50vw" src={`${getAssetUrl(asset)}?preview=1`} alt="" className="object-cover" />
                  <span className={`absolute right-2 top-2 grid size-6 place-items-center rounded-full border text-white shadow-sm ${active ? 'border-brand bg-brand' : 'border-white/80 bg-black/25'}`}>
                    {active && <Check className="size-4" aria-hidden="true" />}
                  </span>
                </span>
                <span className="mt-2 block truncate text-xs font-medium">{asset.name}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><ImageIcon className="size-4" aria-hidden="true" />Najprv nahrajte fotografie v sekcii súborov.</p>
      )}
    </div>
  )
}
