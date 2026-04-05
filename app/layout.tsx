import type { Metadata } from 'next'
import {
  Fraunces,
  Geist_Mono,
  Manrope,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} ${fraunces.variable} ${manrope.variable} ${_geistMono.variable} font-sans antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  )
}
