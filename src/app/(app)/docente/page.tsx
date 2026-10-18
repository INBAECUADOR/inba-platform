'use client'

export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { GraduationCap, Users, ClipboardCheck, Award, BookOpen, TrendingUp, Calendar, Loader2, Shield } from 'lucide-react'
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

const roleDashboards: Record<string, { href: string; label: string; icon: any; description: string }> = {
  admin_general: { href: '/app/admin', label: 'Panel Administrador General', icon: Shield, description: 'Gestión completa del sistema' },
  admin_academico: { href: '/app/admin', label: 'Panel Admin Académico', icon: Shield, description: 'Gestión académica y certificaciones' },
  docente: { href: '/app/docente', label: 'Panel Docente', icon: Users, description: 'Gestión de cursos y alumnos' },
  estudiante: { href: '/app/estudiante', label: 'Mi Academia', icon: GraduationCap, description: 'Mis cursos, evaluaciones y certificados' },
  afiliado: { href: '/app/afiliado', label: 'Mi Perfil Afiliado', icon: Award, description: 'Gestión de afiliación y beneficios' },
}

export default function DocentePage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile) {
      const highestRole = profile.roles?.[0]
      if (highestRole && roleDashboards[highestRole]) {
        router.push(roleDashboards[highestRole].href)
      } else {
        router.push('/app/docente')
      }
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando tu panel...</p>
        </div>
      </div>
    )
  }

  const highestRole = useAuth().profile?.roles?.[0]
  const dashboard = highestRole ? roleDashboards[highestRole] : null

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            Redirigiendo a tu panel...
          </div>
        </div>

        {dashboard && (
          <div className="card-inba p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                <dashboard.icon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{dashboard.label}</h2>
                <p className="text-muted-foreground">{dashboard.description}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Redirigiendo automáticamente en 3 segundos...
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(roleDashboards).map(([role, dash]) => (
            <article
              key={role}
              className="card-inba p-6 space-y-4 transition-all hover:shadow-lg"
            >
              <div className="rounded-lg bg-primary/10 p-3 w-fit">
                <dash.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{dash.label}</h3>
              <p className="text-sm text-muted-foreground">{dash.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}