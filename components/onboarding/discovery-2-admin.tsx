'use client'

import { useState } from 'react'
import { Check, Copy, Link2, Loader2, RefreshCw } from 'lucide-react'

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null
  return data?.error || 'Link sa nepodarilo vytvoriť.'
}

export function Discovery2Admin({ clientId, exists }: { clientId: string; exists: boolean }) {
  const [hasForm, setHasForm] = useState(exists)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  async function createLink() {
    if (hasForm && !window.confirm('Nový link zneplatní predchádzajúci link. Uložené odpovede zostanú zachované. Pokračovať?')) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/onboarding/admin/clients/${clientId}/discovery-2`, { method: 'POST' })
      if (!response.ok) throw new Error(await responseError(response))
      const data = await response.json() as { url: string }
      setUrl(data.url)
      setHasForm(true)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Link sa nepodarilo vytvoriť.')
    } finally {
      setLoading(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Link označte a skopírujte ručne.')
    }
  }

  return (
    <div>
      <button type="button" onClick={() => void createLink()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {loading ? <Loader2 className="size-4 animate-spin" /> : hasForm ? <RefreshCw className="size-4" /> : <Link2 className="size-4" />}
        {hasForm ? 'Vygenerovať nový link' : 'Vytvoriť link Discovery 2'}
      </button>
      {hasForm && !url && <p className="mt-2 text-xs leading-5 text-muted-foreground">Odpovede sú uložené. Z bezpečnostných dôvodov sa existujúci link nezobrazuje; môžete vytvoriť nový.</p>}
      {url && (
        <div className="mt-4 border-l-2 border-brand pl-4">
          <p className="text-sm font-semibold text-brand">Link je pripravený</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input readOnly value={url} onFocus={(event) => event.currentTarget.select()} aria-label="Discovery 2 link" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            <button type="button" onClick={() => void copyLink()} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 px-2 text-sm font-semibold text-brand">
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? 'Skopírované' : 'Kopírovať'}
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Skopírujte ho teraz. Celý bezpečnostný token sa neskôr už nezobrazuje.</p>
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </div>
  )
}
