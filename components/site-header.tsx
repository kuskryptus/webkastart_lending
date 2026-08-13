'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Logo } from '@/components/logo'

const navItems = [
  { label: 'Projekty', href: '#projekty' },
  { label: 'Ako pracujem', href: '#proces' },
  { label: 'Prečo WebkaStart?', href: '#preco-webkastart' },
]

export function SiteHeader() {
  function handleContactClick() {
    if (window.location.pathname !== '/') {
      window.location.href = '/#kontakt-formular'
      return
    }

    window.history.pushState(null, '', '#kontakt-formular')
    window.dispatchEvent(new Event('open-contact-form'))
  }

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

        <button
          type="button"
          onClick={handleContactClick}
          aria-label="Máte nápad? Kontaktujte ma"
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground sm:px-4 sm:py-2.5 sm:text-sm"
        >
          Máte nápad?
          <MessageCircle className="size-3.5 text-brand sm:size-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  )
}
