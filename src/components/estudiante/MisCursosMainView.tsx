'use client'

import { GraduationCap, Clock, TrendingUp, PlayCircle, CheckCircle, BookOpen, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'

interface Course {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  duracion_horas: number
  modalidad: string
  estado: string
  progreso: number
  modulos_completados: number
  total_modulos: number
  siguiente_leccion?: string
}

interface Enrollment {
  id: string
  curso_id: string
  estado: string
  fecha_inicio: string
  fecha_completada?: string
  curso: Course
  progreso: number
  modulos_completados: number
  total_modulos: number
}

interface MisCursosMainViewProps {
  activeEnrollments: Enrollment[]
  pendingEnrollments: Enrollment[]
  completedEnrollments: Enrollment[]
}

function CourseCard({ enrollment }: { enrollment: Enrollment }) {
  return (
    <article key={enrollment.id} className="card-inba overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default">{enrollment.curso.codigo}</Badge>
              <Badge variant="secondary">{enrollment.curso.modalidad}</Badge>
            </div>
            <h3 className="text-xl font-semibold text-foreground truncate">{enrollment.curso.nombre}</h3>
            <p className="text-sm text-muted-foreground mt-1">{enrollment.curso.descripcion}</p>
          </div>
          <div className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0',
            enrollment.progreso === 100 ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
          )}>
            {enrollment.progreso === 100 ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <GraduationCap className="h-6 w-6" />
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Progreso general</span>
              <span className="text-muted-foreground">{enrollment.progreso}%</span>
            </div>
            <Progress value={enrollment.progreso} className="h-2" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium">Módulos completados</span>
              <span className="text-muted-foreground">{enrollment.modulos_completados} / {enrollment.total_modulos}</span>
            </div>
            <Progress value={enrollment.total_modulos > 0 ? Math.round((enrollment.modulos_completados / enrollment.total_modulos) * 100) : 0} className="h-2" />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{enrollment.curso.duracion_horas}h totales</span>
          </div>
          <span className="flex-1" />
          <Badge variant={enrollment.estado === 'activa' ? 'success' : 'outline'}>
            {enrollment.estado}
          </Badge>
        </div>

        <div className="flex gap-2">
          <Link href={`/app/estudiante/cursos/${enrollment.curso.id}`}>
            <Button className="flex-1 justify-center gap-2" variant={enrollment.progreso === 100 ? 'outline' : 'default'}>
              {enrollment.progreso === 100 ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Ver certificado
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4" />
                  Continuar
                </>
              )}
            </Button>
          </Link>
          <Link href={`/app/estudiante/cursos/${enrollment.curso.id}/progreso`}>
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Progreso
            </Button>
          </Link>
        </div>
      </div>
    </article>
  )
}

function PendingCard({ enrollment }: { enrollment: Enrollment }) {
  return (
    <article key={enrollment.id} className="card-inba p-6 space-y-4 border-amber-500/20 border-l-4">
      <div className="flex items-start justify-between">
        <div>
          <Badge variant="secondary">{enrollment.curso.codigo}</Badge>
          <h3 className="text-xl font-semibold text-foreground mt-1">{enrollment.curso.nombre}</h3>
          <p className="text-sm text-muted-foreground mt-1">Solicitud enviada el {new Date(enrollment.fecha_inicio).toLocaleDateString('es-EC')}</p>
        </div>
        <Badge variant="warning">Pendiente</Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        Tu solicitud está siendo revisada por el equipo académico. Recibirás una notificación cuando sea aprobada.
      </div>
    </article>
  )
}

function CompletedCard({ enrollment }: { enrollment: Enrollment }) {
  return (
    <article key={enrollment.id} className="card-inba p-6 space-y-4 border-green-500/20 border-l-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{enrollment.curso.codigo}</Badge>
            <Badge variant="success">Completado</Badge>
          </div>
          <h3 className="text-xl font-semibold text-foreground">{enrollment.curso.nombre}</h3>
          <p className="text-sm text-muted-foreground">Completado el {new Date(enrollment.fecha_completada || enrollment.fecha_inicio).toLocaleDateString('es-EC')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="h-8 w-8 text-amber-500" />
          <div>
            <p className="font-medium text-foreground">Certificado disponible</p>
            <p className="text-sm text-muted-foreground">Nº {enrollment.curso.codigo}-{enrollment.id.slice(0, 8)}</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/app/estudiante/certificados/${enrollment.id}`}>
              <Button variant="outline" className="gap-2 flex-1 justify-center">
                <Award className="h-4 w-4" />
                Ver certificado
              </Button>
            </Link>
            <Link href={`/app/estudiante/cursos/${enrollment.curso.id}`}>
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Repasar contenido
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16">
      <GraduationCap className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-foreground mb-2">No tienes cursos aún</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Explora el catálogo de formación y solicita tu matrícula en los cursos que más te interesen.
      </p>
      <Link href="/formacion">
        <Button className="gap-2" size="lg">
          <GraduationCap className="h-5 w-5" />
          Explorar catálogo
        </Button>
      </Link>
    </div>
  )
}

export function MisCursosMainView({ activeEnrollments, pendingEnrollments, completedEnrollments }: MisCursosMainViewProps) {
  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Cursos</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu progreso y accede a tus módulos</p>
        </div>
        <Link href="/formacion">
          <Button variant="outline" className="gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Explorar catálogo
          </Button>
        </Link>
      </header>

      <div className="border-b border-border">
        <nav className="flex gap-4 -mb-px" aria-label="Filtros de cursos">
          <button className="pb-4 text-sm font-medium text-primary border-b-2 border-primary" aria-current="page">
            En curso ({activeEnrollments.length})
          </button>
          <button className="pb-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pendientes ({pendingEnrollments.length})
          </button>
          <button className="pb-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Completados ({completedEnrollments.length})
          </button>
        </nav>
      </div>

      {activeEnrollments.length > 0 && (
        <section aria-label="Cursos en curso">
          <h2 className="text-2xl font-bold text-foreground mb-6">En curso</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeEnrollments.map((enrollment) => <CourseCard enrollment={enrollment} />)}
          </div>
        </section>
      )}

      {pendingEnrollments.length > 0 && (
        <section aria-label="Solicitudes pendientes" className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Solicitudes pendientes de aprobación</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingEnrollments.map((enrollment) => <PendingCard enrollment={enrollment} />)}
          </div>
        </section>
      )}

      {completedEnrollments.length > 0 && (
        <section aria-label="Cursos completados" className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Completados</h2>
            <Link href="/app/estudiante/certificados" className="text-sm font-medium text-primary hover:underline">
              Ver certificados →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedEnrollments.map((enrollment) => <CompletedCard enrollment={enrollment} />)}
          </div>
        </section>
      )}

      {activeEnrollments.length === 0 && pendingEnrollments.length === 0 && completedEnrollments.length === 0 && (
        <EmptyState />
      )}
    </div>
  )
}