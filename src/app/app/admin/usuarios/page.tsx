import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { extractRoleName, ROLE_LABELS, type UserRole } from '@/lib/auth/roles'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  created_at: string
}

export default async function UsuariosPage() {
  const supabase = await createClient()

  const [{ data: profiles, error }, { data: roleRows }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
    supabase.from('user_roles').select('user_id, roles(name)'),
  ])

  const rolesPorUsuario = new Map<string, UserRole[]>()
  for (const row of roleRows ?? []) {
    const userRoles = rolesPorUsuario.get(row.user_id) ?? []
    const role = extractRoleName((row as { roles?: unknown }).roles)
    if (role) userRoles.push(role)
    rolesPorUsuario.set(row.user_id, userRoles)
  }

  const rows = (profiles ?? []) as ProfileRow[]

  return (
    <div className="container-inba py-8 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground mt-1">
            {error ? 'No se pudieron cargar los usuarios.' : `${rows.length} cuentas registradas`}
          </p>
        </div>
      </header>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium text-foreground">Sin usuarios registrados</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Cuentas</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Nombre</th>
                  <th className="py-2 pr-4 font-medium">Correo</th>
                  <th className="py-2 pr-4 font-medium">Roles</th>
                  <th className="py-2 font-medium">Alta</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((profile) => {
                  const roles = rolesPorUsuario.get(profile.id) ?? []
                  return (
                    <tr key={profile.id} className="border-t border-border">
                      <td className="py-3 pr-4 font-medium text-foreground">{profile.full_name || '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{profile.email}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {roles.length > 0 ? (
                            roles.map((role) => (
                              <Badge key={role} variant="secondary">
                                {ROLE_LABELS[role] ?? role}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">Sin rol</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{formatDate(profile.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">
        El alta manual de usuarios y la asignación de roles desde el panel están pendientes; por ahora se gestionan desde
        Supabase. <Link href="/app/admin" className="text-primary hover:underline">Volver al panel</Link>
      </p>
    </div>
  )
}
