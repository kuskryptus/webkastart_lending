import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { siteDescription, siteImageUrl, siteName, siteTitle, siteUrl } from '@/lib/site'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'sk_SK',
    url: siteUrl,
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: siteImageUrl,
        width: 1200,
        height: 630,
        alt: 'WebkaStart — aplikácia na správu sociálnych sietí zobrazená na notebooku',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: [siteImageUrl],
  },
  robots: {
    index: true,
    follow: true,
  },
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        type: 'image/png',
        sizes: '96x96',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
      },
    ],
    shortcut: '/favicon.png',
    apple: '/apple-icon.png',
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
  const showVercelAnalytics = process.env.VERCEL === '1'

  return (
    <html lang="sk" className={`${inter.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        {showVercelAnalytics && <Analytics />}
      </body>
    </html>
  )
}
