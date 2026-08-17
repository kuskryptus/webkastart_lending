'use client'

import { useEffect } from 'react'

export function HomeScrollReset() {
  useEffect(() => {
    if (window.location.hash) {
      return
    }

    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return null
}
