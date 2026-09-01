'use client'

import { Check, Plus, X } from 'lucide-react'
import type { ProductPriceItem } from '@/lib/onboarding/types'

export function ChoiceGrid({
  onChange,
  options,
  selected,
}: {
  onChange: (value: string[]) => void
  options: readonly string[]
  selected: string[]
}) {
  function toggle(option: string) {
    onChange(selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option])
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const active = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option)}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${active ? 'bg-brand-soft text-foreground' : 'bg-white/70 text-foreground hover:bg-white'}`}
          >
            <span className={`grid size-5 shrink-0 place-items-center rounded-md border ${active ? 'border-brand bg-brand text-white' : 'border-border bg-transparent'}`}>
              {active && <Check className="size-3.5" aria-hidden="true" />}
            </span>
            {option}
          </button>
        )
      })}
    </div>
  )
}

export function QuickQuestion({
  children,
  hint = 'Označte všetko, čo platí. Otázku môžete aj preskočiť.',
  title,
}: {
  children: React.ReactNode
  hint?: string
  title: string
}) {
  return (
    <div>
      <h3 className="text-base font-semibold tracking-[-0.01em]">{title}</h3>
      {hint && <p className="mt-2 text-sm leading-6 text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function OtherAnswer({
  label,
  multiline = false,
  onChange,
  placeholder,
  show,
  value,
}: {
  label: string
  multiline?: boolean
  onChange: (value: string) => void
  placeholder?: string
  show: boolean
  value: string
}) {
  if (!show && !value) return null
  const className = 'mt-3 w-full border-0 border-b border-border bg-transparent px-0 py-3 text-base leading-7 outline-none placeholder:text-muted-foreground/55 focus:border-brand focus:ring-0'
  return (
    <label className="mt-5 block">
      <span className="text-sm font-semibold">{label}</span>
      {multiline ? (
        <textarea value={value} maxLength={2000} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${className} min-h-24 resize-y`} />
      ) : (
        <input value={value} maxLength={1000} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={className} />
      )}
    </label>
  )
}

export function RepeatableTextItems({
  addLabel,
  label,
  onChange,
  placeholder,
  values,
}: {
  addLabel: string
  label?: string
  onChange: (values: string[]) => void
  placeholder: string
  values: string[]
}) {
  const items = values.length ? values : ['']
  return (
    <div>
      {label && <p className="text-sm font-semibold">{label}</p>}
      <div className={label ? 'mt-2 space-y-2' : 'space-y-2'}>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              aria-label={`${label || addLabel} ${index + 1}`}
              value={item}
              maxLength={200}
              onChange={(event) => {
                const next = [...items]
                next[index] = event.target.value.replaceAll('\n', ' ')
                onChange(next)
              }}
              placeholder={index === 0 ? placeholder : `Ďalšia položka ${index + 1}`}
              className="min-w-0 flex-1 border-0 border-b border-border bg-transparent px-0 py-3 text-base outline-none placeholder:text-muted-foreground/55 focus:border-brand focus:ring-0"
            />
            {items.length > 1 && (
              <button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={`Odstrániť položku ${index + 1}`}>
                <X className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      {items.length < 20 && (
        <button type="button" onClick={() => onChange([...items, ''])} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline">
          <Plus className="size-4" /> {addLabel}
        </button>
      )}
    </div>
  )
}

const priceTypes: ProductPriceItem['priceType'][] = [
  'Presná cena',
  'Cena od',
  'Cenové rozpätie',
  'Cena na vyžiadanie',
  'Individuálna cena',
]

const emptyProduct: ProductPriceItem = { name: '', type: '', price: '', priceType: '', note: '' }

export function ProductPriceList({ onChange, value }: {
  onChange: (value: ProductPriceItem[]) => void
  value: ProductPriceItem[]
}) {
  function update(index: number, patch: Partial<ProductPriceItem>) {
    onChange(value.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))
  }

  return (
    <div className="space-y-5">
      {value.map((item, index) => (
        <fieldset key={index} className="relative border-t border-border/80 pt-5 first:border-0 first:pt-0">
          <legend className="text-sm font-semibold">Položka {index + 1}</legend>
          <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-0 top-3 grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label={`Odstrániť položku ${index + 1}`}>
            <X className="size-4" />
          </button>
          <div className="mt-3 grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="text-xs font-semibold text-muted-foreground">Názov</span><input value={item.name} maxLength={200} onChange={(event) => update(index, { name: event.target.value })} className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 outline-none focus:border-brand" /></label>
            <label><span className="text-xs font-semibold text-muted-foreground">Typ</span><select value={item.type} onChange={(event) => update(index, { type: event.target.value as ProductPriceItem['type'] })} className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 outline-none focus:border-brand"><option value="">Vyberte</option><option>Produkt</option><option>Služba</option></select></label>
            <label><span className="text-xs font-semibold text-muted-foreground">Typ ceny</span><select value={item.priceType} onChange={(event) => update(index, { priceType: event.target.value as ProductPriceItem['priceType'] })} className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 outline-none focus:border-brand"><option value="">Vyberte</option>{priceTypes.map((option) => <option key={option}>{option}</option>)}</select></label>
            <label><span className="text-xs font-semibold text-muted-foreground">Cena</span><input value={item.price} maxLength={100} inputMode="decimal" onChange={(event) => update(index, { price: event.target.value })} placeholder="Napr. 49 € alebo 40–60 €" className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 outline-none focus:border-brand" /></label>
            <label><span className="text-xs font-semibold text-muted-foreground">Krátka poznámka <span className="font-normal">(nepovinné)</span></span><input value={item.note} maxLength={1000} onChange={(event) => update(index, { note: event.target.value })} className="mt-1 w-full border-0 border-b border-border bg-transparent px-0 py-2.5 outline-none focus:border-brand" /></label>
          </div>
        </fieldset>
      ))}
      {value.length < 20 && (
        <button type="button" onClick={() => onChange([...value, { ...emptyProduct }])} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-soft px-4 text-sm font-semibold text-brand hover:bg-brand-soft/70">
          <Plus className="size-4" /> Pridať produkt / službu
        </button>
      )}
    </div>
  )
}
