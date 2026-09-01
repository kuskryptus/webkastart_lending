'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronDown, Cloud, CloudOff, FileText, Loader2, LockKeyhole } from 'lucide-react'
import { LogoMark } from '@/components/logo'
import { UploadField } from './upload-field'
import { CoreWorkspaceFields, DiscoveryWorkspaceFields } from './workspace-form-fields'
import type { ClientWorkspaceResponse, WorkspaceProgress, WorkspaceSectionKey } from '@/lib/onboarding/types'

const sectionCopy: Record<WorkspaceSectionKey, { title: string; description: string }> = {
  core: { title: 'O vás a vašom podnikaní', description: 'Základné informácie pre váš web a spoluprácu.' },
  discovery_2: { title: 'Doplňujúce otázky', description: 'Podrobnosti o ponuke, zákazníkoch a objednávkach.' },
  files: { title: 'Fotografie a materiály', description: 'Logá, fotografie, dokumenty a ďalšie podklady.' },
  creative_strategy: { title: 'Creative Strategy', description: 'Strategické smerovanie pripravené pre váš projekt.' },
  creative_directions: { title: 'Návrhy / schválenia', description: 'Kreatívne smery a návrhy zdieľané na kontrolu.' },
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
    if (section.key === 'files') return [workspace.assets.length ? 100 : 0]
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

  const coreEditable = workspace.sections.find((section) => section.key === 'core')?.clientEditable === true
  const discoveryEditable = workspace.sections.find((section) => section.key === 'discovery_2')?.clientEditable === true
  const coreAnswers = workspace.core?.answers
  const coreCurrentStep = workspace.core?.currentStep
  const discoveryAnswers = workspace.discovery2?.answers
  const discoveryCurrentStep = workspace.discovery2?.currentStep

  useEffect(() => {
    if (!coreChange || !coreAnswers || !coreCurrentStep || !coreEditable || coreConflict) return
    const answers = coreAnswers
    const currentStep = coreCurrentStep
    const timeout = window.setTimeout(() => {
      setCoreSave('saving')
      coreQueueRef.current = coreQueueRef.current.then(async () => {
        const response = await fetch(`/api/portal/${token}`, {
          body: JSON.stringify({ answers, currentStep, revision: coreRevisionRef.current, sectionKey: 'core' }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) {
          setCoreSave(response.status === 409 ? 'conflict' : 'error')
          if (response.status === 409) setCoreConflict(true)
          throw new Error(await responseError(response))
        }
        const saved = await response.json() as { progress: WorkspaceProgress; revision: number; savedAt: string }
        coreRevisionRef.current = saved.revision
        setWorkspace((current) => refreshOverallProgress({ ...current, core: { ...current.core!, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt } }))
        setCoreSave('saved')
      }).catch(() => undefined)
    }, 900)
    return () => window.clearTimeout(timeout)
  }, [coreAnswers, coreChange, coreConflict, coreCurrentStep, coreEditable, token])

  useEffect(() => {
    if (!discoveryChange || !discoveryAnswers || !discoveryCurrentStep || !discoveryEditable || discoveryConflict) return
    const answers = discoveryAnswers
    const currentStep = discoveryCurrentStep
    const timeout = window.setTimeout(() => {
      setDiscoverySave('saving')
      discoveryQueueRef.current = discoveryQueueRef.current.then(async () => {
        const response = await fetch(`/api/portal/${token}`, {
          body: JSON.stringify({ answers, currentStep, revision: discoveryRevisionRef.current, sectionKey: 'discovery_2' }),
          headers: { 'Content-Type': 'application/json' },
          method: 'PATCH',
        })
        if (!response.ok) {
          setDiscoverySave(response.status === 409 ? 'conflict' : 'error')
          if (response.status === 409) setDiscoveryConflict(true)
          throw new Error(await responseError(response))
        }
        const saved = await response.json() as { progress: WorkspaceProgress; revision: number; savedAt: string }
        discoveryRevisionRef.current = saved.revision
        setWorkspace((current) => refreshOverallProgress({ ...current, discovery2: { ...current.discovery2!, progress: saved.progress, revision: saved.revision, updatedAt: saved.savedAt } }))
        setDiscoverySave('saved')
      }).catch(() => undefined)
    }, 900)
    return () => window.clearTimeout(timeout)
  }, [discoveryAnswers, discoveryChange, discoveryConflict, discoveryCurrentStep, discoveryEditable, token])

  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-6 sm:px-8"><LogoMark /><span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><LockKeyhole className="size-3.5" /> Súkromný klientsky portál</span></header>
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Váš projekt</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{workspace.clientLabel}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Podklady k vášmu webu máte na jednom mieste. Odpovede môžete priebežne upravovať a fotografie dopĺňať kedykoľvek.</p>
        <div className="mt-9 flex items-center gap-5 border-y border-border/70 py-5">
          <div className="min-w-0 flex-1"><div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${workspace.overallProgress}%` }} /></div></div>
          <p className="shrink-0 text-sm font-semibold tabular-nums">Celkový progress: {workspace.overallProgress} %</p>
        </div>

        <div className="mt-10 divide-y divide-border">
          {workspace.sections.map((section, index) => {
            const copy = sectionCopy[section.key]
            const progress = section.key === 'core' ? workspace.core?.progress : section.key === 'discovery_2' ? workspace.discovery2?.progress : undefined
            return (
              <details key={section.key} open={index === 0} className="group py-2">
                <summary className="flex cursor-pointer list-none items-center gap-4 py-6 marker:hidden">
                  <span className="min-w-0 flex-1"><span className="block text-lg font-semibold tracking-[-0.025em]">{copy.title}</span><span className="mt-1 block text-sm leading-6 text-muted-foreground">{copy.description}</span></span>
                  <ProgressLabel progress={progress} />
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-10 pt-3">
                  {section.key === 'core' && workspace.core && <><div className="mb-6 flex justify-end"><SaveIndicator state={coreSave} /></div><CoreWorkspaceFields answers={workspace.core.answers} disabled={!section.clientEditable || coreConflict} onChange={(answers) => { setWorkspace((current) => current.core ? { ...current, core: { ...current.core, answers } } : current); setCoreChange((value) => value + 1) }} /></>}
                  {section.key === 'discovery_2' && workspace.discovery2 && <><div className="mb-6 flex justify-end"><SaveIndicator state={discoverySave} /></div><DiscoveryWorkspaceFields answers={workspace.discovery2.answers} disabled={!section.clientEditable || discoveryConflict} onChange={(answers) => { setWorkspace((current) => current.discovery2 ? { ...current, discovery2: { ...current.discovery2, answers } } : current); setDiscoveryChange((value) => value + 1) }} /></>}
                  {section.key === 'files' && (section.clientEditable ? <UploadField apiBasePath={`/api/portal/${token}/uploads`} assets={workspace.assets} canDeleteAsset={(asset) => asset.uploadedBy === 'client'} getAssetUrl={(asset) => `/api/portal/${token}/uploads/${asset.id}`} newAssetMetadata={{ clientVisible: true, uploadedBy: 'client' }} onAssetsChange={(assets) => setWorkspace((current) => refreshOverallProgress({ ...current, assets }))} /> : <ul className="divide-y divide-border/70">{workspace.assets.map((asset) => <li key={asset.id} className="flex items-center gap-3 py-3 text-sm"><FileText className="size-4 text-muted-foreground" /><a className="font-medium hover:text-brand hover:underline" href={`/api/portal/${token}/uploads/${asset.id}`} target="_blank" rel="noreferrer">{asset.name}</a></li>)}</ul>)}
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
