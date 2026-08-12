import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Award, Briefcase, Heart } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'

const stats = [
  { icon: Award, label: 'Dodanie za dni, nie mesiace' },
  { icon: Briefcase, label: 'Riešenia od 100 €' },
  { icon: Heart, label: 'Weby aj malé aplikácie na mieru' },
]

export function About() {
  return (
    <section id="o-mne" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-24">
      <div className="grid min-w-0 items-center gap-10 lg:grid-cols-[1fr_1.1fr_auto] lg:gap-12">
        {/* Image */}
        <div className="min-w-0 overflow-hidden rounded-2xl">
          <Image
            src="/about-portrait.png"
            alt="Vývojár pracujúci na notebooku"
            width={520}
            height={420}
            className="aspect-[13/10] w-full object-cover"
          />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <SectionLabel>O mne</SectionLabel>
          <h2 className="mt-4 text-pretty text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            Rád tvorím veci, ktoré majú zmysel.
          </h2>
          <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
            Som full-stack vývojár s vášňou pre tvorbu aplikácií, ktoré naozaj
            pomáhajú. Milujem čistý kód, premyslené riešenia a férovú komunikáciu.
          </p>
          <Link
            href="#kontakt"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Viac o mne
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Stats */}
        <dl className="grid min-w-0 gap-4 sm:grid-cols-3 lg:flex lg:flex-col lg:gap-8">
          {stats.map((s) => (
            <div key={s.label} className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <s.icon className="size-5" aria-hidden="true" />
              </div>
              <dd className="min-w-0 text-sm font-medium leading-relaxed text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
