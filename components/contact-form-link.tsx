'use client'

import type { ComponentProps, MouseEvent } from 'react'
import Link from 'next/link'

type ContactFormLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  message?: string
}

export function ContactFormLink({ message, onClick, ...props }: ContactFormLinkProps) {
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

    window.dispatchEvent(
      new CustomEvent('open-contact-form', {
        detail: message ? { message } : undefined,
      }),
    )
  }

  return <Link href="/#kontakt-formular" onClick={handleClick} {...props} />
}
