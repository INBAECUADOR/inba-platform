'use client'

import { useAuth } from '@/hooks/useAuth'
import { GraduationCap, Users, ClipboardCheck, Award, BookOpen, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'

const stats = [
  { label: 'Cursos asignados', value: '3', icon: GraduationCap, color: 'text-primary' },
  { label: 'Alumnos totales', value: '87', icon: Users, color: 'text-blue-600' },
  { label: 'Evaluaciones pendientes', value: '12', icon: ClipboardCheck, color: 'text-amber-600' },
  { label: 'Prácticas programadas', value: '4', icon: BookOpen, color: 'text-green-600' },
]

const quickActions = [
  { label: 'Crear evaluación', href: '/app/docente/evaluaciones/crear', icon: ClipboardCheck, color: 'bg-primary/10 text-primary' },
  { label: 'Calificar entregas', href: '/app/docente/calificar', icon: Award, color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Programar práctica', href: '/app/docente/practicas/crear', icon: BookOpen, color: 'bg-green-500/10 text-green-600' },
  { label: 'Ver alumnos', href: '/app/docente/alumnos', icon: Users, color: 'bg-blue-500/10 text-blue-600' },
]

const myCourses = [
  { id: 1, nombre: 'Fundamentos del culturismo natural', codigo: 'MOD-1', alumnos: 28, progreso: 78, estado: 'En curso' },
  { id: 2, nombre: 'Biomecánica del ejercicio', codigo: 'MOD-3', alumnos: 22, progreso: 45, estado: 'En curso' },
  { id: 3, nombre: 'Nutrición deportiva', codigo: 'MOD-8', alumnos: 19, progreso: 12, estado: 'Por iniciar' },
]

const pendingGrading = [
  { id: 1, titulo: 'Examen Módulo 2: Anatomía', curso: 'Módulo 2: Anatomía', entregas: 15, pendientes: 3, fechaLimite: '20 Oct 2026' },
  { id: 2, titulo: 'Tarea: Análisis biomecánico curl', curso: 'Módulo 3: Biomecánica', entregas: 18, pendientes: 5, fechaLimite: '25 Oct 2026' },
  { id: 3, titulo: 'Práctica: Evaluación técnica sentadilla', curso: 'Módulo 12: Prácticas', entregas: 8, pendientes: 2, fechaLimite: '30 Oct 2026' },
]

export default function DocentePage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="container-inba py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Cargando panel docente...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel Docente</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus cursos, evaluaciones y alumnos</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/docente/evaluaciones/crear">
            <Button className="gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Nueva evaluación
            </Button>
          </Link>
        </div>
      </header>

      <section aria-label="Estadísticas principales">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-l-4 border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} className="card-inba p-6 space-y-4 transition-all hover:shadow-lg hover:border-primary/50 group">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: action.color }}>
                <action.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</h3>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                Ir <span className="h-4 w-4"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg></span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Mis cursos">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Mis cursos asignados</h2>
          <Link href="/app/docente/cursos" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {myCourses.map((course) => (
            <article key={course.id} className="card-inba overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">{course.codigo}</Badge>
                      <Badge variant={course.estado === 'En curso' ? 'default' : 'secondary'}>{course.estado}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground truncate">{course.nombre}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{course.alumnos} alumnos inscritos</p>
                  </div>
                  <div className={cn(
                    'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
                    course.progreso === 100 ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                  )}>
                    {course.progreso === 100 ? (
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <GraduationCap className="h-6 w-6" />
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium">Progreso del curso</span>
                      <span className="text-muted-foreground">{course.progreso}%</span>
                    </div>
                    <Progress value={course.progreso} className="h-2" />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-4 w-4"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg></span>
                    <span>{course.alumnos} alumnos</span>
                  </div>
                  <span className="flex-1" />
                  <Badge variant={course.estado === 'En curso' ? 'default' : 'outline'}>
                    {course.estado}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Link href={`/app/docente/cursos/${course.id}`}>
                    <Button className="flex-1 justify-center gap-2" variant={course.progreso === 100 ? 'outline' : 'default'}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Gestionar curso
                    </Button>
                  </Link>
                  <Link href={`/app/docente/cursos/${course.id}/alumnos`}>
                    <Button variant="outline" className="gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h18a7 7 0 00-7-7z" /></svg>
                      Ver alumnos
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Evaluaciones pendientes de calificar">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Pendientes de calificar</h2>
          <Link href="/app/docente/calificar" className="text-sm font-medium text-primary hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="space-y-4">
          {pendingGrading.map((item) => (
            <article key={item.id} className="card-inba p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-foreground truncate">{item.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.curso}</p>
                </div>
                <Badge variant="warning">{item.pendientes} pendientes</Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{item.entregas} entregas totales</span>
                <span>•</span>
                <span>Límite: {item.fechaLimite}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Link href={`/app/docente/calificar/${item.id}`}>
                  <Button className="flex-1 justify-center gap-2" variant="default">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    Calificar
                  </Button>
                </Link>
                <Link href={`/app/docente/evaluaciones/${item.id}/detalle`}>
                  <Button variant="outline" className="gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.074 4.057-4.864 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" /></svg>
                    Detalle
                  </Button>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}