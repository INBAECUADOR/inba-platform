'use client'

import { Users, GraduationCap, ClipboardCheck, Award, BookOpen, UserCheck, Trophy, FileText, BarChart3, Shield, Settings, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'

const stats = [
  { label: 'Usuarios totales', value: '1,247', change: '+12%', icon: Users, color: 'text-primary' },
  { label: 'Estudiantes activos', value: '892', change: '+8%', icon: GraduationCap, color: 'text-blue-600' },
  { label: 'Certificados emitidos', value: '156', change: '+23%', icon: Award, color: 'text-amber-600' },
  { label: 'Afiliaciones vigentes', value: '342', change: '+5%', icon: Award, color: 'text-green-600' },
  { label: 'Cursos publicados', value: '12', change: '0%', icon: GraduationCap, color: 'text-purple-600' },
  { label: 'Prácticas programadas', value: '8', change: '+2', icon: BookOpen, color: 'text-pink-600' },
]

const quickActions = [
  { label: 'Nuevo usuario', href: '/app/admin/usuarios/nuevo', icon: Users, color: 'bg-primary/10 text-primary' },
  { label: 'Crear curso', href: '/app/admin/cursos/nuevo', icon: GraduationCap, color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Nueva evaluación', href: '/app/admin/evaluaciones/nueva', icon: ClipboardCheck, color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Programar práctica', href: '/app/admin/practicas/nueva', icon: BookOpen, color: 'bg-green-500/10 text-green-600' },
  { label: 'Emitir certificado', href: '/app/admin/certificados/emitir', icon: Award, color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Nueva competencia', href: '/app/admin/competencias/nueva', icon: Trophy, color: 'bg-pink-500/10 text-pink-600' },
]

const recentUsers = [
  { id: 1, name: 'María González', email: 'maria.gonzalez@email.com', role: 'estudiante', status: 'Activo', date: '12 Oct 2026' },
  { id: 2, name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', role: 'docente', status: 'Activo', date: '11 Oct 2026' },
  { id: 3, name: 'Ana Martínez', email: 'ana.martinez@email.com', role: 'estudiante', status: 'Pendiente', date: '10 Oct 2026' },
  { id: 4, name: 'Luis Pérez', email: 'luis.perez@email.com', role: 'afiliado', status: 'Activo', date: '09 Oct 2026' },
  { id: 5, name: 'Carmen López', email: 'carmen.lopez@email.com', role: 'estudiante', status: 'Activo', date: '08 Oct 2026' },
]

const recentActivity = [
  { action: 'Nuevo usuario registrado', user: 'María González', time: 'Hace 15 min', type: 'user' },
  { action: 'Certificado emitido', user: 'Carlos Rodríguez', detail: 'Certificación Entrenadores 2026', time: 'Hace 1 hora', type: 'certificate' },
  { action: 'Evaluación calificada', user: 'Ana Martínez', detail: 'Examen Módulo 3 - Nota: 9.2', time: 'Hace 2 horas', type: 'grade' },
  { action: 'Nueva afiliación aprobada', user: 'Luis Pérez', detail: 'Tipo: Entrenador Certificado', time: 'Hace 3 horas', type: 'affiliation' },
  { action: 'Curso publicado', user: 'Sistema', detail: 'Módulo 9: Recuperación y sueño', time: 'Hace 4 horas', type: 'course' },
]

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case 'user': return <Users className="h-5 w-5 text-primary" />
    case 'certificate': return <Award className="h-5 w-5 text-amber-600" />
    case 'grade': return <Award className="h-5 w-5 text-blue-600" />
    case 'affiliation': return <UserCheck className="h-5 w-5 text-green-600" />
    case 'course': return <GraduationCap className="h-5 w-5 text-purple-600" />
    default: return <Users className="h-5 w-5 text-primary" />
  }
}

function AdminDashboard() {
  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
          <p className="text-muted-foreground mt-1">Gestión completa del sistema INBA Ecuador</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/admin/usuarios/nuevo">
            <Button className="gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo usuario
            </Button>
          </Link>
          <Link href="/app/admin/cursos/nuevo">
            <Button variant="outline" className="gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo curso
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
                    <p className="text-sm font-medium mt-1 text-green-600">{stat.change} vs mes anterior</p>
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
          <Link href="/app/admin/acciones" className="text-sm font-medium text-primary hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="card-inba p-6 space-y-4 transition-all hover:shadow-lg hover:border-primary/50 group">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: action.color }}>
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                Ejecutar <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
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
                    <td className="p-4 font-medium text-foreground">{user.name}</td>
                    <td className="p-4 text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <Badge variant={user.role === 'admin_general' ? 'destructive' : user.role === 'admin_academico' ? 'default' : user.role === 'docente' ? 'success' : 'secondary'}>
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={user.status === 'Activo' ? 'success' : 'warning'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{user.date}</td>
                    <td className="p-4 text-right">
                      <Link href={`/app/admin/usuarios/${user.id}`} className="btn-outline text-sm">Ver</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-label="Actividad reciente">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Actividad reciente</h2>
            <Link href="/app/admin/auditoria" className="text-sm font-medium text-primary hover:underline">
              Ver auditoría completa →
            </Link>
          </div>
          <div className="card-inba space-y-4 p-6">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {(() => {
                    switch (activity.type) {
                      case 'user': return <Users className="h-5 w-5 text-primary" />
                      case 'certificate': return <Award className="h-5 w-5 text-amber-600" />
                      case 'grade': return <Award className="h-5 w-5 text-blue-600" />
                      case 'affiliation': return <UserCheck className="h-5 w-5 text-green-600" />
                      case 'course': return <GraduationCap className="h-5 w-5 text-purple-600" />
                      default: return <Users className="h-5 w-5 text-primary" />
                    }
                  })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.user} · {activity.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section aria-label="Estado del sistema">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Estado del sistema</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Salud del sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Base de datos</span>
                  <Badge variant="success">Operativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Autenticación</span>
                  <Badge variant="success">Operativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Almacenamiento</span>
                  <Badge variant="success">78% usado</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">API Response</span>
                  <Badge variant="success">45ms avg</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Uso de recursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CPU</span>
                    <span className="font-medium">34%</span>
                  </div>
                  <Progress value={34} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Memoria</span>
                    <span className="font-medium">62%</span>
                  </div>
                  <Progress value={62} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Disco</span>
                    <span className="font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Alertas recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <Badge variant="warning">Advertencia</Badge>
                  <span className="text-sm text-amber-800">Uso de disco al 78%. Considerar limpieza de logs antiguos.</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <Badge variant="info">Información</Badge>
                  <span className="text-sm text-blue-800">Backup completado exitosamente hace 2 horas.</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <Badge variant="success">Éxito</Badge>
                  <span className="text-sm text-green-800">156 certificados emitidos este mes.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

export default function AdminPage() {
  return <AdminDashboard />
}