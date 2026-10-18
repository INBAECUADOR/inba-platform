'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { GraduationCap, Clock, TrendingUp, PlayCircle, Lock, CheckCircle, BookOpen, ArrowRight, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
}

export default function MisCursosPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEnrollments() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('matriculas')
        .select(`
          id,
          estado,
          fecha_inicio,
          cursos:curso_id (
            id,
            codigo,
            nombre,
            descripcion,
            duracion_horas,
            modalidad,
            estado
          )
        `)
        .eq('user_id', (await createClient().auth.getUser()).data.user?.id)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // Calcular progreso para cada matrícula
      const enrollmentsWithProgress = await Promise.all(
        (data || []).map(async (enrollment: any) => {
          const { data: progress } = await createClient()
            .from('progreso_lecciones')
            .select('estado, lecciones!inner(modulo_id)')
            .eq('matricula_id', enrollment.id)

          const totalLecciones = progress?.length || 0
          const completadas = progress?.filter((p: any) => p.estado === 'completada').length || 0
          const progreso = totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0

          // Contar módulos completados
          const { data: modulos } = await createClient()
            .from('modulos')
            .select('id')
            .eq('curso_id', enrollment.cursos.id)

          const { data: modulosCompletados } = await createClient()
            .from('progreso_lecciones')
            .select('lecciones!inner(modulo_id)')
            .eq('matricula_id', enrollment.id)
            .eq('estado', 'completada')

          const modulosIdsCompletados = new Set(
            (modulosCompletados || []).map((p: any) => p.lecciones?.modulo_id)
          )
          const modulosCompletadosCount = modulosIdsCompletados.size

          return {
            ...enrollment,
            curso: enrollment.cursos,
            progreso,
            modulos_completados: modulosCompletadosCount,
            total_modulos: modulos?.length || 0,
          }
        })
      )

      setEnrollments(enrollmentsWithProgress)
      setLoading(false)
    }

    fetchEnrollments()
  }, [])

  if (loading) {
    return (
      <div className="container-inba py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <svg className="h-12 w-12 animate-spin text-primary mx-auto" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-muted-foreground">Cargando tus cursos...</p>
          </div>
        </div>
      </div>
    )
  }

  const activeEnrollments = enrollments.filter(e => e.estado === 'activa')
  const pendingEnrollments = enrollments.filter(e => e.estado === 'pendiente')
  const completedEnrollments = enrollments.filter(e => e.estado === 'completada')

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

      {/* Pestañas */}
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

      {/* Cursos en curso */}
      {activeEnrollments.length > 0 && (
        <section aria-label="Cursos en curso">
          <h2 className="text-2xl font-bold text-foreground mb-6">En curso</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeEnrollments.map((enrollment) => (
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
                      enrollment.curso.progreso === 100 ? 'bg-green-500/10 text-green-600' : 'bg-primary/10 text-primary'
                    )}>
                      {enrollment.curso.progreso === 100 ? (
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
                        <span className="text-muted-foreground">{enrollment.curso.progreso}%</span>
                      </div>
                      <Progress value={enrollment.curso.progreso} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-medium">Módulos completados</span>
                        <span className="text-muted-foreground">{enrollment.curso.modulos_completados} / {enrollment.curso.total_modulos}</span>
                      </div>
                      <Progress value={enrollment.curso.total_modulos > 0 ? Math.round((enrollment.curso.modulos_completados / enrollment.curso.total_modulos) * 100) : 0} className="h-2" />
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
                      <Button className="flex-1 justify-center gap-2" variant={enrollment.curso.progreso === 100 ? 'outline' : 'default'}>
                        {enrollment.curso.progreso === 100 ? (
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
            ))}
          </div>
        </section>
      )}

      {/* Solicitudes pendientes */}
      {pendingEnrollments.length > 0 && (
        <section aria-label="Solicitudes pendientes" className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Solicitudes pendientes de aprobación</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingEnrollments.map((enrollment) => (
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
            ))}
          </div>
        </section>
      )}

      {/* Cursos completados */}
      {completedEnrollments.length > 0 && (
        <section aria-label="Cursos completados" className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Completados</h2>
            <Link href="/app/estudiante/certificados" className="text-sm font-medium text-primary hover:underline">
              Ver certificados →
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedEnrollments.map((enrollment) => (
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
              </article>
            ))}
          </div>
        </section>
      )}

      {enrollments.length === 0 && (
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
      )}
    </div>
  )
}