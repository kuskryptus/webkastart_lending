'use client'

import Image from 'next/image'
import { ArrowDown, ArrowUp, ImageIcon, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import type { OnboardingAsset, PageStructure, PageStructureSection } from '@/lib/onboarding/types'
import {
  MAX_PAGE_STRUCTURE_ITEMS,
  MAX_PAGE_STRUCTURE_PHOTOS,
  MAX_PAGE_STRUCTURE_SECTIONS,
} from '@/lib/onboarding/validation'

const previewableImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])

function PhotoPreview({ asset, getAssetUrl }: {
  asset: OnboardingAsset
  getAssetUrl: (asset: OnboardingAsset) => string
}) {
  if (!previewableImageTypes.has(asset.mimeType)) {
    return <span className="grid aspect-[4/3] w-full place-items-center bg-secondary text-muted-foreground"><ImageIcon className="size-6" /></span>
  }

  return (
    <Image
      unoptimized
      width={320}
      height={240}
      src={`${getAssetUrl(asset)}?preview=1`}
      alt={asset.name}
      className="aspect-[4/3] w-full object-cover"
    />
  )
}

export function PageStructureEditor({
  assets,
  disabled = false,
  getAssetUrl,
  onChange,
  structure,
}: {
  assets: OnboardingAsset[]
  disabled?: boolean
  getAssetUrl: (asset: OnboardingAsset) => string
  onChange: (structure: PageStructure) => void
  structure: PageStructure
}) {
  const [photoPickerSectionId, setPhotoPickerSectionId] = useState<string | null>(null)
  const imageAssets = assets.filter((asset) => asset.status === 'uploaded' && asset.mimeType.startsWith('image/'))
  const assetById = new Map(imageAssets.map((asset) => [asset.id, asset]))

  function replaceSection(sectionId: string, nextSection: PageStructureSection) {
    onChange({
      sections: structure.sections.map((section) => section.id === sectionId ? nextSection : section),
    })
  }

  function addSection() {
    if (disabled || structure.sections.length >= MAX_PAGE_STRUCTURE_SECTIONS) return
    onChange({
      sections: [
        ...structure.sections,
        {
          id: crypto.randomUUID(),
          title: '',
          description: '',
          items: [],
          photos: [],
        },
      ],
    })
  }

  function moveSection(index: number, direction: -1 | 1) {
    const target = index + direction
    if (disabled || target < 0 || target >= structure.sections.length) return
    const sections = [...structure.sections]
    const [moved] = sections.splice(index, 1)
    if (!moved) return
    sections.splice(target, 0, moved)
    onChange({ sections })
  }

  function removeSection(section: PageStructureSection) {
    if (disabled) return
    const label = section.title.trim() ? ` „${section.title.trim()}“` : ''
    if (!window.confirm(`Odstrániť sekciu${label}?`)) return
    onChange({ sections: structure.sections.filter((item) => item.id !== section.id) })
    if (photoPickerSectionId === section.id) setPhotoPickerSectionId(null)
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Zoraďte časti webu tak, ako majú ísť za sebou. Ku každej sekcii môžete doplniť obsah,
          priradiť nahrané fotografie a vysvetliť, na čo sa majú použiť.
        </p>
        <button
          type="button"
          disabled={disabled || structure.sections.length >= MAX_PAGE_STRUCTURE_SECTIONS}
          onClick={addSection}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" /> Pridať sekciu
        </button>
      </div>

      {!structure.sections.length ? (
        <div className="mt-8 border-y border-dashed border-border py-12 text-center">
          <p className="text-base font-semibold">Štruktúra zatiaľ nie je vytvorená</p>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            Začnite prvou časťou, napríklad Header alebo Hero. Ďalšie sekcie potom jednoducho pridáte pod ňu.
          </p>
          {!disabled && (
            <button type="button" onClick={addSection} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
              <Plus className="size-4" /> Pridať prvú sekciu
            </button>
          )}
        </div>
      ) : (
        <ol className="mt-10 border-t border-border">
          {structure.sections.map((section, index) => {
            const assignedAssetIds = new Set(section.photos.map((photo) => photo.assetId))
            const availableAssets = imageAssets.filter((asset) => !assignedAssetIds.has(asset.id))
            const pickerOpen = photoPickerSectionId === section.id

            return (
              <li key={section.id} className="border-b border-border py-9 first:pt-8">
                <div className="flex items-start gap-4">
                  <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold tabular-nums text-brand">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Sekcia webu</p>
                      {!disabled && (
                        <div className="flex items-center gap-1">
                          <button type="button" disabled={index === 0} onClick={() => moveSection(index, -1)} aria-label={`Posunúť sekciu ${index + 1} vyššie`} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-25"><ArrowUp className="size-4" /></button>
                          <button type="button" disabled={index === structure.sections.length - 1} onClick={() => moveSection(index, 1)} aria-label={`Posunúť sekciu ${index + 1} nižšie`} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-25"><ArrowDown className="size-4" /></button>
                          <button type="button" onClick={() => removeSection(section)} aria-label={`Odstrániť sekciu ${index + 1}`} className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-4" /></button>
                        </div>
                      )}
                    </div>

                    <label className="mt-5 block">
                      <span className="text-sm font-semibold">Názov sekcie</span>
                      <input
                        value={section.title}
                        disabled={disabled}
                        maxLength={160}
                        onChange={(event) => replaceSection(section.id, { ...section, title: event.target.value })}
                        placeholder="Napr. Hero, Naša ponuka alebo Recenzie"
                        className="mt-2 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-xl font-semibold tracking-[-0.025em] outline-none placeholder:text-muted-foreground/60 focus:border-brand disabled:opacity-70"
                      />
                    </label>

                    <label className="mt-6 block">
                      <span className="text-sm font-semibold">Popis a zámer sekcie</span>
                      <textarea
                        value={section.description}
                        disabled={disabled}
                        maxLength={4000}
                        onChange={(event) => replaceSection(section.id, { ...section, description: event.target.value })}
                        placeholder="Čo má táto časť návštevníkovi povedať alebo čo má dosiahnuť?"
                        className="mt-2 min-h-28 w-full resize-y rounded-xl border border-border bg-white/60 px-4 py-3 text-sm leading-6 outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 disabled:opacity-70"
                      />
                    </label>

                    <div className="mt-7">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">Obsah sekcie</p>
                          <p className="mt-1 text-xs text-muted-foreground">Jednotlivé prvky, texty alebo odkazy, ktoré sem patria.</p>
                        </div>
                        {!disabled && section.items.length < MAX_PAGE_STRUCTURE_ITEMS && (
                          <button
                            type="button"
                            onClick={() => replaceSection(section.id, { ...section, items: [...section.items, ''] })}
                            className="inline-flex min-h-9 shrink-0 items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                          >
                            <Plus className="size-3.5" /> Pridať bod
                          </button>
                        )}
                      </div>
                      {section.items.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <li key={`${section.id}-item-${itemIndex}`} className="flex items-center gap-3">
                              <span className="size-1.5 shrink-0 rounded-full bg-brand" />
                              <input
                                value={item}
                                disabled={disabled}
                                maxLength={300}
                                aria-label={`Obsah sekcie, bod ${itemIndex + 1}`}
                                onChange={(event) => replaceSection(section.id, {
                                  ...section,
                                  items: section.items.map((value, currentIndex) => currentIndex === itemIndex ? event.target.value : value),
                                })}
                                placeholder="Napr. Rezervuj si alebo aktuálna ponuka"
                                className="min-w-0 flex-1 border-0 border-b border-border bg-transparent px-0 py-2 text-sm outline-none focus:border-brand disabled:opacity-70"
                              />
                              {!disabled && (
                                <button type="button" onClick={() => replaceSection(section.id, { ...section, items: section.items.filter((_, currentIndex) => currentIndex !== itemIndex) })} aria-label={`Odstrániť bod ${itemIndex + 1}`} className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"><X className="size-3.5" /></button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-8 border-t border-border/70 pt-7">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold">Fotografie pre túto sekciu</p>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">Vyberte ich z podkladov a ku každej doplňte konkrétny popis použitia.</p>
                        </div>
                        {!disabled && imageAssets.length > 0 && section.photos.length < MAX_PAGE_STRUCTURE_PHOTOS && (
                          <button
                            type="button"
                            aria-expanded={pickerOpen}
                            onClick={() => setPhotoPickerSectionId(pickerOpen ? null : section.id)}
                            className="inline-flex min-h-9 shrink-0 items-center gap-2 self-start rounded-lg bg-secondary px-3 text-xs font-semibold hover:bg-secondary/70"
                          >
                            <ImageIcon className="size-4" /> {pickerOpen ? 'Zavrieť výber' : 'Priradiť fotografie'}
                          </button>
                        )}
                      </div>

                      {!imageAssets.length && (
                        <p className="mt-4 text-sm text-muted-foreground">Najprv nahrajte fotografie v sekcii „Nahrať fotografie a podklady“.</p>
                      )}

                      {pickerOpen && (
                        <div className="mt-5 border-y border-border/70 py-5">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Kliknutím priradíte fotografiu</p>
                          {availableAssets.length ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                              {availableAssets.map((asset) => (
                                <button
                                  key={asset.id}
                                  type="button"
                                  disabled={asset.clientVisible === false}
                                  onClick={() => replaceSection(section.id, {
                                    ...section,
                                    photos: [...section.photos, { assetId: asset.id, description: '' }],
                                  })}
                                  className="overflow-hidden rounded-xl border border-border bg-white text-left transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-border"
                                >
                                  <PhotoPreview asset={asset} getAssetUrl={getAssetUrl} />
                                  <span className="block truncate px-3 pt-2 text-xs font-medium">{asset.name}</span>
                                  <span className={`block px-3 pb-2 pt-0.5 text-[11px] ${asset.clientVisible === false ? 'text-amber-700' : 'text-muted-foreground'}`}>
                                    {asset.clientVisible === false ? 'Najprv sprístupnite klientovi' : 'Priradiť'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          ) : <p className="text-sm text-muted-foreground">Všetky dostupné fotografie sú už priradené.</p>}
                        </div>
                      )}

                      {section.photos.length > 0 && (
                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                          {section.photos.map((photo, photoIndex) => {
                            const asset = assetById.get(photo.assetId)
                            if (!asset) return null
                            return (
                              <div key={photo.assetId} className="overflow-hidden rounded-xl border border-border bg-white/60">
                                <div className="relative">
                                  <PhotoPreview asset={asset} getAssetUrl={getAssetUrl} />
                                  {!disabled && (
                                    <button
                                      type="button"
                                      onClick={() => replaceSection(section.id, { ...section, photos: section.photos.filter((item) => item.assetId !== photo.assetId) })}
                                      aria-label={`Odobrať fotografiu ${asset.name}`}
                                      className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-foreground shadow-sm hover:text-destructive"
                                    >
                                      <X className="size-4" />
                                    </button>
                                  )}
                                </div>
                                <div className="p-3">
                                  <p className="truncate text-xs font-medium text-muted-foreground">{asset.name}</p>
                                  <label className="mt-3 block">
                                    <span className="sr-only">Popis fotografie {photoIndex + 1}</span>
                                    <textarea
                                      value={photo.description}
                                      disabled={disabled}
                                      maxLength={1000}
                                      onChange={(event) => replaceSection(section.id, {
                                        ...section,
                                        photos: section.photos.map((item) => item.assetId === photo.assetId ? { ...item, description: event.target.value } : item),
                                      })}
                                      placeholder="Popis fotografie alebo spôsob použitia"
                                      className="min-h-20 w-full resize-y border-0 border-b border-border bg-transparent px-0 py-2 text-sm leading-5 outline-none focus:border-brand disabled:opacity-70"
                                    />
                                  </label>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}
