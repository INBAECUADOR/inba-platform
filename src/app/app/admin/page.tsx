import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { extractRoleName, ROLE_LABELS, type UserRole } from '@/lib/auth/roles'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, ClipboardCheck, Award, BookOpen, Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

const quickActions = [
  { label: 'Usuarios', href: '/app/admin/usuarios', description: 'Ver cuentas y roles', icon: Users },
  { label: 'Cursos', href: '/app/admin/cursos', description: 'Programa académico y matrículas', icon: GraduationCap },
]

const pendingActions = [
  { label: 'Crear usuario', description: 'Alta manual desde el panel', icon: Users },
  { label: 'Crear curso', description: 'Editor de cursos y módulos', icon: BookOpen },
  { label: 'Emitir certificado', description: 'Emisión con firma y QR', icon: Award },
  { label: 'Gestionar afiliaciones', description: 'Altas y renovaciones', icon: Shield },
]

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    usuariosCount,
    cursosCount,
    evaluacionesCount,
    certificadosCount,
    matriculasCount,
    afiliacionesCount,
    { data: recentProfiles },
    { data: roleRows },
    { data: recentCursos },
    { data: modulos },
    { data: matriculas },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('cursos').select('id', { count: 'exact', head: true }),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }),
    supabase.from('certificados').select('id', { count: 'exact', head: true }).eq('estado', 'vigente'),
    supabase.from('matriculas').select('id', { count: 'exact', head: true }).in('estado', ['activa', 'pendiente']),
    supabase.from('afiliaciones').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id, email, full_name, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('user_roles').select('user_id, roles(name)'),
    supabase.from('cursos').select('id, codigo, nombre, estado').order('created_at', { ascending: true }).limit(5),
    supabase.from('modulos').select('curso_id'),
    supabase.from('matriculas').select('curso_id, estado'),
  ])

  const rolesPorUsuario = new Map<string, UserRole[]>()
  for (const row of roleRows ?? []) {
    const list = rolesPorUsuario.get(row.user_id) ?? []
    const role = extractRoleName((row as { roles?: unknown }).roles)
    if (role) list.push(role)
    rolesPorUsuario.set(row.user_id, list)
  }

  const modulosPorCurso = new Map<string, number>()
  for (const modulo of modulos ?? []) {
    modulosPorCurso.set(modulo.curso_id, (modulosPorCurso.get(modulo.curso_id) ?? 0) + 1)
  }

  const alumnosPorCurso = new Map<string, number>()
  for (const matricula of matriculas ?? []) {
    if (matricula.estado === 'cancelada' || matricula.estado === 'abandonada') continue
    alumnosPorCurso.set(matricula.curso_id, (alumnosPorCurso.get(matricula.curso_id) ?? 0) + 1)
  }

  const stats = [
    { label: 'Usuarios', value: usuariosCount.count ?? 0, icon: Users },
    { label: 'Cursos', value: cursosCount.count ?? 0, icon: GraduationCap },
    { label: 'Matrículas activas', value: matriculasCount.count ?? 0, icon: GraduationCap },
    { label: 'Evaluaciones', value: evaluacionesCount.count ?? 0, icon: ClipboardCheck },
    { label: 'Certificados vigentes', value: certificadosCount.count ?? 0, icon: Award },
    { label: 'Afiliaciones', value: afiliacionesCount.count ?? 0, icon: Shield },
  ]

  return (
    <div className="container-inba space-y-8 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Administrador</h1>
          <p className="mt-1 text-muted-foreground">Gestión de INBA Ecuador</p>
        </div>
        <Link href="/app/admin/usuarios" className="btn-primary">
          Ver usuarios
        </Link>
      </header>

      <section aria-label="Estadísticas principales">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-l-4 border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Acciones disponibles">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Acciones</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="card-inba group space-y-2 p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <action.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="font-semibold text-foreground group-hover:text-primary">{action.label}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </Link>
          ))}
          {pendingActions.map((action) => (
            <div key={action.label} className="card-inba space-y-2 p-6 opacity-70">
              <action.icon className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <h3 className="flex items-center gap-2 font-semibold text-foreground">
                {action.label}
                <Badge variant="outline" className="text-[10px]">
                  Próximamente
                </Badge>
              </h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Usuarios recientes">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Usuarios recientes</h2>
          <Link href="/app/admin/usuarios" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            {(recentProfiles ?? []).length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Sin usuarios registrados.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 font-medium">Nombre</th>
                    <th className="px-6 py-3 font-medium">Correo</th>
                    <th className="px-6 py-3 font-medium">Rol</th>
                    <th className="px-6 py-3 font-medium">Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {(recentProfiles ?? []).map((profile) => {
                    const roles = rolesPorUsuario.get(profile.id) ?? []
                    return (
                      <tr key={profile.id} className="border-t border-border">
                        <td className="px-6 py-3 font-medium text-foreground">{profile.full_name || '—'}</td>
                        <td className="px-6 py-3 text-muted-foreground">{profile.email}</td>
                        <td className="px-6 py-3">
                          {roles.length > 0 ? (
                            <Badge variant="secondary">{ROLE_LABELS[roles[0]] ?? roles[0]}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Sin rol</span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-muted-foreground">{formatDate(profile.created_at)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Cursos">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Cursos</h2>
          <Link href="/app/admin/cursos" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Programa académico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(recentCursos ?? []).length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin cursos creados.</p>
            ) : (
              (recentCursos ?? []).map((curso) => (
                <div key={curso.id} className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{curso.nombre}</p>
                    <p className="text-sm text-muted-foreground">
                      {curso.codigo} · {modulosPorCurso.get(curso.id) ?? 0} módulos ·{' '}
                      {alumnosPorCurso.get(curso.id) ?? 0} alumnos
                    </p>
                  </div>
                  <Badge variant={curso.estado === 'publicado' ? 'default' : 'secondary'}>{curso.estado}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
