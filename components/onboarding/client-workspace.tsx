'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, Cloud, CloudOff, Download, FileText, Images, ListChecks, Loader2, LockKeyhole } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { UploadField } from './upload-field'
import { CoreWorkspaceFields, DiscoveryWorkspaceFields } from './workspace-form-fields'
import { ShareLinkButton, sharedAssetPath } from './share-link-button'
import type { AssetCategory, ClientWorkspaceResponse, OnboardingAsset, WorkspaceProgress, WorkspaceSectionKey } from '@/lib/onboarding/types'

const sectionCopy: Record<WorkspaceSectionKey, { title: string; description: string }> = {
  core: { title: 'O vás a vašom podnikaní', description: 'Základné informácie pre váš web a spoluprácu.' },
  discovery_2: { title: 'Doplňujúce otázky', description: 'Podrobnosti o ponuke, zákazníkoch a objednávkach.' },
  files: { title: 'Nahrať fotografie a podklady', description: 'Logá, fotografie, dokumenty a ďalšie materiály pre váš web.' },
  deliverables: { title: 'Súbory na stiahnutie', description: 'Hotové prezentácie, fotografie a dokumenty, ktoré sme pre vás pripravili.' },
  creative_strategy: { title: 'Kreatívna stratégia', description: 'Strategické smerovanie pripravené pre váš projekt.' },
  creative_directions: { title: 'Kreatívne smery a schválenia', description: 'Kreatívne smery a návrhy zdieľané na kontrolu.' },
  internal_notes: { title: 'Poznámky', description: '' },
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict'

async function responseError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: string } | null
  return data?.error || 'Niečo sa nepodarilo. Skúste to prosím znova.'
}

function refreshOverallProgress(workspace: ClientWorkspaceResponse) {
  const percentages = workspace.sections.flatMap((section) => {
    if (section.key === 'core' && workspace.core) return [workspace.core.progress.percentage]
    if (section.key === 'discovery_2' && workspace.discovery2) return [workspace.discovery2.progress.percentage]
    if (section.key === 'files') return [workspace.assets.some((asset) => (asset.category || 'source') === 'source') ? 100 : 0]
    if (section.key === 'creative_strategy' || section.key === 'creative_directions') return [section.content.trim() ? 100 : 0]
    return []
  })
  return {
    ...workspace,
    overallProgress: percentages.length
      ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length)
      : 0,
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2).replace('.', ',')} GB`
}

function ProgressLabel({ progress }: { progress?: WorkspaceProgress }) {
  if (!progress) return <span className="text-xs font-semibold text-muted-foreground">Pripravené</span>
  if (progress.completed) return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-3.5" /> Hotovo</span>
  return <span className="text-xs font-semibold tabular-nums text-brand">{progress.percentage} %</span>
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === 'saving') return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Ukladám…</span>
  if (state === 'saved') return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><Cloud className="size-3.5" /> Uložené</span>
  if (state === 'error') return <span className="inline-flex items-center gap-1.5 text-xs text-destructive"><CloudOff className="size-3.5" /> Nepodarilo sa uložiť</span>
  if (state === 'conflict') return <span className="inline-flex items-center gap-1.5 text-xs text-destructive"><CloudOff className="size-3.5" /> Novšia verzia</span>
  return null
}

export function ClientWorkspace({ initialWorkspace, token }: { initialWorkspace: ClientWorkspaceResponse; token: string }) {
  const [workspace, setWorkspace] = useState(initialWorkspace)
  const [coreSave, setCoreSave] = useState<SaveState>('idle')
  const [discoverySave, setDiscoverySave] = useState<SaveState>('idle')
  const [coreConflict, setCoreConflict] = useState(false)
  const [discoveryConflict, setDiscoveryConflict] = useState(false)
  const [coreChange, setCoreChange] = useState(0)
  const [discoveryChange, setDiscoveryChange] = useState(0)
  const coreRevisionRef = useRef(initialWorkspace.core?.revision ?? 1)
  const discoveryRevisionRef = useRef(initialWorkspace.discovery2?.revision ?? 1)
  const coreQueueRef = useRef<Promise<void>>(Promise.resolve())
  const discoveryQueueRef = useRef<Promise<void>>(Promise.resolve())
  const coreSequenceRef = useRef(0)
  const discoverySequenceRef = useRef(0)

  const coreEditable = workspace.sections.find((section) => section.key === 'core')?.clientEditable === true
  const discoveryEditable = workspace.sections.find((section) => section.key === 'discovery_2')?.clientEditable === true
  const coreAnswers = workspace.core?.answers
  const coreCurrentStep = workspace.core?.currentStep
  const discoveryAnswers = workspace.discovery2?.answers
  const discoveryCurrentStep = workspace.discovery2?.currentStep
  const sourceAssets = workspace.assets.filter((asset) => (asset.category || 'source') === 'source')
  const deliverableAssets = workspace.assets.filter((asset) => asset.category === 'deliverable')
  const visibleSections = new Set(workspace.sections.map((section) => section.key))

  function replaceCategoryAssets(category: AssetCategory, assets: OnboardingAsset[]) {
    setWorkspace((current) => refreshOverallProgress({
      ...current,
      assets: [
        ...current.assets.filter((asset) => (asset.category || 'source') !== category),
        ...assets,
      ],
    }))
  }

  useEffect(() => {
    if (!coreChange || !coreAnswers || !coreCurrentStep || !coreEditable || coreConflict) return
    const answers = coreAnswers
    const currentStep = coreCurrentStep
    const timeout = window.setTimeout(() => {
      const sequence = coreSequenceRef.current
      setCoreSave('saving')
      coreQueueRef.current = coreQueueRef.current.then(async () => {
        const response = await fetch(`/api/portal/${token}`, {
          body: JSON.stringify({ answers, currentStep, revision: coreRevisionRef.current, sectionKey: 'core' }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) {
          if (sequence === coreSequenceRef.current) setCoreSave(response.status === 409 ? 'conflict' : 'error')
          if (response.status === 409) setCoreConflict(true)
          throw new Error(await responseError(response))
        }
        const saved = await response.json() as { progress: WorkspaceProgress; revision: number; savedAt: string }
        coreRevisionRef.current = saved.revision
        setWorkspace((current) => refreshOverallProgress({ ...current, core: { ...current.core!, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt } }))
        if (sequence === coreSequenceRef.current) setCoreSave('saved')
      }).catch(() => undefined)
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [coreAnswers, coreChange, coreConflict, coreCurrentStep, coreEditable, token])

  useEffect(() => {
    if (!discoveryChange || !discoveryAnswers || !discoveryCurrentStep || !discoveryEditable || discoveryConflict) return
    const answers = discoveryAnswers
    const currentStep = discoveryCurrentStep
    const timeout = window.setTimeout(() => {
      const sequence = discoverySequenceRef.current
      setDiscoverySave('saving')
      discoveryQueueRef.current = discoveryQueueRef.current.then(async () => {
        const response = await fetch(`/api/portal/${token}`, {
          body: JSON.stringify({ answers, currentStep, revision: discoveryRevisionRef.current, sectionKey: 'discovery_2' }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) {
          if (sequence === discoverySequenceRef.current) setDiscoverySave(response.status === 409 ? 'conflict' : 'error')
          if (response.status === 409) setDiscoveryConflict(true)
          throw new Error(await responseError(response))
        }
        const saved = await response.json() as { progress: WorkspaceProgress; revision: number; savedAt: string }
        discoveryRevisionRef.current = saved.revision
        setWorkspace((current) => refreshOverallProgress({ ...current, discovery2: { ...current.discovery2!, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt } }))
        if (sequence === discoverySequenceRef.current) setDiscoverySave('saved')
      }).catch(() => undefined)
    }, 600)
    return () => window.clearTimeout(timeout)
  }, [discoveryAnswers, discoveryChange, discoveryConflict, discoveryCurrentStep, discoveryEditable, token])

  useEffect(() => {
    const retry = () => {
      if (coreChange && coreEditable && coreSave === 'error' && !coreConflict) {
        coreSequenceRef.current += 1
        setCoreSave('saving')
        setCoreChange((value) => value + 1)
      }
      if (discoveryChange && discoveryEditable && discoverySave === 'error' && !discoveryConflict) {
        discoverySequenceRef.current += 1
        setDiscoverySave('saving')
        setDiscoveryChange((value) => value + 1)
      }
    }
    window.addEventListener('online', retry)
    return () => window.removeEventListener('online', retry)
  }, [coreChange, coreConflict, coreEditable, coreSave, discoveryChange, discoveryConflict, discoveryEditable, discoverySave])

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-6 sm:px-8"><LogoMark /><span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Súkromný klientsky portál</span></header>
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Váš projekt</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{workspace.clientLabel}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Podklady k vášmu webu máte na jednom mieste. Odpovede sa ukladajú automaticky a fotografie môžete dopĺňať kedykoľvek.</p>
        <nav aria-label="Rýchle odkazy" className="-mx-1 mt-7 flex gap-2 overflow-x-auto px-1 pb-1">
          {visibleSections.has('core') && <a href="#core" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold hover:border-brand/40 hover:text-brand"><ListChecks className="size-4" /> Formulár</a>}
          {visibleSections.has('files') && <a href="#files" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold hover:border-brand/40 hover:text-brand"><Images className="size-4" /> Nahrať fotky</a>}
          {visibleSections.has('deliverables') && <a href="#deliverables" className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 text-sm font-semibold hover:border-brand/40 hover:text-brand"><Download className="size-4" /> Súbory na stiahnutie</a>}
        </nav>
        <div className="mt-9 flex items-center gap-5 border-y border-border/70 py-5">
          <div className="min-w-0 flex-1"><div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${workspace.overallProgress}%` }} /></div></div>
          <p className="shrink-0 text-sm font-semibold tabular-nums">Celkový postup: {workspace.overallProgress} %</p>
        </div>

        <div className="mt-10 divide-y divide-border">
          {workspace.sections.map((section, index) => {
            const copy = sectionCopy[section.key]
            const progress = section.key === 'core' ? workspace.core?.progress : section.key === 'discovery_2' ? workspace.discovery2?.progress : undefined
            const fixedOpen = section.key === 'files' || section.key === 'deliverables'
            return (
              <details
                key={section.key}
                id={section.key}
                open={index === 0 || fixedOpen}
                onToggle={(event) => {
                  if (fixedOpen && !event.currentTarget.open) event.currentTarget.open = true
                }}
                className="group scroll-mt-24 py-2"
              >
                <summary
                  onClick={(event) => {
                    if (fixedOpen) event.preventDefault()
                  }}
                  className={`flex list-none items-center gap-4 py-6 marker:hidden ${fixedOpen ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <span className="min-w-0 flex-1"><span className="block text-lg font-semibold tracking-[-0.025em]">{copy.title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{copy.description}</span></span>
                  {section.key === 'deliverables' ? <span className="shrink-0 text-xs font-semibold text-muted-foreground">{deliverableAssets.length || '—'}</span> : <ProgressLabel progress={progress} />}
                  {!fixedOpen && <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />}
                </summary>
                <div className="pb-10 pt-3">
                  {section.key === 'core' && workspace.core && <><div className="mb-6 flex justify-end"><SaveIndicator state={coreSave} /></div><CoreWorkspaceFields actor="client" answers={workspace.core.answers} assets={sourceAssets} disabled={!section.clientEditable || coreConflict} getAssetUrl={(asset) => `/api/portal/${token}/uploads/${asset.id}`} onChange={(answers) => { setWorkspace((current) => current.core ? { ...current, core: { ...current.core, answers } } : current); coreSequenceRef.current += 1; setCoreSave('saving'); setCoreChange((value) => value + 1) }} /></>}
                  {section.key === 'discovery_2' && workspace.discovery2 && <><div className="mb-6 flex justify-end"><SaveIndicator state={discoverySave} /></div><DiscoveryWorkspaceFields answers={workspace.discovery2.answers} disabled={!section.clientEditable || discoveryConflict} onChange={(answers) => { setWorkspace((current) => current.discovery2 ? { ...current, discovery2: { ...current.discovery2, answers } } : current); discoverySequenceRef.current += 1; setDiscoverySave('saving'); setDiscoveryChange((value) => value + 1) }} /></>}
                  {section.key === 'files' && (section.clientEditable ? <UploadField apiBasePath={`/api/portal/${token}/uploads`} assets={sourceAssets} canDeleteAsset={(asset) => asset.uploadedBy === 'client'} getAssetUrl={(asset) => `/api/portal/${token}/uploads/${asset.id}`} newAssetMetadata={{ category: 'source', clientVisible: true, uploadedBy: 'client' }} onAssetsChange={(assets) => replaceCategoryAssets('source', assets)} totalAssetCount={workspace.assets.length} /> : sourceAssets.length ? <ul className="divide-y divide-border/70">{sourceAssets.map((asset) => <li key={asset.id} className="flex items-center gap-3 py-3 text-sm"><FileText className="size-4 text-muted-foreground" /><a className="min-w-0 flex-1 truncate font-medium hover:text-brand hover:underline" href={sharedAssetPath(asset) || `/api/portal/${token}/uploads/${asset.id}`} target="_blank" rel="noreferrer">{asset.name}</a><ShareLinkButton asset={asset} /></li>)}</ul> : <p className="text-sm text-muted-foreground">Zatiaľ neboli nahrané žiadne podklady.</p>)}
                  {section.key === 'deliverables' && (deliverableAssets.length ? <ul className="divide-y divide-border/70">{deliverableAssets.map((asset) => <li key={asset.id} className="flex items-center gap-3 py-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><Download className="size-4" /></span><span className="min-w-0 flex-1"><a className="block truncate text-sm font-semibold hover:text-brand hover:underline" href={sharedAssetPath(asset) || `/api/portal/${token}/uploads/${asset.id}`} target="_blank" rel="noreferrer">{asset.name}</a><span className="mt-1 block text-xs text-muted-foreground">{formatBytes(Number(asset.size))} · pripravené {new Intl.DateTimeFormat('sk-SK', { dateStyle: 'medium' }).format(new Date(asset.createdAt))}</span></span><ShareLinkButton asset={asset} /><a aria-label={`Stiahnuť ${asset.name}`} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-brand" href={`/api/portal/${token}/uploads/${asset.id}`}><Download className="size-4" /></a></li>)}</ul> : <p className="text-sm leading-6 text-muted-foreground">Keď pre vás pripravíme hotové súbory, nájdete ich na stiahnutie práve tu.</p>)}
                  {(section.key === 'creative_strategy' || section.key === 'creative_directions') && <div className="whitespace-pre-wrap text-sm leading-7">{section.content || 'Obsah zatiaľ nebol pridaný.'}</div>}
                  {(coreConflict || discoveryConflict) && <button type="button" onClick={() => window.location.reload()} className="mt-6 text-sm font-semibold text-brand underline">Načítať aktuálnu verziu</button>}
                </div>
              </details>
            )
          })}
        </div>
      </div>
    </main>
  )
}
