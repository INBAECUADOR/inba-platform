import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Clock, Monitor, CheckCircle, ArrowRight, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Formación - INBA Ecuador',
  description: 'Programas de formación y certificación de entrenadores de culturismo natural de INBA Ecuador.',
}

interface CursoRow {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  objetivos: string
  requisitos: string | null
  duracion_horas: number
  modalidad: string
}

interface ModuloRow {
  curso_id: string
  orden: number
  nombre: string
  descripcion: string | null
}

const MODALIDAD_LABEL: Record<string, string> = {
  virtual: 'Virtual',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
}

export default async function FormacionPage() {
  const supabase = await createClient()

  const [{ data: cursos }, { data: modulos }] = await Promise.all([
    supabase
      .from('cursos')
      .select('id, codigo, nombre, descripcion, objetivos, requisitos, duracion_horas, modalidad')
      .eq('estado', 'publicado')
      .order('created_at', { ascending: true }),
    supabase.from('modulos').select('curso_id, orden, nombre, descripcion').order('orden', { ascending: true }),
  ])

  const modulosPorCurso = new Map<string, ModuloRow[]>()
  for (const modulo of (modulos ?? []) as ModuloRow[]) {
    const lista = modulosPorCurso.get(modulo.curso_id) ?? []
    lista.push(modulo)
    modulosPorCurso.set(modulo.curso_id, lista)
  }

  const rows = (cursos ?? []) as CursoRow[]

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-background to-muted/50">
        <div className="container-inba py-16 sm:py-20">
          <div className="max-w-3xl space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
              <span className="text-sm font-semibold uppercase tracking-wide">Formación</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Certificación de <span className="text-gradient-gold">Entrenadores</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Programa basado en evidencia científica para formar entrenadores de culturismo natural con estándares
              profesionales.
            </p>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Link href="/register" className="btn-primary gap-2">
                Iniciar inscripción
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/formacion/metodologia" className="btn-outline gap-2">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Conocer la metodología
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-inba">
        <div className="container-inba space-y-8">
          <header className="max-w-2xl space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Programas disponibles</h2>
            <p className="text-muted-foreground">
              Contenido vigente publicado por la administración académica de INBA Ecuador.
            </p>
          </header>

          {rows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
                <p className="mt-4 font-medium text-foreground">Todavía no hay programas publicados</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cuando la administración publique un programa aparecerá en esta sección.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {rows.map((curso) => {
                const modulosCurso = modulosPorCurso.get(curso.id) ?? []
                return (
                  <Card key={curso.id}>
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{curso.codigo}</Badge>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          {curso.duracion_horas} horas
                        </Badge>
                        <Badge variant="outline" className="gap-1">
                          <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
                          {MODALIDAD_LABEL[curso.modalidad] ?? curso.modalidad}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl">{curso.nombre}</CardTitle>
                      <p className="text-muted-foreground">{curso.descripcion}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground">Objetivos</h3>
                          <p className="whitespace-pre-line text-sm text-muted-foreground">{curso.objetivos}</p>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground">Requisitos</h3>
                          <p className="whitespace-pre-line text-sm text-muted-foreground">
                            {curso.requisitos || 'Los requisitos se detallan en la convocatoria vigente.'}
                          </p>
                        </div>
                      </div>

                      {modulosCurso.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground">
                            Plan de estudios ({modulosCurso.length} módulos)
                          </h3>
                          <ol className="grid gap-2 sm:grid-cols-2">
                            {modulosCurso.map((modulo) => (
                              <li key={`${modulo.curso_id}-${modulo.orden}`} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                                <span className="text-muted-foreground">
                                  <span className="font-medium text-foreground">Módulo {modulo.orden}:</span>{' '}
                                  {modulo.nombre}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      <div className="pt-2">
                        <Link href="/register" className="btn-primary gap-2">
                          Inscribirme en este programa
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
