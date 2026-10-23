import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ReactNode } from 'react'

export const dynamic = 'force-static'

export default function PublicLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}