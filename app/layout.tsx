import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'WebkaStart — Aplikácie, ktoré šetria čas a peniaze',
  description:
    'Tvorím webové aplikácie a automatizácie na mieru, ktoré zjednodušujú každodennú prácu a prinášajú merateľné výsledky.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png?v=3',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png?v=3',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg?v=3',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/icon-light-32x32.png?v=3',
    apple: '/apple-icon.png?v=3',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fafaf9',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
