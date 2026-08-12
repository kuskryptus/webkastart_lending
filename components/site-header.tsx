import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
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
          aria-label="Napíš mi"
          className="inline-flex size-11 items-center justify-center gap-2 rounded-full bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:h-auto sm:w-auto sm:px-5 sm:py-2.5"
        >
          <span className="hidden sm:inline">Napíš mi</span>
          <MessageCircle className="size-5 sm:size-4" aria-hidden="true" />
        </Link>
      </div>
    </header>
  )
}
