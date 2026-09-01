'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import { Check, ChevronRight, Copy, Loader2, LockKeyhole, LogOut, Plus, Search, X } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import type { OnboardingStatus } from '@/lib/onboarding/types'

type Project = {
  clientLabel: string
  createdAt: string
  currentStep: number
  id: string
  lastActivityAt: string
  status: OnboardingStatus
  submittedAt: string | null
}

const statusLabel: Record<OnboardingStatus, string> = {
  not_started: 'Nezačaté',
  in_progress: 'Rozpracované',
  submitted: 'Odoslané',
}

async function getError(response: Response) {
  const data = await response.json().catch(() => null) as { details?: string; error?: string } | null
  const message = data?.error || 'Niečo sa nepodarilo.'
  return data?.details ? `${message}\n${data.details}` : message
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('sk-SK', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function searchable(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('sk')
}

export function OnboardingAdmin({
  configured,
  initialAuthenticated,
  initialError = '',
  initialProjects = [],
}: {
  configured: boolean
  initialAuthenticated: boolean
  initialError?: string
  initialProjects?: Project[]
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated)
  const [secret, setSecret] = useState('')
  const [clientLabel, setClientLabel] = useState('')
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [createdUrl, setCreatedUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(initialError)
  const [search, setSearch] = useState('')
  const filteredProjects = useMemo(() => {
    const query = searchable(search.trim())
    return query ? projects.filter((project) => searchable(project.clientLabel).includes(query)) : projects
  }, [projects, search])

  const loadProjects = useCallback(async function loadProjects() {
    try {
      const response = await fetch('/api/onboarding/admin/projects', { cache: 'no-store' })
      if (response.status === 401) {
        setAuthenticated(false)
        return
      }
      if (!response.ok) throw new Error(await getError(response))
      const data = await response.json() as { projects: Project[] }
      setProjects(data.projects)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Prehľad sa nepodarilo načítať.')
    } finally {
      setLoading(false)
    }
  }, [])

  async function login(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const response = await fetch('/api/onboarding/admin/session', {
        body: JSON.stringify({ secret }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await getError(response))
      setSecret('')
      setAuthenticated(true)
      setLoading(true)
      await loadProjects()
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Prihlásenie sa nepodarilo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function createProject(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setCreatedUrl('')
    try {
      const response = await fetch('/api/onboarding/admin/projects', {
        body: JSON.stringify({ clientLabel }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok) throw new Error(await getError(response))
      const data = await response.json() as { project: Project; url: string }
      setProjects((current) => [data.project, ...current])
      setCreatedUrl(data.url)
      setClientLabel('')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Link sa nepodarilo vytvoriť.')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(createdUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Link označte a skopírujte ručne.')
    }
  }

  async function logout() {
    await fetch('/api/onboarding/admin/session', { method: 'DELETE' })
    setAuthenticated(false)
    setProjects([])
    setCreatedUrl('')
  }

  if (!configured) {
    return (
      <main className="grid min-h-dvh place-items-center px-5">
        <div className="max-w-md text-center">
          <LogoMark className="mx-auto" />
          <h1 className="mt-8 text-2xl font-semibold tracking-[-0.035em]">Interný prístup ešte nie je nastavený</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Do prostredia webu pridajte bezpečné heslo <code className="text-sm text-foreground">ONBOARDING_ADMIN_SECRET</code>. Potom sa tu budete prihlasovať týmto heslom.</p>
        </div>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-dvh place-items-center px-5 py-12">
        <form onSubmit={login} className="w-full max-w-sm">
          <LogoMark />
          <div className="mt-10 flex items-center gap-2 text-brand"><LockKeyhole className="size-4" /><span className="text-xs font-semibold uppercase tracking-[0.16em]">Interný prístup</span></div>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.045em]">Onboarding klientov</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Prihláste sa heslom pre vytváranie osobných linkov.</p>
          <label className="mt-8 block">
            <span className="text-sm font-semibold">Heslo</span>
            <input autoFocus type="password" value={secret} onChange={(event) => setSecret(event.target.value)} className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none focus:border-brand" autoComplete="current-password" />
          </label>
          {error && <p role="alert" className="mt-4 whitespace-pre-wrap break-words text-sm text-destructive">{error}</p>}
          <button disabled={submitting || !secret} className="mt-7 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {submitting && <Loader2 className="size-4 animate-spin" />} Prihlásiť sa
          </button>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-6 sm:px-8">
        <LogoMark />
        <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><LogOut className="size-4" /> Odhlásiť</button>
      </header>
      <div className="mx-auto max-w-4xl px-5 pb-20 pt-8 sm:px-8 sm:pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Klientsky onboarding</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">Vytvoriť osobný link</h1>
        <p className="mt-3 max-w-xl leading-7 text-muted-foreground">Napíšte názov klienta alebo projektu. Bez účtu a bez ďalších nastavení vytvoríte link pripravený na odoslanie.</p>

        <form onSubmit={createProject} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-sm font-semibold">Klient alebo projekt</span>
            <input value={clientLabel} onChange={(event) => setClientLabel(event.target.value)} placeholder="Napr. Jana Nováková – nový web" maxLength={200} className="mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none placeholder:text-muted-foreground/55 focus:border-brand" />
          </label>
          <button disabled={submitting || !clientLabel.trim()} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Vytvoriť link
          </button>
        </form>
        {error && <p role="alert" className="mt-4 whitespace-pre-wrap break-words text-sm text-destructive">{error}</p>}

        {createdUrl && (
          <div className="mt-8 bg-brand-soft px-5 py-5 sm:px-6">
            <p className="text-sm font-semibold text-brand">Link je pripravený</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input readOnly value={createdUrl} aria-label="Nový osobný onboarding link" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" onFocus={(event) => event.currentTarget.select()} />
              <button type="button" onClick={() => void copyLink()} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-foreground">
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />} {copied ? 'Skopírované' : 'Kopírovať'}
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Tento link si teraz skopírujte. Z bezpečnostných dôvodov sa celý token neskôr už nezobrazuje.</p>
          </div>
        )}

        <section className="mt-16">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-[-0.025em]">Klienti</h2>
            <span className="text-sm text-muted-foreground">{filteredProjects.length}{search ? ` z ${projects.length}` : ''}</span>
          </div>
          <label className="relative mt-6 block">
            <span className="sr-only">Vyhľadať klienta</span>
            <Search className="pointer-events-none absolute left-0 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Vyhľadať klienta…" className="w-full border-0 border-b border-border bg-transparent py-3 pl-7 pr-10 text-sm outline-none placeholder:text-muted-foreground/55 focus:border-brand" />
            {search && <button type="button" onClick={() => setSearch('')} aria-label="Vymazať vyhľadávanie" className="absolute right-0 top-1/2 grid size-8 -translate-y-1/2 place-items-center text-muted-foreground hover:text-foreground"><X className="size-4" /></button>}
          </label>
          {loading ? (
            <p className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Načítavam…</p>
          ) : projects.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">Zatiaľ tu nie je žiadny klientsky onboarding.</p>
          ) : filteredProjects.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">Pre „{search}“ sa nenašiel žiadny klient.</p>
          ) : (
            <ul className="mt-5 divide-y divide-border/80">
              {filteredProjects.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/start/admin/${project.id}`}
                    aria-label={`Otvoriť onboarding: ${project.clientLabel}`}
                    className="group grid gap-2 py-4 outline-none transition-colors hover:text-brand focus-visible:text-brand sm:grid-cols-[1fr_auto_auto_1.5rem] sm:items-center sm:gap-7"
                  >
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{project.clientLabel}</p><p className="mt-1 text-xs text-muted-foreground">Vytvorené {formatDate(project.createdAt)}</p></div>
                    <p className="text-xs text-muted-foreground">{project.status === 'in_progress' ? `${project.currentStep}. krok zo 6` : `Aktivita ${formatDate(project.lastActivityAt)}`}</p>
                    <span className={`text-xs font-semibold ${project.status === 'submitted' ? 'text-emerald-700' : project.status === 'in_progress' ? 'text-brand' : 'text-muted-foreground'}`}>{statusLabel[project.status]}</span>
                    <ChevronRight className="hidden size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand sm:block" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
