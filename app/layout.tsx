import type { Metadata, Viewport } from 'next'
import {
  Fraunces,
  Geist_Mono,
  Manrope,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { PWAInstallPrompt } from '@/components/pwa-install-prompt'
import { OfflineStatus } from '@/components/offline-status'
import { NotchPadding } from '@/components/safe-area'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
})
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
})
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})
const _geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Multi-tenant school management platform for managing classes, sections, and students',
  generator: 'v0.app',
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SchoolMS" />
        <meta name="msapplication-TileColor" content="#0066cc" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="viewport" content="viewport-fit=cover" />
        <NotchPadding />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${fraunces.variable} ${manrope.variable} ${_geistMono.variable} font-sans antialiased`}
      >
        <OfflineStatus />
        <PWAInstallPrompt />
        {children}
        <Analytics />
      </body>
    </html>
  )
}

