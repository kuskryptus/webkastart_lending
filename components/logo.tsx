'use client'

import Link from 'next/link'
import type { MouseEvent } from 'react'

type LogoMarkProps = {
  className?: string
  size?: 'default' | 'compact'
}

const markSizes = {
  default: {
    frame: 'h-8 w-[52px]',
  },
  compact: {
    frame: 'h-5 w-[32px]',
  },
}

export function LogoMark({ className = '', size = 'default' }: LogoMarkProps) {
  const sizes = markSizes[size]

  return (
    <span
      className={`inline-flex shrink-0 items-center text-foreground ${sizes.frame} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 220 140" className="h-full w-full" fill="none">
        <path
          d="M32 32L72 108L110 32L148 108L188 32"
          stroke="currentColor"
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="204" cy="104" r="13" className="fill-brand" />
      </svg>
    </span>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
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

    if (window.location.pathname !== '/') {
      return
    }

    event.preventDefault()
    window.history.pushState(null, '', '/')
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <Link
      href="/"
      onClick={handleClick}
      className={`inline-flex items-center ${className}`}
      aria-label="WebkaStart — domovská stránka"
    >
      <LogoMark />
    </Link>
  )
}
