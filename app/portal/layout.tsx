import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Klientsky portál — WebkaStart',
  description: 'Súkromný priestor s informáciami a podkladmi k vášmu projektu.',
  referrer: 'no-referrer',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return children
}
