import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'INBA Ecuador - Federación de Culturismo Natural',
    template: '%s | INBA Ecuador',
  },
  description: 'Federación Ecuatoriana de Culturismo Natural - Formación de entrenadores, competencias, afiliaciones y certificaciones oficiales.',
  keywords: ['culturismo natural', 'federación', 'entrenadores', 'certificación', 'competencias', 'Ecuador', 'INBA'],
  authors: [{ name: 'INBA Ecuador' }],
  creator: 'INBA Ecuador',
  publisher: 'INBA Ecuador',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_EC',
    url: 'https://inbaecuador.org',
    siteName: 'INBA Ecuador',
    title: 'INBA Ecuador - Federación de Culturismo Natural',
    description: 'Federación Ecuatoriana de Culturismo Natural - Formación de entrenadores, competencias, afiliaciones y certificaciones oficiales.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'INBA Ecuador - Culturismo Natural',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'INBA Ecuador',
    description: 'Federación Ecuatoriana de Culturismo Natural',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0c' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}