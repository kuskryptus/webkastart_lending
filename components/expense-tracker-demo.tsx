'use client'

import { type KeyboardEvent, useRef, useState } from 'react'
import {
  BarChart3,
  BatteryCharging,
  Camera,
  CarFront,
  ChevronDown,
  Clock3,
  GraduationCap,
  Grid2X2,
  HeartPulse,
  Home,
  Info,
  Settings,
  Signal,
  Shapes,
  ShoppingBasket,
  Utensils,
  Wifi,
} from 'lucide-react'

type Category = {
  amount: string
  color: string
  difference: string
  icon: typeof Home
  name: string
  percentage: number
  transactions: string
  trend: number
}

type Transaction = {
  amount: string
  meta: string
  name: string
}

type Month = {
  categories: Category[]
  compareWith: string
  irregular: string
  irregularDifference: string
  irregularTrend: number
  label: string
  regular: string
  regularDifference: string
  regularTrend: number
  total: string
  totalDifference: string
  totalTrend: number
  transactions: Transaction[]
}

const categoryDesign = [
  { name: 'Bývanie', color: '#247d68', icon: Home },
  { name: 'Potraviny', color: '#35b4aa', icon: ShoppingBasket },
  { name: 'Reštaurácie', color: '#707bd0', icon: Utensils },
  { name: 'Vzdelávanie', color: '#ca8129', icon: GraduationCap },
  { name: 'Doprava', color: '#b44c78', icon: CarFront },
  { name: 'Ostatné', color: '#8dad5a', icon: Shapes },
  { name: 'Zdravie', color: '#9aaa72', icon: HeartPulse },
] as const

function makeCategories(
  values: Array<{
    amount: string
    difference: string
    percentage: number
    transactions: string
    trend: number
  }>,
): Category[] {
  return categoryDesign.map((category, index) => ({ ...category, ...values[index] }))
}

const months: Month[] = [
  {
    label: 'August 2026',
    total: '261,12 €',
    totalTrend: -7,
    totalDifference: '19,42 €',
    regular: '23,00 €',
    regularTrend: 0,
    regularDifference: '0,00 €',
    irregular: '238,12 €',
    irregularTrend: -8,
    irregularDifference: '19,42 €',
    compareWith: 'oproti júlu',
    categories: makeCategories([
      { amount: '114,00 €', percentage: 44, trend: -7, difference: '8,00 €', transactions: 'Nájom · 1 transakcia' },
      { amount: '62,02 €', percentage: 24, trend: -9, difference: '6,48 €', transactions: 'Fresh, Zbrojnoš · 8 transakcií' },
      { amount: '42,10 €', percentage: 16, trend: -11, difference: '5,40 €', transactions: 'SANFOOD, Pizza Bomba · 6 transakcií' },
      { amount: '23,00 €', percentage: 9, trend: 0, difference: '0,00 €', transactions: 'Kurz · 2 transakcie' },
      { amount: '8,00 €', percentage: 3, trend: -24, difference: '2,50 €', transactions: 'Cestovné · 3 transakcie' },
      { amount: '7,00 €', percentage: 3, trend: 56, difference: '2,50 €', transactions: 'Ostatné · 3 transakcie' },
      { amount: '5,00 €', percentage: 2, trend: 10, difference: '0,46 €', transactions: 'Lekáreň · 2 transakcie' },
    ]),
    transactions: [
      { name: 'Fresh', meta: '15.08.2026 · Potraviny', amount: '4,68 €' },
      { name: 'SANFOOD', meta: '15.08.2026 · Reštaurácie', amount: '4,40 €' },
      { name: 'Zbrojnoš', meta: '13.08.2026 · Potraviny', amount: '15,60 €' },
      { name: 'Pizza Bomba', meta: '12.08.2026 · Reštaurácie', amount: '9,90 €' },
    ],
  },
  {
    label: 'Júl 2026',
    total: '280,54 €',
    totalTrend: 7,
    totalDifference: '19,42 €',
    regular: '23,00 €',
    regularTrend: 0,
    regularDifference: '0,00 €',
    irregular: '257,54 €',
    irregularTrend: 8,
    irregularDifference: '19,42 €',
    compareWith: 'oproti augustu',
    categories: makeCategories([
      { amount: '122,00 €', percentage: 43, trend: 7, difference: '8,00 €', transactions: 'Nájom · 1 transakcia' },
      { amount: '68,50 €', percentage: 24, trend: 10, difference: '6,48 €', transactions: 'Fresh, Lidl · 9 transakcií' },
      { amount: '47,50 €', percentage: 17, trend: 13, difference: '5,40 €', transactions: 'Bistro, Pizza Bomba · 7 transakcií' },
      { amount: '23,00 €', percentage: 8, trend: 0, difference: '0,00 €', transactions: 'Kurz · 2 transakcie' },
      { amount: '10,50 €', percentage: 4, trend: 31, difference: '2,50 €', transactions: 'Cestovné · 4 transakcie' },
      { amount: '4,50 €', percentage: 2, trend: -36, difference: '2,50 €', transactions: 'Ostatné · 2 transakcie' },
      { amount: '4,54 €', percentage: 2, trend: -9, difference: '0,46 €', transactions: 'Lekáreň · 2 transakcie' },
    ]),
    transactions: [
      { name: 'Lidl', meta: '28.07.2026 · Potraviny', amount: '12,40 €' },
      { name: 'Bistro', meta: '26.07.2026 · Reštaurácie', amount: '7,80 €' },
      { name: 'Fresh', meta: '24.07.2026 · Potraviny', amount: '8,65 €' },
      { name: 'MHD', meta: '21.07.2026 · Doprava', amount: '3,50 €' },
    ],
  },
  {
    label: 'Jún 2026',
    total: '248,00 €',
    totalTrend: -5,
    totalDifference: '13,12 €',
    regular: '23,00 €',
    regularTrend: 0,
    regularDifference: '0,00 €',
    irregular: '225,00 €',
    irregularTrend: -6,
    irregularDifference: '13,12 €',
    compareWith: 'oproti augustu',
    categories: makeCategories([
      { amount: '109,00 €', percentage: 44, trend: -4, difference: '5,00 €', transactions: 'Nájom · 1 transakcia' },
      { amount: '55,00 €', percentage: 22, trend: -11, difference: '7,02 €', transactions: 'Fresh, Lidl · 7 transakcií' },
      { amount: '38,00 €', percentage: 15, trend: -10, difference: '4,10 €', transactions: 'Bistro · 5 transakcií' },
      { amount: '23,00 €', percentage: 9, trend: 0, difference: '0,00 €', transactions: 'Kurz · 2 transakcie' },
      { amount: '9,00 €', percentage: 4, trend: 13, difference: '1,00 €', transactions: 'Cestovné · 3 transakcie' },
      { amount: '8,00 €', percentage: 3, trend: 14, difference: '1,00 €', transactions: 'Ostatné · 3 transakcie' },
      { amount: '6,00 €', percentage: 3, trend: 20, difference: '1,00 €', transactions: 'Lekáreň · 2 transakcie' },
    ]),
    transactions: [
      { name: 'Fresh', meta: '29.06.2026 · Potraviny', amount: '6,20 €' },
      { name: 'Lekáreň', meta: '27.06.2026 · Zdravie', amount: '6,00 €' },
      { name: 'Bistro', meta: '25.06.2026 · Reštaurácie', amount: '8,10 €' },
      { name: 'MHD', meta: '22.06.2026 · Doprava', amount: '3,00 €' },
    ],
  },
]

function Comparison({
  compact = false,
  difference,
  label,
  trend,
}: {
  compact?: boolean
  difference: string
  label: string
  trend: number
}) {
  const isBetter = trend < 0
  const isSame = trend === 0
  const text = isSame
    ? `Bez zmeny ${label}`
    : isBetter
      ? `O ${Math.abs(trend)} % nižšie · úspora ${difference}`
      : `O ${trend} % vyššie · navyše ${difference}`

  return (
    <span
      className={`${compact ? 'text-[6.5px]' : 'text-[7.5px]'} font-semibold ${
        isSame ? 'text-[#6c756f]' : isBetter ? 'text-[#247d68]' : 'text-[#b35656]'
      }`}
    >
      {text}
    </span>
  )
}

function DonutChart({
  activeCategory,
  categories,
  onSelect,
  total,
}: {
  activeCategory: number | null
  categories: Category[]
  onSelect: (index: number) => void
  total: string
}) {
  let offset = 0

  return (
    <div className="relative mx-auto size-[132px]">
      <svg className="size-full -rotate-90 overflow-visible" viewBox="0 0 100 100" role="group" aria-label="Rozdelenie výdavkov podľa kategórií">
        {categories.map((category, index) => {
          const currentOffset = offset
          offset += category.percentage
          const isActive = activeCategory === index

          return (
            <circle
              key={category.name}
              cx="50"
              cy="50"
              r={isActive ? 39 : 37.5}
              fill="none"
              pathLength="100"
              stroke={category.color}
              strokeDasharray={`${Math.max(category.percentage - 0.9, 1)} ${100 - Math.max(category.percentage - 0.9, 1)}`}
              strokeDashoffset={-currentOffset}
              strokeWidth={isActive ? 14 : 13}
              className="cursor-pointer transition-all duration-200 focus:outline-none"
              role="button"
              tabIndex={0}
              aria-label={`${category.name}, ${category.percentage} percent, ${category.amount}`}
              onClick={() => onSelect(index)}
              onKeyDown={(event: KeyboardEvent<SVGCircleElement>) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelect(index)
                }
              }}
            />
          )
        })}
      </svg>

      <div className="pointer-events-none absolute inset-[27px] flex flex-col items-center justify-center rounded-full bg-[#fbfcfa] text-center">
        <span className="max-w-[72px] truncate text-[8px] text-[#39423e]">
          {activeCategory === null ? 'Spolu' : categories[activeCategory].name}
        </span>
        <strong className="mt-0.5 text-[12px] font-bold tracking-[-0.03em] text-[#17201c]">
          {activeCategory === null ? total : categories[activeCategory].amount}
        </strong>
      </div>
    </div>
  )
}

function CategoryRow({
  category,
  compareWith,
  expanded,
  onToggle,
}: {
  category: Category
  compareWith: string
  expanded: boolean
  onToggle: () => void
}) {
  const Icon = category.icon

  return (
    <div className="border-b border-[#d8dcda] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#247d68]/35"
        aria-expanded={expanded}
      >
        <Icon className="size-4 shrink-0" style={{ color: category.color }} strokeWidth={2.1} aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] font-medium text-[#18201d]">{category.name}</span>
          <Comparison compact difference={category.difference} label={compareWith} trend={category.trend} />
        </span>
        <span className="shrink-0 text-[9px] font-semibold text-[#18201d]">
          {category.amount} · {category.percentage}%
        </span>
        <ChevronDown className={`size-3 shrink-0 text-[#65706b] transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-200 ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <p className="pb-2 pl-6 text-[8px] leading-relaxed text-[#68726d]">{category.transactions}</p>
        </div>
      </div>
    </div>
  )
}

export function ExpenseTrackerDemo() {
  const [monthIndex, setMonthIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const categoryListRef = useRef<HTMLDivElement>(null)
  const month = months[monthIndex]

  const selectCategory = (index: number) => {
    setSelectedCategory(index)
    setExpandedCategory(index)
  }

  const changeMonth = (nextIndex: number) => {
    setMonthIndex(nextIndex)
    setSelectedCategory(null)
    setExpandedCategory(null)
  }

  const showCategories = () => {
    setExpandedCategory((current) => current ?? 0)
    categoryListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbfcfa] text-[#17201c]" data-expense-demo onClick={(event) => event.stopPropagation()}>
      <div className="absolute inset-x-0 top-0 z-20 flex h-[26px] items-center justify-between bg-[#fbfcfa] px-3 text-[7px] font-bold">
        <span>14:32</span>
        <span className="flex items-center gap-1 text-[#17201c]" aria-label="Mobilný signál, Wi-Fi, batéria sa nabíja">
          <Signal className="size-[10px]" strokeWidth={2.5} aria-hidden="true" />
          <Wifi className="size-[10px]" strokeWidth={2.5} aria-hidden="true" />
          <BatteryCharging className="size-[12px] text-[#247d68]" strokeWidth={2.3} aria-hidden="true" />
        </span>
      </div>

      <div className="expense-demo-scroll absolute inset-x-0 bottom-[47px] top-[26px] overflow-y-auto overscroll-contain px-3 pb-4">
        <header className="flex items-center justify-between pb-2 pt-2">
          <h4 className="text-[17px] font-semibold tracking-[-0.045em]">Kam idú peniaze</h4>
          <button type="button" className="inline-flex size-7 items-center justify-center rounded-full bg-[#247d68] text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#247d68]/35 focus-visible:ring-offset-1" aria-label="Pridať výdavok skenovaním">
            <Camera className="size-4" strokeWidth={2.2} aria-hidden="true" />
          </button>
        </header>

        <div className="flex items-center justify-center gap-2 py-1.5">
          <button
            className="px-1 text-[15px] disabled:cursor-not-allowed disabled:opacity-20"
            type="button"
            aria-label="Predchádzajúci mesiac"
            disabled={monthIndex === months.length - 1}
            onClick={() => changeMonth(monthIndex + 1)}
          >
            ‹
          </button>
          <div className="inline-flex min-w-[138px] items-center justify-center gap-1.5 rounded-full border border-[#758079] px-3 py-1.5 text-[10px] font-semibold text-[#247d68]" aria-live="polite">
            <span aria-hidden="true">▦</span>
            {month.label}
          </div>
          <button
            className="px-1 text-[15px] disabled:cursor-not-allowed disabled:opacity-20"
            type="button"
            aria-label="Nasledujúci mesiac"
            disabled={monthIndex === 0}
            onClick={() => changeMonth(monthIndex - 1)}
          >
            ›
          </button>
        </div>

        <section className="mt-2 rounded-[9px] bg-[#f1f4f1] px-3 py-3" aria-label="Mesačný súhrn">
          <p className="text-[9px] font-medium">Tento mesiac</p>
          <strong className="mt-0.5 block text-[25px] leading-none tracking-[-0.05em]">{month.total}</strong>
          <div className="mt-1"><Comparison difference={month.totalDifference} label={month.compareWith} trend={month.totalTrend} /></div>
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-[7.5px] text-[#57615c]">
            <p>
              Pravidelné<br />
              <strong className="text-[10px] text-[#17201c]">{month.regular}</strong><br />
              <Comparison compact difference={month.regularDifference} label={month.compareWith} trend={month.regularTrend} />
            </p>
            <p>
              Nepravidelné<br />
              <strong className="text-[10px] text-[#17201c]">{month.irregular}</strong><br />
              <Comparison compact difference={month.irregularDifference} label={month.compareWith} trend={month.irregularTrend} />
            </p>
          </div>
        </section>

        <section className="pt-4" aria-labelledby="expense-categories-title">
          <div className="flex items-start justify-between">
            <div>
              <h5 id="expense-categories-title" className="text-[15px] font-bold tracking-[-0.03em]">Kategórie</h5>
              <p className="mt-0.5 text-[8px] text-[#616b66]">
                {selectedCategory === null
                  ? `Najviac: ${month.categories[0].name} · ${month.categories[0].percentage}%`
                  : `${month.categories[selectedCategory].name} · ${month.categories[selectedCategory].percentage}%`}
              </p>
            </div>
            <button type="button" onClick={showCategories} className="inline-flex size-6 items-center justify-center rounded-full text-[#17201c] transition-colors hover:bg-[#e8eeea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#247d68]/30" aria-label="Zobraziť zoznam kategórií">
              <Info className="size-4" strokeWidth={2.2} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-2.5">
            <DonutChart activeCategory={selectedCategory} categories={month.categories} onSelect={selectCategory} total={month.total} />
          </div>
          <p className="mt-1 text-center text-[7px] text-[#748079]">Kliknite na časť grafu alebo na info</p>
        </section>

        <section ref={categoryListRef} className="scroll-mt-2 pt-4" aria-label="Detail kategórií">
          {month.categories.map((category, index) => (
            <CategoryRow
              key={category.name}
              category={category}
              compareWith={month.compareWith}
              expanded={expandedCategory === index}
              onToggle={() => {
                setSelectedCategory(index)
                setExpandedCategory((current) => current === index ? null : index)
              }}
            />
          ))}
        </section>

        <section className="pt-5" aria-labelledby="recent-transactions-title">
          <h5 id="recent-transactions-title" className="text-[15px] font-bold tracking-[-0.03em]">Posledné transakcie</h5>
          <div className="mt-1">
            {month.transactions.map((transaction) => (
              <div key={`${transaction.name}-${transaction.amount}`} className="flex items-center gap-2 py-2">
                <ShoppingBasket className="size-4 shrink-0 text-[#247d68]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-medium">{transaction.name}</p>
                  <p className="truncate text-[7px] text-[#69736e]">{transaction.meta}</p>
                </div>
                <strong className="text-[10px]">{transaction.amount}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <nav className="absolute inset-x-0 bottom-0 z-20 grid h-[47px] grid-cols-5 bg-[#fbfcfa]/95 px-1 pb-1 pt-1 backdrop-blur" aria-label="Navigácia ukážkovej aplikácie">
        {[
          { label: 'Prehľad', icon: Grid2X2, active: true },
          { label: 'História', icon: Clock3 },
          { label: 'Pridať', icon: Camera },
          { label: 'Štatistiky', icon: BarChart3 },
          { label: 'Nastavenia', icon: Settings },
        ].map(({ label, icon: Icon, active }) => (
          <button key={label} type="button" className={`flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-md text-[6.5px] ${active ? 'font-semibold text-[#247d68]' : 'text-[#1d2622]'}`} aria-current={active ? 'page' : undefined}>
            <Icon className="size-4" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            <span className="max-w-full truncate">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
