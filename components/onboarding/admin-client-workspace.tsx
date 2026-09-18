'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Check, CheckCircle2, Cloud, CloudOff, Copy, Download, Loader2, RefreshCw } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { AdminPrefillSection } from './admin-prefill-section'
import { UploadField } from './upload-field'
import { CoreWorkspaceFields, DiscoveryWorkspaceFields } from './workspace-form-fields'
import { stringifyAiClientBrief } from '@/lib/onboarding/ai-export'
import type { ClientWorkspaceResponse, OnboardingAnswers, OnboardingAsset, PrefillFieldKey, WorkspaceProgress, WorkspaceSection, WorkspaceSectionKey } from '@/lib/onboarding/types'

const sectionTitle: Record<WorkspaceSectionKey, string> = {
  core: 'Základný formulár',
  discovery_2: 'Doplňujúce otázky',
  files: 'Podklady od klienta',
  deliverables: 'Súbory pre klienta',
  creative_strategy: 'Kreatívna stratégia',
  creative_directions: 'Kreatívne smery',
  internal_notes: 'Poznámky',
}

async function errorMessage(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null
  return data?.error || 'Zmenu sa nepodarilo uložiť.'
}

function AutosaveIndicator({ message }: { message: string }) {
  if (!message) return null
  const failed = message !== 'Ukladám…' && message !== 'Uložené'
  return (
    <span aria-live="polite" className={`inline-flex items-center gap-1.5 text-xs ${failed ? 'text-destructive' : 'text-muted-foreground'}`}>
      {message === 'Ukladám…' ? <Loader2 className="size-3.5 animate-spin" /> : failed ? <CloudOff className="size-3.5" /> : <Cloud className="size-3.5" />}
      {message}
    </span>
  )
}

function Completion({ completed, percentage }: { completed: boolean; percentage: number }) {
  return completed
    ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-3.5" /> Hotovo</span>
    : <span className="text-xs font-semibold tabular-nums text-brand">{percentage} %</span>
}

function SectionSettings({ message, onChange, section }: {
  message: string
  onChange: (section: WorkspaceSection) => void
  section: WorkspaceSection
}) {
  const locked = section.key === 'internal_notes'
  const editLocked = locked || section.key === 'deliverables' || section.key === 'creative_strategy' || section.key === 'creative_directions'

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
      <AutosaveIndicator message={message} />
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
  const [coreConflict, setCoreConflict] = useState(false)
  const [discoveryConflict, setDiscoveryConflict] = useState(false)
  const [coreChange, setCoreChange] = useState(0)
  const [discoveryChange, setDiscoveryChange] = useState(0)
  const [sectionStates, setSectionStates] = useState<Partial<Record<WorkspaceSectionKey, string>>>({})
  const [aiExportState, setAiExportState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [aiExportPreview, setAiExportPreview] = useState('')
  const aiExportRef = useRef<HTMLTextAreaElement>(null)
  const coreRevisionRef = useRef(initialWorkspace.core?.revision ?? 1)
  const discoveryRevisionRef = useRef(initialWorkspace.discovery2?.revision ?? 1)
  const coreMetadataRef = useRef(initialWorkspace.core?.answers.fieldMetadata ?? {})
  const pendingPrefillFieldsRef = useRef<Map<PrefillFieldKey, number>>(new Map())
  const coreQueueRef = useRef<Promise<void>>(Promise.resolve())
  const discoveryQueueRef = useRef<Promise<void>>(Promise.resolve())
  const coreSequenceRef = useRef(0)
  const discoverySequenceRef = useRef(0)
  const coreConflictRef = useRef(false)
  const discoveryConflictRef = useRef(false)
  const sectionQueueRef = useRef<Promise<void>>(Promise.resolve())
  const sectionTimeoutsRef = useRef<Partial<Record<WorkspaceSectionKey, number>>>({})
  const sectionSequencesRef = useRef<Partial<Record<WorkspaceSectionKey, number>>>({})

  const coreAnswers = workspace.core?.answers
  const coreCurrentStep = workspace.core?.currentStep
  const discoveryAnswers = workspace.discovery2?.answers
  const discoveryCurrentStep = workspace.discovery2?.currentStep

  useEffect(() => {
    if (!aiExportPreview) return
    aiExportRef.current?.focus({ preventScroll: true })
    aiExportRef.current?.select()
  }, [aiExportPreview])

  useEffect(() => {
    if (!coreChange || !coreAnswers || !coreCurrentStep || coreConflict) return
    const answers = coreAnswers
    const currentStep = coreCurrentStep
    const timeout = window.setTimeout(() => {
      const prefillFields = [...pendingPrefillFieldsRef.current.keys()]
      const sequence = coreSequenceRef.current
      setCoreState('Ukladám…')
      coreQueueRef.current = coreQueueRef.current.then(async () => {
        if (coreConflictRef.current) return
        const requestAnswers = { ...answers, fieldMetadata: coreMetadataRef.current }
        const response = await fetch(`/api/onboarding/admin/clients/${clientId}/workspace`, {
          body: JSON.stringify({
            answers: requestAnswers,
            currentStep,
            operation: prefillFields.length ? 'prefill' : undefined,
            prefillFields,
            revision: coreRevisionRef.current,
            sectionKey: 'core',
          }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) {
          const message = await errorMessage(response)
          if (response.status === 409) {
            coreConflictRef.current = true
            setCoreConflict(true)
          }
          if (sequence === coreSequenceRef.current) setCoreState(message)
          throw new Error(message)
        }
        const saved = await response.json() as { answers: OnboardingAnswers; progress: WorkspaceProgress; revision: number; savedAt: string }
        coreRevisionRef.current = saved.revision
        coreMetadataRef.current = saved.answers.fieldMetadata
        for (const field of prefillFields) {
          const changedAt = pendingPrefillFieldsRef.current.get(field)
          if (changedAt !== undefined && changedAt <= sequence) pendingPrefillFieldsRef.current.delete(field)
        }
        setWorkspace((current) => current.core ? {
          ...current,
          core: { ...current.core, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt },
        } : current)
        if (sequence === coreSequenceRef.current) setCoreState('Uložené')
      }).catch(() => undefined)
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [clientId, coreAnswers, coreChange, coreConflict, coreCurrentStep])

  useEffect(() => {
    if (!discoveryChange || !discoveryAnswers || !discoveryCurrentStep || discoveryConflict) return
    const answers = discoveryAnswers
    const currentStep = discoveryCurrentStep
    const timeout = window.setTimeout(() => {
      const sequence = discoverySequenceRef.current
      setDiscoveryState('Ukladám…')
      discoveryQueueRef.current = discoveryQueueRef.current.then(async () => {
        if (discoveryConflictRef.current) return
        const response = await fetch(`/api/onboarding/admin/clients/${clientId}/workspace`, {
          body: JSON.stringify({ answers, currentStep, revision: discoveryRevisionRef.current, sectionKey: 'discovery_2' }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) {
          const message = await errorMessage(response)
          if (response.status === 409) {
            discoveryConflictRef.current = true
            setDiscoveryConflict(true)
          }
          if (sequence === discoverySequenceRef.current) setDiscoveryState(message)
          throw new Error(message)
        }
        const saved = await response.json() as { progress: WorkspaceProgress; revision: number; savedAt: string }
        discoveryRevisionRef.current = saved.revision
        setWorkspace((current) => current.discovery2 ? {
          ...current,
          discovery2: { ...current.discovery2, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt },
        } : current)
        if (sequence === discoverySequenceRef.current) setDiscoveryState('Uložené')
      }).catch(() => undefined)
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [clientId, discoveryAnswers, discoveryChange, discoveryConflict, discoveryCurrentStep])

  useEffect(() => () => {
    for (const timeout of Object.values(sectionTimeoutsRef.current)) {
      if (timeout !== undefined) window.clearTimeout(timeout)
    }
  }, [])

  useEffect(() => {
    const retry = () => {
      if (coreChange && coreState && coreState !== 'Ukladám…' && coreState !== 'Uložené' && !coreConflict) {
        coreSequenceRef.current += 1
        setCoreState('Ukladám…')
        setCoreChange((value) => value + 1)
      }
      if (discoveryChange && discoveryState && discoveryState !== 'Ukladám…' && discoveryState !== 'Uložené' && !discoveryConflict) {
        discoverySequenceRef.current += 1
        setDiscoveryState('Ukladám…')
        setDiscoveryChange((value) => value + 1)
      }
    }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [coreChange, coreConflict, coreState, discoveryChange, discoveryConflict, discoveryState])

  function aiJson() {
    return stringifyAiClientBrief(workspace)
  }

  function showAiCopied() {
    setAiExportState('copied')
    window.setTimeout(() => setAiExportState((current) => current === 'copied' ? 'idle' : current), 2500)
  }

  async function copyForAi() {
    const json = aiJson()
    setAiExportPreview('')
    try {
      await navigator.clipboard.writeText(json)
      showAiCopied()
    } catch {
      const input = document.createElement('textarea')
      input.value = json
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.opacity = '0.01'
      document.body.appendChild(input)
      input.focus({ preventScroll: true })
      input.select()
      const copied = document.execCommand('copy')
      input.remove()
      if (copied) {
        showAiCopied()
      } else {
        setAiExportState('error')
        setAiExportPreview(json)
      }
    }
  }

  function downloadAiJson() {
    const blobUrl = URL.createObjectURL(new Blob([aiJson()], { type: 'application/json;charset=utf-8' }))
    const link = document.createElement('a')
    const safeName = workspace.clientLabel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'klient'
    link.href = blobUrl
    link.download = `${safeName}-podklady-pre-ai.json`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 0)
  }

  function updateSection(section: WorkspaceSection) {
    setWorkspace((current) => ({ ...current, sections: current.sections.map((item) => item.key === section.key ? section : item) }))
    setSectionStates((current) => ({ ...current, [section.key]: 'Ukladám…' }))
    const previousTimeout = sectionTimeoutsRef.current[section.key]
    if (previousTimeout !== undefined) window.clearTimeout(previousTimeout)
    const sequence = (sectionSequencesRef.current[section.key] ?? 0) + 1
    sectionSequencesRef.current[section.key] = sequence
    sectionTimeoutsRef.current[section.key] = window.setTimeout(() => {
      sectionQueueRef.current = sectionQueueRef.current.then(async () => {
        const locked = section.key === 'internal_notes'
        const editLocked = locked || section.key === 'deliverables' || section.key === 'creative_strategy' || section.key === 'creative_directions'
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
        if (!response.ok) {
          const message = await errorMessage(response)
          if (sequence === sectionSequencesRef.current[section.key]) {
            setSectionStates((current) => ({ ...current, [section.key]: message }))
          }
          throw new Error(message)
        }
        if (sequence === sectionSequencesRef.current[section.key]) {
          setSectionStates((current) => ({ ...current, [section.key]: 'Uložené' }))
        }
      }).catch(() => undefined)
    }, 600)
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

  function replaceCategoryAssets(category: 'source' | 'deliverable', assets: OnboardingAsset[]) {
    setWorkspace((current) => ({
      ...current,
      assets: [
        ...current.assets.filter((asset) => (asset.category || 'source') !== category),
        ...assets,
      ],
    }))
  }

  const uploadedAssets = workspace.assets.filter((asset) => asset.status === 'uploaded')
  const sourceAssets = uploadedAssets.filter((asset) => (asset.category || 'source') === 'source')
  const deliverableAssets = uploadedAssets.filter((asset) => asset.category === 'deliverable')

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8"><Link href="/start" className="inline-flex"><LogoMark /></Link><Link href="/start" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Všetci klienti</Link></header>
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Klientsky priestor</p>
        <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{workspace.clientLabel}</h1><p className="mt-3 text-sm text-muted-foreground">Pohľad správcu na rovnaké údaje, ktoré klient upravuje vo svojom portáli. Všetky zmeny sa ukladajú automaticky.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void copyForAi()} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-brand px-3 text-xs font-semibold text-white hover:bg-brand/90">
              {aiExportState === 'copied' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {aiExportState === 'copied' ? 'Skopírované pre AI' : 'Kopírovať pre AI'}
            </button>
            <button type="button" onClick={downloadAiJson} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-secondary px-3 text-xs font-semibold text-foreground hover:bg-secondary/70"><Download className="size-3.5" /> Stiahnuť JSON</button>
            <button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-9 items-center gap-2 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"><RefreshCw className="size-3.5" /> Obnoviť dáta</button>
          </div>
        </div>
        {aiExportState === 'error' && aiExportPreview && (
          <div className="mt-5 border-l-2 border-destructive/50 pl-4">
            <p className="text-sm text-destructive">Prehliadač zablokoval kopírovanie. JSON je označený nižšie — použite ⌘C alebo Ctrl+C.</p>
            <textarea ref={aiExportRef} readOnly value={aiExportPreview} onFocus={(event) => event.currentTarget.select()} aria-label="JSON podklady pre AI" className="mt-3 min-h-40 w-full resize-y border border-border bg-secondary/30 p-3 font-mono text-xs leading-5 outline-none focus:border-brand" />
          </div>
        )}

        <nav aria-label="Sekcie klienta" className="sticky top-0 z-10 -mx-5 mt-10 overflow-x-auto border-y border-border/70 bg-background/95 px-5 backdrop-blur sm:-mx-8 sm:px-8"><div className="flex min-w-max gap-6">{workspace.sections.map((section) => <a key={section.key} href={`#${section.key}`} className="py-4 text-sm font-medium text-muted-foreground hover:text-brand">{sectionTitle[section.key]}</a>)}</div></nav>

        <section id="overview" className="scroll-mt-24 py-12 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-[-0.035em]">Prehľad</h2>
          <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"><div><dt className="text-xs font-medium text-muted-foreground">Základný formulár</dt><dd className="mt-2">{workspace.core && <Completion {...workspace.core.progress} />}</dd></div><div><dt className="text-xs font-medium text-muted-foreground">Doplňujúce otázky</dt><dd className="mt-2">{workspace.discovery2 && <Completion {...workspace.discovery2.progress} />}</dd></div><div><dt className="text-xs font-medium text-muted-foreground">Podklady od klienta</dt><dd className="mt-2 text-sm font-semibold">{sourceAssets.length} nahraných</dd></div><div><dt className="text-xs font-medium text-muted-foreground">Súbory pre klienta</dt><dd className="mt-2 text-sm font-semibold">{deliverableAssets.length} nahraných</dd></div></dl>
        </section>

        {workspace.sections.map((section) => (
          <section key={section.key} id={section.key} className="scroll-mt-24 border-t border-border py-12 sm:py-16">
            <div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold tracking-[-0.035em]">{sectionTitle[section.key]}</h2>{section.key === 'core' && workspace.core && <Completion {...workspace.core.progress} />}{section.key === 'discovery_2' && workspace.discovery2 && <Completion {...workspace.discovery2.progress} />}</div>
            <div className="mt-6"><SectionSettings message={sectionStates[section.key] || ''} section={section} onChange={updateSection} /></div>
            {section.key === 'core' && workspace.core && <div className="mt-10">
              <AdminPrefillSection
                answers={workspace.core.answers}
                message={coreState}
                onChange={(answers, field) => {
                  setWorkspace((current) => current.core ? { ...current, core: { ...current.core, answers } } : current)
                  coreSequenceRef.current += 1
                  pendingPrefillFieldsRef.current.set(field, coreSequenceRef.current)
                  setCoreState('Ukladám…')
                  setCoreChange((value) => value + 1)
                }}
              />
              <div className="pt-12 sm:pt-16">
                <h3 className="mb-8 text-xl font-semibold tracking-[-0.03em]">Normálny onboarding formulár</h3>
                <CoreWorkspaceFields
                  answers={workspace.core.answers}
                  assets={sourceAssets}
                  disabled={coreConflict}
                  getAssetUrl={(asset) => `/api/onboarding/admin/clients/${clientId}/workspace/uploads/${asset.id}`}
                  onChange={(answers) => {
                    setWorkspace((current) => current.core ? { ...current, core: { ...current.core, answers } } : current)
                    coreSequenceRef.current += 1
                    setCoreState('Ukladám…')
                    setCoreChange((value) => value + 1)
                  }}
                />
                <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
                  <AutosaveIndicator message={coreState} />
                  {coreConflict && <button type="button" onClick={() => window.location.reload()} className="text-xs font-semibold text-brand underline">Načítať aktuálnu verziu</button>}
                </div>
              </div>
            </div>}
            {section.key === 'discovery_2' && workspace.discovery2 && <div className="mt-10">
              <DiscoveryWorkspaceFields
                answers={workspace.discovery2.answers}
                disabled={discoveryConflict}
                onChange={(answers) => {
                  setWorkspace((current) => current.discovery2 ? { ...current, discovery2: { ...current.discovery2, answers } } : current)
                  discoverySequenceRef.current += 1
                  setDiscoveryState('Ukladám…')
                  setDiscoveryChange((value) => value + 1)
                }}
              />
              <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
                <AutosaveIndicator message={discoveryState} />
                {discoveryConflict && <button type="button" onClick={() => window.location.reload()} className="text-xs font-semibold text-brand underline">Načítať aktuálnu verziu</button>}
              </div>
            </div>}
            {section.key === 'files' && <div className="mt-10">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Fotografie, logá a ostatné vstupy od klienta. Ako správca sem môžete doplniť chýbajúce podklady.</p>
                {sourceAssets.length > 0 && (
                  <a download href={`/api/onboarding/admin/clients/${clientId}/workspace/uploads/archive`} className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-lg bg-secondary px-3 text-xs font-semibold text-foreground hover:bg-secondary/70">
                    <Download className="size-3.5" /> Stiahnuť všetky
                  </a>
                )}
              </div>
              <UploadField apiBasePath={`/api/onboarding/admin/clients/${clientId}/workspace/uploads`} assets={sourceAssets} getAssetUrl={(asset) => `/api/onboarding/admin/clients/${clientId}/workspace/uploads/${asset.id}`} newAssetMetadata={{ category: 'source', clientVisible: false, uploadedBy: 'admin' }} notificationsEnabled={false} onAssetsChange={(assets) => replaceCategoryAssets('source', assets)} onClientVisibilityChange={(asset, visible) => void changeAssetVisibility(asset, visible)} showAdminMetadata totalAssetCount={workspace.assets.length} />
            </div>}
            {section.key === 'deliverables' && <div className="mt-10"><p className="mb-6 max-w-2xl text-sm leading-6 text-muted-foreground">Nahrajte sem hotové prezentácie, fotografie alebo dokumenty. Nové súbory klient ihneď uvidí vo svojej sekcii na stiahnutie.</p><UploadField apiBasePath={`/api/onboarding/admin/clients/${clientId}/workspace/uploads`} assets={deliverableAssets} getAssetUrl={(asset) => `/api/onboarding/admin/clients/${clientId}/workspace/uploads/${asset.id}`} newAssetMetadata={{ category: 'deliverable', clientVisible: true, uploadedBy: 'admin' }} notificationsEnabled={false} onAssetsChange={(assets) => replaceCategoryAssets('deliverable', assets)} onClientVisibilityChange={(asset, visible) => void changeAssetVisibility(asset, visible)} showAdminMetadata totalAssetCount={workspace.assets.length} /></div>}
            {(section.key === 'creative_strategy' || section.key === 'creative_directions' || section.key === 'internal_notes') && <label className="mt-9 block"><span className="text-sm font-semibold">Obsah sekcie</span><textarea value={section.content} onChange={(event) => updateSection({ ...section, content: event.target.value })} className="mt-3 min-h-52 w-full resize-y border-0 border-b border-border bg-transparent px-0 py-4 text-sm leading-7 outline-none focus:border-brand" placeholder={section.key === 'internal_notes' ? 'Interné poznámky — klient ich nikdy neuvidí.' : 'Pridajte obsah, ktorý bude možné podľa nastavenia viditeľnosti zdieľať s klientom.'} /></label>}
          </section>
        ))}
      </div>
    </main>
  )
}
