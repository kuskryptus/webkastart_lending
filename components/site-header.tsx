import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/components/logo'

const navItems = [
  { label: 'Projekty', href: '#projekty' },
  { label: 'Ako pracujem', href: '#proces' },
  { label: 'O mne', href: '#o-mne' },
]

export function SiteHeader() {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6 lg:py-6">
        <Logo />

        <nav
          aria-label="Hlavná navigácia"
          className="hidden items-center gap-9 md:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="#kontakt"
          aria-label="Ako vám môžem pomôcť?"
          className="group relative flex h-[78px] w-[152px] shrink-0 items-end justify-end sm:h-[94px] sm:w-[196px]"
        >
          <span className="absolute left-0 top-0 z-20 grid h-[52px] w-[132px] place-items-center rounded-[28px] border-2 border-border bg-card px-4 text-center text-[11px] font-bold leading-[1.12] text-muted-foreground shadow-lg shadow-foreground/5 transition-colors after:absolute after:-bottom-1.5 after:right-7 after:size-4 after:rotate-45 after:rounded-[4px] after:border-b-2 after:border-r-2 after:border-border after:bg-card after:transition-colors group-hover:bg-secondary group-hover:text-foreground group-hover:after:bg-secondary sm:h-[62px] sm:w-[170px] sm:rounded-[34px] sm:px-5 sm:text-sm sm:after:right-9">
            <span>
              Ako vám môžem{' '}
              <br />
              pomôcť?
            </span>
          </span>
          <span
            className="absolute left-[104px] top-[50px] z-10 size-3 rounded-full bg-card shadow-sm ring-2 ring-border transition-colors group-hover:bg-secondary sm:left-[143px] sm:top-[61px] sm:size-4"
            aria-hidden="true"
          />
          <span
            className="absolute left-[124px] top-[62px] z-10 size-1.5 rounded-full bg-card shadow-sm ring-2 ring-border transition-colors group-hover:bg-secondary sm:left-[167px] sm:top-[77px] sm:size-2"
            aria-hidden="true"
          />
          <Image
            src="/contact-avatar.png"
            alt="Kristian Kampczyk"
            width={720}
            height={720}
            className="relative z-10 size-14 rounded-full border-2 border-background object-cover shadow-md transition-transform group-hover:scale-[1.03] sm:size-[76px]"
            sizes="(min-width: 640px) 76px, 56px"
          />
        </Link>
      </div>
    </header>
  )
}
