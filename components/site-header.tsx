'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Menu as MenuIcon, MessageCircle, X } from 'lucide-react'
import { ContactFormLink } from '@/components/contact-form-link'
import { Logo } from '@/components/logo'
import { SectionLink } from '@/components/section-link'

const navItems = [
  { label: 'Projekty', href: '/#projekty' },
  { label: 'Ako pracujem', href: '/#proces' },
  { label: 'Služby a ceny', href: '/#sluzby' },
  { label: 'Prečo WebkaStart?', href: '/#preco-webkastart' },
  { label: 'Články', href: '/#clanky' },
  { label: 'Kontakt', href: '/#kontakt' },
]

export function SiteHeader() {
  const lastScrollY = useRef(0)
  const mobileMenuOpenRef = useRef(false)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  function updateMobileMenu(open: boolean) {
    mobileMenuOpenRef.current = open
    setIsMobileMenuOpen(open)

    if (open) {
      setIsHeaderVisible(true)
    }
  }

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY
      const isNearTop = currentScrollY < 80
      const isScrollingUp = currentScrollY < lastScrollY.current

      setIsHeaderVisible(mobileMenuOpenRef.current || isNearTop || isScrollingUp)
      lastScrollY.current = currentScrollY
    }

    function handlePointerMove(event: PointerEvent) {
      if (event.clientY <= 28) {
        setIsHeaderVisible(true)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && mobileMenuOpenRef.current) {
        mobileMenuOpenRef.current = false
        setIsMobileMenuOpen(false)
      }
    }

    const desktopQuery = window.matchMedia('(min-width: 64rem)')

    function handleDesktopChange(event: MediaQueryListEvent) {
      if (event.matches && mobileMenuOpenRef.current) {
        mobileMenuOpenRef.current = false
        setIsMobileMenuOpen(false)
      }
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    desktopQuery.addEventListener('change', handleDesktopChange)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('keydown', handleKeyDown)
      desktopQuery.removeEventListener('change', handleDesktopChange)
    }
  }, [])

  return (
    <>
      <div
        aria-hidden="true"
        onPointerEnter={() => setIsHeaderVisible(true)}
        className={`fixed inset-x-0 top-0 z-40 h-7 ${
          isHeaderVisible ? 'pointer-events-none' : 'pointer-events-auto'
        }`}
      />
      <header
        onFocusCapture={() => setIsHeaderVisible(true)}
        onMouseEnter={() => setIsHeaderVisible(true)}
        onMouseLeave={(event) => {
          if (window.scrollY >= 120 && event.clientY > 8 && !mobileMenuOpenRef.current) {
            setIsHeaderVisible(false)
          }
        }}
        className={`sticky top-0 z-30 w-full bg-background/80 backdrop-blur transition-transform duration-300 supports-[backdrop-filter]:bg-background/65 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:py-6">
          <Logo className="-ml-1 xl:ml-15" />

          <nav
            aria-label="Hlavná navigácia"
            className="hidden items-center gap-6 lg:flex xl:gap-8"
          >
            {navItems.map((item) => (
              <SectionLink
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
              >
                {item.label}
              </SectionLink>
            ))}
          </nav>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Zavrieť menu' : 'Otvoriť menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => updateMobileMenu(!isMobileMenuOpen)}
            className="inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition-colors hover:bg-secondary focus:outline-none focus-visible:ring-3 focus-visible:ring-brand/25 lg:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="size-5 text-brand" aria-hidden="true" />
            ) : (
              <MenuIcon className="size-5 text-brand" aria-hidden="true" />
            )}
          </button>

          <Link
            href="/rezervacia"
            aria-label="Máte nápad? Rezervujte si konzultáciu"
            className="group hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground lg:inline-flex"
          >
            Máte nápad?
            <MessageCircle className="size-4 text-brand" aria-hidden="true" />
          </Link>
        </div>

        {isMobileMenuOpen ? (
          <div
            id="mobile-navigation"
            className="animate-in border-t border-border/70 fade-in slide-in-from-top-2 duration-200 motion-reduce:animate-none lg:hidden"
          >
            <div className="mx-auto max-w-7xl px-5 pb-5 pt-4 sm:px-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand">Rýchla navigácia</p>
              <nav aria-label="Mobilná navigácia" className="mt-2 grid grid-cols-2 gap-x-5">
                {navItems.map((item) => (
                  <SectionLink
                    key={item.href}
                    href={item.href}
                    onClick={() => updateMobileMenu(false)}
                    className="flex min-h-12 items-center border-b border-border/70 text-sm font-semibold text-foreground transition-colors hover:text-brand focus:outline-none focus-visible:text-brand"
                  >
                    {item.label}
                  </SectionLink>
                ))}
              </nav>

              <ContactFormLink
                onClick={() => updateMobileMenu(false)}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
              >
                Napíšte mi
                <MessageCircle className="size-4" aria-hidden="true" />
              </ContactFormLink>
            </div>
          </div>
        ) : null}
      </header>
    </>
  )
}
