'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { Logo } from '@/components/logo'
import { SectionLink } from '@/components/section-link'

const navItems = [
  { label: 'Projekty', href: '/#projekty' },
  { label: 'Ako pracujem', href: '/#proces' },
  { label: 'Prečo WebkaStart?', href: '/#preco-webkastart' },
  { label: 'Články', href: '/#clanky' },
  { label: 'Kontakt', href: '/#kontakt' },
]

export function SiteHeader() {
  const router = useRouter()
  const lastScrollY = useRef(0)
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)

  useEffect(() => {
    function handleScroll() {
      const currentScrollY = window.scrollY
      const isNearTop = currentScrollY < 80
      const isScrollingUp = currentScrollY < lastScrollY.current

      setIsHeaderVisible(isNearTop || isScrollingUp)
      lastScrollY.current = currentScrollY
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function handleContactClick() {
    if (window.location.pathname !== '/') {
      router.push('/#kontakt-formular')
      return
    }

    window.history.pushState(null, '', '#kontakt-formular')
    window.dispatchEvent(new Event('open-contact-form'))
  }

  return (
    <>
      <div
        aria-hidden="true"
        onMouseEnter={() => setIsHeaderVisible(true)}
        className="fixed inset-x-0 top-0 z-20 h-5"
      />
      <header
        onFocusCapture={() => setIsHeaderVisible(true)}
        onMouseEnter={() => setIsHeaderVisible(true)}
        onMouseLeave={() => {
          if (window.scrollY >= 120) {
            setIsHeaderVisible(false)
          }
        }}
        className={`sticky top-0 z-30 w-full bg-background/80 backdrop-blur transition-transform duration-300 supports-[backdrop-filter]:bg-background/65 ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-6 lg:py-6">
          <Logo />

          <nav
            aria-label="Hlavná navigácia"
            className="hidden items-center gap-7 md:flex lg:gap-9"
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
            onClick={handleContactClick}
            aria-label="Máte nápad? Kontaktujte ma"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm transition-colors hover:bg-secondary hover:text-foreground sm:px-4 sm:py-2.5 sm:text-sm"
          >
            Máte nápad?
            <MessageCircle className="size-3.5 text-brand sm:size-4" aria-hidden="true" />
          </button>
        </div>
      </header>
    </>
  )
}
