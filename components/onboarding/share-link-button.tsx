'use client'

import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'
import type { OnboardingAsset } from '@/lib/onboarding/types'

export function sharedAssetPath(asset: OnboardingAsset) {
  return asset.shareToken ? `/subor/${asset.id}/${asset.shareToken}` : null
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return
  } catch {
    const input = document.createElement('textarea')
    input.value = value
    input.setAttribute('readonly', '')
    input.style.position = 'fixed'
    input.style.opacity = '0.01'
    document.body.appendChild(input)
    input.select()
    const copied = document.execCommand('copy')
    input.remove()
    if (!copied) throw new Error('COPY_FAILED')
  }
}

export function ShareLinkButton({ asset }: { asset: OnboardingAsset }) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')
  const path = sharedAssetPath(asset)
  if (!path || asset.clientVisible !== true || !asset.mimeType.startsWith('image/')) return null

  async function copyLink() {
    try {
      await copyText(new URL(path!, window.location.origin).toString())
      setState('copied')
      window.setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('error')
      window.setTimeout(() => setState('idle'), 3000)
    }
  }

  const label = state === 'copied'
    ? 'Link je skopírovaný'
    : state === 'error'
      ? 'Link sa nepodarilo skopírovať'
      : 'Kopírovať link na náhľad'
  return (
    <button
      type="button"
      onClick={() => void copyLink()}
      className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${state === 'error' ? 'text-destructive' : 'text-muted-foreground hover:text-brand'}`}
      aria-label={label}
      title={label}
    >
      {state === 'copied' ? <Check className="size-4 text-emerald-600" /> : <Link2 className="size-4" />}
      <span className="sr-only" aria-live="polite">{state === 'idle' ? '' : label}</span>
    </button>
  )
}
