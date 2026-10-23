'use client'

import { useAuth } from '@/hooks/useAuth'
import { GraduationCap, ClipboardCheck, Award, BookOpen, Calendar, Trophy, TrendingUp, Target } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

const quickActions = [
  { label: 'Mis Cursos', href: '/app/estudiante/cursos', icon: GraduationCap, description: 'Ver mis cursos y progreso', color: 'bg-primary/10 text-primary' },
  { label: 'Evaluaciones', href: '/app/estudiante/evaluaciones', icon: ClipboardCheck, description: 'Exámenes y tareas pendientes', color: 'bg-blue-500/10 text-blue-600' },
  { label: 'Calificaciones', href: '/app/estudiante/calificaciones', icon: Award, description: 'Ver mis notas y feedback', color: 'bg-amber-500/10 text-amber-600' },
  { label: 'Prácticas', href: '/app/estudiante/practicas', icon: BookOpen, description: 'Sesiones presenciales', color: 'bg-green-500/10 text-green-600' },
  { label: 'Calendario', href: '/app/estudiante/calendario', icon: Calendar, description: 'Eventos y fechas importantes', color: 'bg-purple-500/10 text-purple-600' },
  { label: 'Certificados', href: '/app/estudiante/certificados', icon: Trophy, description: 'Mis certificados emitidos', color: 'bg-amber-500/10 text-amber-600' },
]

const stats = [
  { label: 'Cursos activos', value: '3', icon: GraduationCap, color: 'text-primary' },
  { label: 'Exámenes pendientes', value: '2', icon: ClipboardCheck, color: 'text-blue-600' },
  { label: 'Promedio actual', value: '8.7', icon: TrendingUp, color: 'text-amber-600' },
  { label: 'Progreso certificación', value: '65%', icon: Target, color: 'text-green-600' },
]

export default function EstudiantePage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="container-inba py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <svg className="h-12 w-12 animate-spin text-primary mx-auto" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-muted-foreground">Cargando tu panel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Academia</h1>
          <p className="text-muted-foreground mt-1">Bienvenido a tu panel de estudiante INBA</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/estudiante/cursos">
            <Button className="gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo curso
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
          <Link href="/app/estudiante/cursos" className="text-sm font-medium text-primary hover:underline">
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
              <p className="text-sm text-muted-foreground">{action.description}</p>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                Ir <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Próximas evaluaciones">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Próximas evaluaciones</h2>
          <Link href="/app/estudiante/evaluaciones" className="text-sm font-medium text-primary hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="card-inba overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-muted-foreground">Evaluación</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Curso</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Fecha límite</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">Examen Módulo 3: Biomecánica</p>
                    <p className="text-sm text-muted-foreground">Tipo: Cuestionario · 20 preguntas</p>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">Módulo 3: Biomecánica</td>
                <td className="p-4 text-muted-foreground">25 Oct 2026, 23:59</td>
                <td className="p-4">
                  <Badge variant="secondary">Pendiente</Badge>
                </td>
                <td className="p-4 text-right">
                  <Link href="/app/estudiante/evaluaciones/1" className="btn-primary text-sm">Iniciar</Link>
                </td>
              </tr>
              <tr className="border-b border-border hover:bg-muted/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">Tarea: Análisis de caso - Sentadilla</p>
                    <p className="text-sm text-muted-foreground">Tipo: Respuesta corta · Entrega archivo</p>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">Módulo 4: Biomecánica</td>
                <td className="p-4 text-muted-foreground">30 Oct 2026, 23:59</td>
                <td className="p-4">
                  <Badge variant="outline">Borrador guardado</Badge>
                </td>
                <td className="p-4 text-right">
                  <Link href="/app/estudiante/evaluaciones/2" className="btn-outline text-sm">Continuar</Link>
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="p-4">
                  <div>
                    <p className="font-medium text-foreground">Examen Final Integrador</p>
                    <p className="text-sm text-muted-foreground">Tipo: Cuestionario · 100 preguntas</p>
                  </div>
                </td>
                <td className="p-4 text-muted-foreground">Certificación Integrador</td>
                <td className="p-4 text-muted-foreground">15 Nov 2026, 23:59</td>
                <td className="p-4">
                  <Badge variant="outline">No iniciado</Badge>
                </td>
                <td className="p-4 text-right">
                  <span className="text-muted-foreground text-sm">Bloqueado</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Progreso de certificación">
        <div className="card-inba p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Progreso hacia certificación</h2>
            <Badge className="bg-primary/10 text-primary">65% completado</Badge>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Módulos completados</span>
                <span className="text-muted-foreground">8 de 12 módulos</span>
              </div>
              <Progress value={67} className="h-3" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Exámenes de módulo aprobados</span>
                <span className="text-muted-foreground">7 de 11 exámenes</span>
              </div>
              <Progress value={64} className="h-3" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Prácticas presenciales</span>
                <span className="text-muted-foreground">2 de 4 sesiones</span>
              </div>
              <Progress value={50} className="h-3" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Examen final integrador</span>
                <span className="text-muted-foreground">Pendiente</span>
              </div>
              <Progress value={0} className="h-3" />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Link href="/app/estudiante/certificados">
              <Button variant="outline">Ver requisitos detallados</Button>
            </Link>
            <Link href="/app/estudiante/cursos">
              <Button>Continuar siguiente módulo</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}