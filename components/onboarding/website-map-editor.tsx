'use client'

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { PageStructureEditor } from './page-structure-editor'
import type { OnboardingAsset, PageStructure, WebsitePage } from '@/lib/onboarding/types'
import { MAX_WEBSITE_PAGES } from '@/lib/onboarding/validation'

export function WebsiteMapEditor({ assets, disabled = false, getAssetUrl, onChange, structure }: {
  assets: OnboardingAsset[]
  disabled?: boolean
  getAssetUrl: (asset: OnboardingAsset) => string
  onChange: (structure: PageStructure) => void
  structure: PageStructure
}) {
  const pages = structure.pages || []

  function updatePages(nextPages: WebsitePage[]) {
    onChange({ ...structure, pages: nextPages })
  }

  function updatePage(id: string, changes: Partial<WebsitePage>) {
    updatePages(pages.map((page) => page.id === id ? { ...page, ...changes } : page))
  }

  function movePage(index: number, direction: -1 | 1) {
    const target = index + direction
    if (disabled || target < 0 || target >= pages.length) return
    const nextPages = [...pages]
    const [page] = nextPages.splice(index, 1)
    if (!page) return
    nextPages.splice(target, 0, page)
    updatePages(nextPages)
  }

  function removePage(page: WebsitePage) {
    if (disabled || !window.confirm(`Odstrániť podstránku „${page.title || 'Bez názvu'}“ vrátane jej sekcií?`)) return
    updatePages(pages.filter((item) => item.id !== page.id))
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Toto je návrh stránok webu. Môžete ich upraviť, doplniť alebo zmazať. Pri každej stránke stačí opísať jej účel a dôležitý obsah; sekcie a fotografie môžete doplniť neskôr.
        </p>
        <button type="button" disabled={disabled || pages.length >= MAX_WEBSITE_PAGES} onClick={() => updatePages([...pages, { id: crypto.randomUUID(), title: '', purpose: '', keyInformation: '', nextAction: '', sections: [] }])} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="size-4" /> Pridať stránku
        </button>
      </div>

      {!pages.length && <p className="mt-8 border-y border-dashed border-border py-10 text-center text-sm text-muted-foreground">Zatiaľ tu nie sú žiadne podstránky. Pridajte prvú stránku webu.</p>}
      <ol className="mt-8 border-t border-border">
        {pages.map((page, index) => (
          <li key={page.id} className="border-b border-border py-5">
            <div className="flex items-start gap-3">
              <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">{index + 1}</span>
              <details className="min-w-0 flex-1 group">
                <summary className="cursor-pointer list-none py-1 marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="block text-base font-semibold">{page.title.trim() || 'Nová podstránka'} <span className="ml-2 text-xs font-medium text-muted-foreground">{page.sections.length ? `${page.sections.length} sekcií` : 'Bez sekcií'}</span></span>
                  <span className="mt-1 block text-xs text-muted-foreground">{page.purpose.trim() || 'Rozbaliť a doplniť účel stránky'}</span>
                </summary>
                <div className="space-y-5 pb-5 pt-7">
                  <label className="block text-sm font-semibold">Názov stránky <span className="ml-1 text-xs font-medium text-brand">{page.title.trim() ? 'Dôležité' : 'Dôležité · treba doplniť'}</span>
                    <input value={page.title} disabled={disabled} maxLength={160} onChange={(event) => updatePage(page.id, { title: event.target.value })} placeholder="Napr. Služby" className="mt-2 block w-full border-0 border-b border-border bg-transparent px-0 py-2 text-base outline-none focus:border-brand disabled:opacity-60" />
                  </label>
                  <label className="block text-sm font-semibold">Na čo má táto stránka slúžiť? <span className="ml-1 text-xs font-medium text-brand">{page.purpose.trim() ? 'Dôležité' : 'Dôležité · treba doplniť'}</span>
                    <textarea value={page.purpose} disabled={disabled} maxLength={2000} onChange={(event) => updatePage(page.id, { purpose: event.target.value })} placeholder="Napr. vysvetliť naše služby a priviesť návštevníka k dopytu" className="mt-2 block min-h-20 w-full resize-y rounded-xl border border-border bg-white/60 px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-brand disabled:opacity-60" />
                  </label>
                  <label className="block text-sm font-semibold">Čo sa tu musí návštevník dozvedieť?
                    <textarea value={page.keyInformation} disabled={disabled} maxLength={3000} onChange={(event) => updatePage(page.id, { keyInformation: event.target.value })} placeholder="Napr. čo presne ponúkame, pre koho a za akých podmienok" className="mt-2 block min-h-20 w-full resize-y rounded-xl border border-border bg-white/60 px-4 py-3 text-sm font-normal leading-6 outline-none focus:border-brand disabled:opacity-60" />
                  </label>
                  <label className="block text-sm font-semibold">Čo má návštevník urobiť ďalej?
                    <input value={page.nextAction} disabled={disabled} maxLength={1000} onChange={(event) => updatePage(page.id, { nextAction: event.target.value })} placeholder="Napr. odoslať dopyt alebo prejsť na kontakt" className="mt-2 block w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm font-normal outline-none focus:border-brand disabled:opacity-60" />
                  </label>
                  <div className="border-t border-border pt-6">
                    <h3 className="mb-4 text-base font-semibold">Sekcie tejto stránky</h3>
                    <PageStructureEditor assets={assets} disabled={disabled} getAssetUrl={getAssetUrl} structure={{ sections: page.sections }} onChange={(next) => updatePage(page.id, { sections: next.sections })} />
                  </div>
                </div>
              </details>
              {!disabled && <div className="flex shrink-0 items-center gap-0.5">
                <button type="button" disabled={index === 0} onClick={() => movePage(index, -1)} aria-label={`Posunúť stránku ${page.title || index + 1} vyššie`} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-25"><ArrowUp className="size-4" /></button>
                <button type="button" disabled={index === pages.length - 1} onClick={() => movePage(index, 1)} aria-label={`Posunúť stránku ${page.title || index + 1} nižšie`} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary disabled:opacity-25"><ArrowDown className="size-4" /></button>
                <button type="button" onClick={() => removePage(page)} aria-label={`Odstrániť stránku ${page.title || index + 1}`} className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button>
              </div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
