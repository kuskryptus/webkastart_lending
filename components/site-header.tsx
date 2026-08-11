import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Napíš mi
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  )
}
