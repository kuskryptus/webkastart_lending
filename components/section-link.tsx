'use client'

import type { ComponentProps, MouseEvent } from 'react'
import Link from 'next/link'

type SectionLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string
}

export function SectionLink({ href, onClick, ...props }: SectionLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return
    }

    const targetUrl = new URL(href, window.location.href)
    const isCurrentPage =
      targetUrl.origin === window.location.origin &&
      targetUrl.pathname === window.location.pathname &&
      targetUrl.search === window.location.search

    if (!isCurrentPage || !targetUrl.hash) {
      return
    }

    const target = document.getElementById(decodeURIComponent(targetUrl.hash.slice(1)))

    if (!target) {
      return
    }

    event.preventDefault()

    if (window.location.hash !== targetUrl.hash) {
      window.history.pushState(null, '', `${targetUrl.pathname}${targetUrl.search}${targetUrl.hash}`)
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return <Link href={href} onClick={handleClick} {...props} />
}
