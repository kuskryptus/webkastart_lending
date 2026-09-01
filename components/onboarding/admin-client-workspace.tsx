'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw, Save } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { UploadField } from './upload-field'
import { CoreWorkspaceFields, DiscoveryWorkspaceFields } from './workspace-form-fields'
import type { ClientWorkspaceResponse, OnboardingAsset, WorkspaceSection, WorkspaceSectionKey } from '@/lib/onboarding/types'

const sectionTitle: Record<WorkspaceSectionKey, string> = {
  core: 'Core formulár',
  discovery_2: 'Discovery 2',
  files: 'Súbory / fotografie',
  creative_strategy: 'Creative Strategy',
  creative_directions: 'Creative Directions',
  internal_notes: 'Poznámky',
}

async function errorMessage(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null
  return data?.error || 'Zmenu sa nepodarilo uložiť.'
}

function Completion({ completed, percentage }: { completed: boolean; percentage: number }) {
  return completed
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-3.5" /> Hotovo</span>
    : <span className="text-xs font-semibold tabular-nums text-brand">{percentage} %</span>
}

function SectionSettings({ clientId, onChange, section }: {
  clientId: string
  onChange: (section: WorkspaceSection) => void
  section: WorkspaceSection
}) {
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const locked = section.key === 'internal_notes'
  const editLocked = locked || section.key === 'creative_strategy' || section.key === 'creative_directions'

  async function save() {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/onboarding/admin/clients/${clientId}/workspace`, {
        body: JSON.stringify({
          clientEditable: editLocked ? false : section.clientEditable,
          clientVisible: locked ? false : section.clientVisible,
          content: section.content,
          operation: 'settings',
          sectionKey: section.key,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      if (!response.ok) throw new Error(await errorMessage(response))
      setMessage('Uložené')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Zmenu sa nepodarilo uložiť.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 border-y border-border/70 py-4 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-wrap gap-x-6 gap-y-3">
        <label className={`inline-flex items-center gap-2 text-sm font-medium ${locked ? 'text-muted-foreground' : ''}`}>
          <input type="checkbox" disabled={locked} checked={!locked && section.clientVisible} onChange={(event) => onChange({ ...section, clientVisible: event.target.checked, clientEditable: event.target.checked ? section.clientEditable : false })} className="size-4 accent-[var(--brand)]" />
          Viditeľné pre klienta
        </label>
        <label className={`inline-flex items-center gap-2 text-sm font-medium ${editLocked || !section.clientVisible ? 'text-muted-foreground' : ''}`}>
          <input type="checkbox" disabled={editLocked || !section.clientVisible} checked={!editLocked && section.clientEditable} onChange={(event) => onChange({ ...section, clientEditable: event.target.checked })} className="size-4 accent-[var(--brand)]" />
          Klient môže editovať
        </label>
      </div>
      <div className="flex items-center gap-3"><span className="text-xs text-muted-foreground">{message}</span><button type="button" onClick={() => void save()} disabled={saving} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-xs font-semibold hover:bg-secondary/70 disabled:opacity-50">{saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Uložiť nastavenia</button></div>
    </div>
  )
}

export function AdminClientWorkspace({ clientId, initialWorkspace }: {
  clientId: string
  initialWorkspace: ClientWorkspaceResponse
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace)
  const [coreState, setCoreState] = useState('')
  const [discoveryState, setDiscoveryState] = useState('')
  const [savingCore, setSavingCore] = useState(false)
  const [savingDiscovery, setSavingDiscovery] = useState(false)

  function updateSection(section: WorkspaceSection) {
    setWorkspace((current) => ({ ...current, sections: current.sections.map((item) => item.key === section.key ? section : item) }))
  }

  async function saveForm(sectionKey: 'core' | 'discovery_2') {
    const form = sectionKey === 'core' ? workspace.core : workspace.discovery2
    if (!form) return
    const setSaving = sectionKey === 'core' ? setSavingCore : setSavingDiscovery
    const setState = sectionKey === 'core' ? setCoreState : setDiscoveryState
    setSaving(true)
    setState('')
    try {
      const response = await fetch(`/api/onboarding/admin/clients/${clientId}/workspace`, {
        body: JSON.stringify({ answers: form.answers, currentStep: form.currentStep, revision: form.revision, sectionKey }),
        headers: { 'Content-Type': 'application/json' },
        method: 'PATCH',
      })
      if (!response.ok) throw new Error(await errorMessage(response))
      const saved = await response.json() as { progress: typeof form.progress; revision: number; savedAt: string }
      setWorkspace((current) => sectionKey === 'core' && current.core
        ? { ...current, core: { ...current.core, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt } }
        : sectionKey === 'discovery_2' && current.discovery2
          ? { ...current, discovery2: { ...current.discovery2, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt } }
          : current)
      setState('Zmeny sú uložené.')
    } catch (error) {
      setState(error instanceof Error ? error.message : 'Zmenu sa nepodarilo uložiť.')
    } finally {
      setSaving(false)
    }
  }

  async function changeAssetVisibility(asset: OnboardingAsset, visible: boolean) {
    const previous = workspace.assets
    setWorkspace((current) => ({ ...current, assets: current.assets.map((item) => item.id === asset.id ? { ...item, clientVisible: visible } : item) }))
    const response = await fetch(`/api/onboarding/admin/clients/${clientId}/workspace/uploads/${asset.id}`, {
      body: JSON.stringify({ clientVisible: visible }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })
    if (!response.ok) setWorkspace((current) => ({ ...current, assets: previous }))
  }

  const uploadedAssets = workspace.assets.filter((asset) => asset.status === 'uploaded')

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8"><Link href="/start" className="inline-flex"><LogoMark /></Link><Link href="/start" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Všetci klienti</Link></header>
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Klientsky workspace</p>
        <div className="mt-3 flex items-end justify-between gap-5"><div><h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{workspace.clientLabel}</h1><p className="mt-3 text-sm text-muted-foreground">Admin pohľad nad rovnakými údajmi, ktoré klient upravuje vo svojom portáli.</p></div><button type="button" onClick={() => window.location.reload()} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><RefreshCw className="size-4" /> Obnoviť dáta</button></div>

        <nav aria-label="Sekcie klienta" className="sticky top-0 z-10 -mx-5 mt-10 overflow-x-auto border-y border-border/70 bg-background/95 px-5 backdrop-blur sm:-mx-8 sm:px-8"><div className="flex min-w-max gap-6">{workspace.sections.map((section) => <a key={section.key} href={`#${section.key}`} className="py-4 text-sm font-medium text-muted-foreground hover:text-brand">{sectionTitle[section.key]}</a>)}</div></nav>

        <section id="overview" className="scroll-mt-24 py-12 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-[-0.035em]">Prehľad</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-3"><div><dt className="text-xs font-medium text-muted-foreground">Core formulár</dt><dd className="mt-2">{workspace.core && <Completion {...workspace.core.progress} />}</dd></div><div><dt className="text-xs font-medium text-muted-foreground">Discovery 2</dt><dd className="mt-2">{workspace.discovery2 && <Completion {...workspace.discovery2.progress} />}</dd></div><div><dt className="text-xs font-medium text-muted-foreground">Súbory</dt><dd className="mt-2 text-sm font-semibold">{uploadedAssets.length} nahraných</dd></div></dl>
        </section>

        {workspace.sections.map((section) => (
          <section key={section.key} id={section.key} className="scroll-mt-24 border-t border-border py-12 sm:py-16">
            <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold tracking-[-0.035em]">{sectionTitle[section.key]}</h2>{section.key === 'core' && workspace.core && <Completion {...workspace.core.progress} />}{section.key === 'discovery_2' && workspace.discovery2 && <Completion {...workspace.discovery2.progress} />}</div>
            <div className="mt-6"><SectionSettings clientId={clientId} section={section} onChange={updateSection} /></div>
            {section.key === 'core' && workspace.core && <div className="mt-10"><CoreWorkspaceFields answers={workspace.core.answers} onChange={(answers) => setWorkspace((current) => current.core ? { ...current, core: { ...current.core, answers } } : current)} /><div className="mt-8 flex items-center justify-end gap-4"><span className={`text-xs ${coreState.includes('medzitým') ? 'text-destructive' : 'text-muted-foreground'}`}>{coreState}</span><button type="button" onClick={() => void saveForm('core')} disabled={savingCore} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{savingCore ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Uložiť Core</button></div></div>}
            {section.key === 'discovery_2' && workspace.discovery2 && <div className="mt-10"><DiscoveryWorkspaceFields answers={workspace.discovery2.answers} onChange={(answers) => setWorkspace((current) => current.discovery2 ? { ...current, discovery2: { ...current.discovery2, answers } } : current)} /><div className="mt-8 flex items-center justify-end gap-4"><span className="text-xs text-muted-foreground">{discoveryState}</span><button type="button" onClick={() => void saveForm('discovery_2')} disabled={savingDiscovery} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{savingDiscovery ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Uložiť Discovery 2</button></div></div>}
            {section.key === 'files' && <div className="mt-10"><UploadField apiBasePath={`/api/onboarding/admin/clients/${clientId}/workspace/uploads`} assets={workspace.assets} getAssetUrl={(asset) => `/api/onboarding/admin/clients/${clientId}/workspace/uploads/${asset.id}`} newAssetMetadata={{ clientVisible: false, uploadedBy: 'admin' }} onAssetsChange={(assets) => setWorkspace((current) => ({ ...current, assets }))} onClientVisibilityChange={(asset, visible) => void changeAssetVisibility(asset, visible)} showAdminMetadata /></div>}
            {(section.key === 'creative_strategy' || section.key === 'creative_directions' || section.key === 'internal_notes') && <label className="mt-9 block"><span className="text-sm font-semibold">Obsah sekcie</span><textarea value={section.content} onChange={(event) => updateSection({ ...section, content: event.target.value })} className="mt-3 min-h-52 w-full resize-y border-0 border-b border-border bg-transparent px-0 py-4 text-sm leading-7 outline-none focus:border-brand" placeholder={section.key === 'internal_notes' ? 'Interné poznámky — klient ich nikdy neuvidí.' : 'Pridajte obsah, ktorý bude možné podľa visibility zdieľať s klientom.'} /></label>}
          </section>
        ))}
      </div>
    </main>
  )
}
