import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import { ROLE_LABELS, type UserRole } from '@/lib/auth/roles'

interface AccessDeniedProps {
  title?: string
  message?: string
  roles?: UserRole[]
  requiredRoles?: UserRole[]
}

export function AccessDenied({
  title = 'Acceso denegado',
  message = 'No tienes permisos para ver esta seccion.',
  roles = [],
  requiredRoles = [],
}: AccessDeniedProps) {
  const current = roles.map((role) => ROLE_LABELS[role] ?? role).join(', ') || 'ninguno'
  const required = requiredRoles.map((role) => ROLE_LABELS[role] ?? role).join(' o ')

  return (
    <div className="container-inba py-16 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
        {required && (
          <p className="text-sm text-muted-foreground">
            Se requiere rol: <span className="font-medium text-foreground">{required}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          Tu rol actual: <span className="font-medium text-foreground">{current}</span>
        </p>
        <div className="flex gap-2">
          <Link href="/app" className="btn-outline">
            Ir a mi panel
          </Link>
          <Link href="/" className="btn-primary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
