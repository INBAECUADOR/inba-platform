'use client'

import { useAuth } from '@/hooks/useAuth'
import { hasRole } from '@/lib/auth/roles'
import { Users, GraduationCap, ClipboardCheck, Award, BookOpen, TrendingUp, Calendar, Loader2, Shield, CreditCard, Bell, Settings } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'

const stats = [
  { label: 'Usuarios totales', value: '1,247', change: '+12%', icon: Users, color: 'text-primary' },
  { label: 'Cursos activos', value: '24', change: '+3', icon: GraduationCap, color: 'text-blue-600' },
  { label: 'Certificados emitidos', value: '1,089', change: '+45', icon: Award, color: 'text-amber-600' },
  { label: 'Ingresos mensuales', value: '$12,450', change: '+18%', icon: TrendingUp, color: 'text-green-600' },
  { label: 'Evaluaciones pendientes', value: '23', change: '-5', icon: ClipboardCheck, color: 'text-amber-600' },
  { label: 'Afiliaciones activas', value: '312', change: '+8', icon: Shield, color: 'text-purple-600' },
]

const quickActions = [
  { label: 'Crear usuario', href: '/app/admin/usuarios/crear', icon: Users, color: 'bg-primary/10 text-primary' },
  { label: 'Nuevo curso', href: '/app/admin/cursos/crear', icon: GraduationCap, color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Crear evaluación', href: '/app/admin/evaluaciones/crear', icon: ClipboardCheck, color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Emitir certificado', href: '/app/admin/certificados/emitir', icon: Award, color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Gestionar afiliaciones', href: '/app/admin/afiliaciones', icon: Shield, color: 'bg-purple-500/10 text-purple-600' },
  { label: 'Ver reportes', href: '/app/admin/reportes', icon: TrendingUp, color: 'bg-green-500/10 text-green-600' },
]

const recentUsers = [
  { id: 1, nombre: 'Carlos Mendoza', email: 'carlos.mendoza@email.com', rol: 'Estudiante', estado: 'Activo', fecha: '15 Oct 2026' },
  { id: 2, nombre: 'Ana Rodríguez', email: 'ana.rodriguez@email.com', rol: 'Docente', estado: 'Activo', fecha: '14 Oct 2026' },
  { id: 3, nombre: 'Luis Fernández', email: 'luis.fernandez@email.com', rol: 'Afiliado', estado: 'Pendiente', fecha: '13 Oct 2026' },
  { id: 4, nombre: 'María González', email: 'maria.gonzalez@email.com', rol: 'Estudiante', estado: 'Activo', fecha: '12 Oct 2026' },
  { id: 5, nombre: 'Pedro Silva', email: 'pedro.silva@email.com', rol: 'Admin', estado: 'Activo', fecha: '11 Oct 2026' },
]

const recentCourses = [
  { id: 1, nombre: 'Fundamentos del culturismo natural', codigo: 'MOD-1', docente: 'Dr. Carlos Ruiz', alumnos: 28, estado: 'Publicado' },
  { id: 2, nombre: 'Biomecánica del ejercicio', codigo: 'MOD-3', docente: 'Dra. Patricia Vega', alumnos: 22, estado: 'Publicado' },
  { id: 3, nombre: 'Nutrición deportiva avanzada', codigo: 'MOD-8', docente: 'Dr. Roberto Paredes', alumnos: 19, estado: 'Borrador' },
  { id: 4, nombre: 'Psicología deportiva', codigo: 'MOD-10', docente: 'Dra. Lucía Morales', alumnos: 15, estado: 'Publicado' },
]

export default function AdminPage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="container-inba py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Cargando panel administrador...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!hasRole(profile?.roles || [], 'admin_general')) {
    return (
      <div className="container-inba py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Acceso denegado</h1>
        <p className="text-muted-foreground mb-4">Se requiere rol de Administrador General</p>
        <p className="text-sm text-muted-foreground">Tu rol actual: {profile?.roles?.join(', ') || 'ninguno'}</p>
      </div>
    )
  }

  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Administrador</h1>
          <p className="text-muted-foreground mt-1">Gestión completa del sistema INBA Ecuador</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/admin/usuarios/crear">
            <Button className="gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Nuevo usuario
            </Button>
          </Link>
        </div>
      </header>

      <section aria-label="Estadísticas principales">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-l-4 border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-sm font-medium mt-1" style={{ color: stat.change.startsWith('+') ? 'green' : 'red' }}>{stat.change} vs mes anterior</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '10' }}>
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Acciones rápidas">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Acciones rápidas</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="card-inba p-6 space-y-4 transition-all hover:shadow-lg hover:border-primary/50 group">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: action.color }}>
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                Ir <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Usuarios recientes">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Usuarios recientes</h2>
          <Link href="/app/admin/usuarios" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="card-inba overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-muted-foreground">Usuario</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Email</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Rol</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Registro</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-foreground">{user.nombre}</p>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <Badge variant={user.rol === 'Admin' ? 'destructive' : user.rol === 'Docente' ? 'default' : user.rol === 'Afiliado' ? 'secondary' : 'outline'}>{user.rol}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.estado === 'Activo' ? 'success' : 'warning'}>
                      {user.estado}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.fecha}</td>
                  <td className="p-4 text-right">
                    <Link href={`/app/admin/usuarios/${user.id}`} className="btn-outline text-sm">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Cursos recientes">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Cursos recientes</h2>
          <Link href="/app/admin/cursos" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recentCourses.map((course) => (
            <article key={course.id} className="card-inba p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <Badge variant="default">{course.codigo}</Badge>
                  <h3 className="text-xl font-semibold text-foreground truncate mt-1">{course.nombre}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Docente: {course.docente}</p>
                </div>
                <Badge variant={course.estado === 'Publicado' ? 'success' : course.estado === 'Borrador' ? 'secondary' : 'outline'}>{course.estado}</Badge>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">Alumnos inscritos</span>
                    <span className="text-muted-foreground">{course.alumnos}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <Badge variant={course.estado === 'Publicado' ? 'success' : 'outline'}>{course.estado}</Badge>
                  <Link href={`/app/admin/cursos/${course.id}`} className="btn-outline text-sm flex-1 justify-center">Gestionar</Link>
                  <Link href={`/app/admin/cursos/${course.id}/alumnos`} className="btn-outline text-sm">Ver alumnos</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}