import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Príprava vášho webu — WebkaStart',
  description: 'Jednoduchý priestor na odovzdanie informácií a podkladov pre váš nový web.',
  referrer: 'no-referrer',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children
}
