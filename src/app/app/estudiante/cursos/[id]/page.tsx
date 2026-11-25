import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, CheckCircle, ChevronRight, Circle, Clock, GraduationCap, PlayCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface LeccionRow {
  id: string
  orden: number
  titulo: string
  tipo: string
  duracion_minutos: number | null
  es_obligatoria: boolean | null
}

interface TemaRow {
  id: string
  orden: number
  titulo: string
  descripcion: string | null
  duracion_minutos: number | null
  lecciones: LeccionRow[]
}

interface ModuloRow {
  id: string
  orden: number
  nombre: string
  descripcion: string | null
  duracion_horas: number | null
  temas: TemaRow[]
}

const MODALIDAD_LABEL: Record<string, string> = {
  virtual: 'Virtual',
  hibrido: 'Híbrido',
  presencial: 'Presencial',
}

export default async function CursoDetallePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: curso }, { data: modulos }, { data: matricula }] = await Promise.all([
    supabase
      .from('cursos')
      .select('id, codigo, nombre, descripcion, objetivos, requisitos, duracion_horas, modalidad')
      .eq('id', params.id)
      .maybeSingle(),
    supabase
      .from('modulos')
      .select(
        `id, orden, nombre, descripcion, duracion_horas,
         temas ( id, orden, titulo, descripcion, duracion_minutos,
           lecciones ( id, orden, titulo, tipo, duracion_minutos, es_obligatoria ) )`
      )
      .eq('curso_id', params.id)
      .order('orden', { ascending: true }),
    supabase
      .from('matriculas')
      .select('id, estado')
      .eq('user_id', user.id)
      .eq('curso_id', params.id)
      .in('estado', ['pendiente', 'activa', 'completada'])
      .maybeSingle(),
  ])

  if (!curso) notFound()

  const { data: progreso } = matricula
    ? await supabase
        .from('progreso_lecciones')
        .select('leccion_id, estado, completada_at')
        .eq('matricula_id', matricula.id)
    : { data: [] as Array<{ leccion_id: string; estado: string; completada_at: string | null }> }

  const completadas = new Set(
    (progreso ?? []).filter((row) => row.estado === 'completada').map((row) => row.leccion_id)
  )

  const modulosRows = ((modulos ?? []) as unknown as ModuloRow[])
    .map((modulo) => ({
      ...modulo,
      temas: [...(modulo.temas ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .map((tema) => ({
          ...tema,
          lecciones: [...(tema.lecciones ?? [])].sort((a, b) => a.orden - b.orden),
        })),
    }))
    .sort((a, b) => a.orden - b.orden)

  const lecciones = modulosRows.flatMap((modulo) => modulo.temas.flatMap((tema) => tema.lecciones))
  const total = lecciones.length
  const totalCompletadas = lecciones.filter((leccion) => completadas.has(leccion.id)).length
  const porcentaje = total > 0 ? Math.round((totalCompletadas / total) * 100) : 0
  const primeraPendiente = lecciones.find((leccion) => !completadas.has(leccion.id)) ?? lecciones[0]

  return (
    <div className="container-inba space-y-8 py-8">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/app/estudiante" className="hover:text-primary">
          Mi Academia
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link href="/app/estudiante/cursos" className="hover:text-primary">
          Mis cursos
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-foreground">{curso.codigo}</span>
      </nav>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{curso.codigo}</Badge>
          <Badge variant="outline">{MODALIDAD_LABEL[curso.modalidad] ?? curso.modalidad}</Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {curso.duracion_horas} h
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-foreground">{curso.nombre}</h1>
        <p className="max-w-3xl text-muted-foreground">{curso.descripcion}</p>

        <div className="max-w-xl space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalCompletadas} de {total} lecciones completadas
            </span>
            <span className="font-medium text-foreground">{porcentaje}%</span>
          </div>
          <Progress value={porcentaje} className="h-2" />
        </div>

        <div className="flex flex-wrap gap-3">
          {primeraPendiente && (
            <Link
              href={`/app/estudiante/cursos/${curso.id}/lecciones/${primeraPendiente.id}`}
              className="btn-primary gap-2"
            >
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              {totalCompletadas === 0 ? 'Comenzar curso' : 'Continuar donde quedé'}
            </Link>
          )}
          <Link href={`/app/estudiante/cursos/${curso.id}/progreso`} className="btn-outline gap-2">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Ver mi progreso
          </Link>
        </div>

        {!matricula && (
          <p className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-muted-foreground">
            No tienes una matrícula activa en este curso: puedes leer el contenido, pero el progreso no se guardará.{' '}
            <Link href="/formacion/inscripcion" className="font-medium text-primary hover:underline">
              Cómo inscribirme
            </Link>
          </p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4" aria-label="Contenido del curso">
          <h2 className="text-2xl font-bold text-foreground">Contenido</h2>

          {modulosRows.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                Este curso todavía no tiene módulos publicados.
              </CardContent>
            </Card>
          ) : (
            modulosRows.map((modulo) => {
              const leccionesModulo = modulo.temas.flatMap((tema) => tema.lecciones)
              const completadasModulo = leccionesModulo.filter((leccion) => completadas.has(leccion.id)).length
              return (
                <Card key={modulo.id}>
                  <CardHeader className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-lg">
                        Módulo {modulo.orden}: {modulo.nombre}
                      </CardTitle>
                      <Badge variant={completadasModulo === leccionesModulo.length && leccionesModulo.length > 0 ? 'default' : 'secondary'}>
                        {completadasModulo}/{leccionesModulo.length}
                      </Badge>
                    </div>
                    {modulo.descripcion && <p className="text-sm text-muted-foreground">{modulo.descripcion}</p>}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {modulo.temas.map((tema) => (
                      <div key={tema.id} className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          {modulo.orden}.{tema.orden} {tema.titulo}
                        </h4>
                        <ul className="space-y-1">
                          {tema.lecciones.map((leccion) => {
                            const hecha = completadas.has(leccion.id)
                            return (
                              <li key={leccion.id}>
                                <Link
                                  href={`/app/estudiante/cursos/${curso.id}/lecciones/${leccion.id}`}
                                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                                >
                                  <span className="flex min-w-0 items-center gap-2">
                                    {hecha ? (
                                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" aria-label="Completada" />
                                    ) : (
                                      <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground" aria-label="Pendiente" />
                                    )}
                                    <span className={hecha ? 'text-muted-foreground line-through' : 'text-foreground'}>
                                      {leccion.titulo}
                                    </span>
                                  </span>
                                  <span className="flex flex-shrink-0 items-center gap-2 text-xs text-muted-foreground">
                                    {leccion.duracion_minutos && <span>{leccion.duracion_minutos} min</span>}
                                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                                  </span>
                                </Link>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )
            })
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                Resumen del curso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{modulosRows.length} módulos</p>
              <p>{modulosRows.reduce((suma, modulo) => suma + modulo.temas.length, 0)} temas</p>
              <p>{total} lecciones</p>
              <p>{curso.duracion_horas} horas estimadas</p>
            </CardContent>
          </Card>

          {curso.requisitos && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requisitos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm text-muted-foreground">{curso.requisitos}</p>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  )
}
