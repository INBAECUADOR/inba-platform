import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { getSessionContext } from '@/lib/auth/server'
import { AccessDenied } from '@/components/layout/access-denied'
import type { UserRole } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

export default async function DocenteLayout({ children }: { children: ReactNode }) {
  const context = await getSessionContext()

  if (!context.ok) {
    if (context.reason === 'unauthenticated') {
      redirect('/login?redirect=/app/docente')
    }
    return (
      <AccessDenied
        title="No se pudo verificar tu sesion"
        message="Vuelve a iniciar sesion o contacta al administrador."
      />
    )
  }

  const allowed: UserRole[] = ['docente', 'admin_general', 'admin_academico']

  if (!allowed.some((role) => context.roles.includes(role))) {
    return (
      <AccessDenied
        message="El panel docente requiere rol de Docente."
        roles={context.roles}
        requiredRoles={allowed}
      />
    )
  }

  return <>{children}</>
}
