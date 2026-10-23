import { AppSidebar } from '@/components/layout/app-sidebar'
import { ReactNode } from 'react'

export default function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-y-auto lg:ml-64">
        <div className="container-inba py-8">
          {children}
        </div>
      </main>
    </div>
  )
}