import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth/server'
import { ROLE_LABELS } from '@/lib/auth/roles'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PerfilPage() {
  const context = await getSessionContext()

  if (!context.ok) {
    return (
      <div className="container-inba py-8">
        <p className="text-muted-foreground">No se pudo cargar tu perfil.</p>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, dni, birth_date, address, emergency_contact, created_at')
    .eq('id', context.userId)
    .maybeSingle()

  const fields: Array<{ label: string; value: string }> = [
    { label: 'Nombre completo', value: profile?.full_name || '—' },
    { label: 'Correo electrónico', value: profile?.email || context.email || '—' },
    { label: 'Cédula / DNI', value: profile?.dni || '—' },
    { label: 'Teléfono', value: profile?.phone || '—' },
    { label: 'Fecha de nacimiento', value: formatDate(profile?.birth_date) },
    { label: 'Dirección', value: profile?.address || '—' },
    { label: 'Contacto de emergencia', value: profile?.emergency_contact || '—' },
    { label: 'Miembro desde', value: formatDate(profile?.created_at) },
  ]

  return (
    <div className="container-inba py-8 space-y-6">
      <header className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <UserCircle className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi perfil</h1>
          <p className="text-muted-foreground mt-1">Datos registrados en INBA Ecuador</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {context.roles.length > 0 ? (
              context.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {ROLE_LABELS[role] ?? role}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Sin rol asignado</Badge>
            )}
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label}>
                <dt className="text-sm text-muted-foreground">{field.label}</dt>
                <dd className="text-sm font-medium text-foreground break-words">{field.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-xs text-muted-foreground">
            Para corregir un dato escribe a la administración: la edición desde el panel todavía no está habilitada.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
