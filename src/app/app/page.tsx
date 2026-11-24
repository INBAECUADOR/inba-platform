import { redirect } from 'next/navigation'
import { getSessionContext } from '@/lib/auth/server'
import { AccessDenied } from '@/components/layout/access-denied'
import type { UserRole } from '@/lib/auth/roles'

export const dynamic = 'force-dynamic'

const PANELS: Array<{ roles: UserRole[]; href: string }> = [
  { roles: ['admin_general', 'admin_academico'], href: '/app/admin' },
  { roles: ['docente'], href: '/app/docente' },
  { roles: ['estudiante'], href: '/app/estudiante' },
  { roles: ['afiliado'], href: '/app/afiliado' },
]

export default async function AppIndexPage() {
  const context = await getSessionContext()

  if (!context.ok) {
    if (context.reason === 'unauthenticated') {
      redirect('/login?redirect=/app')
    }

    if (context.reason === 'not_configured') {
      return (
        <AccessDenied
          title="Base de datos no configurada"
          message="Faltan las variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno."
        />
      )
    }

    return (
      <AccessDenied
        title="Perfil incompleto"
        message="Tu usuario existe pero no tiene perfil ni rol asignado. Contacta al administrador."
      />
    )
  }

  const panel = PANELS.find((entry) => entry.roles.some((role) => context.roles.includes(role)))

  if (!panel) {
    return (
      <AccessDenied
        title="Sin rol asignado"
        message="Tu cuenta no tiene un rol activo. Contacta al administrador para que te asigne uno."
        roles={context.roles}
        requiredRoles={['estudiante', 'docente', 'afiliado', 'admin_general']}
      />
    )
  }

  redirect(panel.href)
}
