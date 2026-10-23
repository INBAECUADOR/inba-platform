import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Providers } from '@/components/providers'
import { ReactNode } from 'react'

export const dynamic = 'force-static'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}