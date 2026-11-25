import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ContenidoLeccion, parseObjetivos } from '@/components/estudiante/contenido-leccion'
import { MarcarLeccion } from '@/components/estudiante/marcar-leccion'
import { ArrowLeft, ArrowRight, CheckCircle, ChevronRight, Clock, ListChecks, PlayCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface LeccionDb {
  id: string
  titulo: string
  descripcion: string | null
  tipo: string
  contenido_json: { contenido?: string; objetivos?: unknown } | null
  duracion_minutos: number | null
  video_url: string | null
  tema_id: string
  temas:
    | { id: string; titulo: string; modulo_id: string; modulos: { id: string; nombre: string; curso_id: string; orden: number } | { id: string; nombre: string; curso_id: string; orden: number }[] | null }
    | Array<{ id: string; titulo: string; modulo_id: string; modulos: unknown }>
    | null
}

const first = <T,>(value: T | T[] | null): T | null => (Array.isArray(value) ? value[0] ?? null : value)

export default async function LeccionPage({ params }: { params: { id: string; leccionId: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data } = await supabase
    .from('lecciones')
    .select(
      `id, titulo, descripcion, tipo, contenido_json, duracion_minutos, video_url, tema_id,
       temas!inner ( id, titulo, modulo_id,
         modulos!inner ( id, nombre, curso_id, orden ) )`
    )
    .eq('id', params.leccionId)
    .maybeSingle()

  const leccion = data as unknown as LeccionDb | null
  const tema = leccion ? first(leccion.temas) : null
  const modulo = tema ? (first(tema.modulos as never) as { id: string; nombre: string; curso_id: string; orden: number } | null) : null

  if (!leccion || !tema || !modulo || modulo.curso_id !== params.id) notFound()

  const [{ data: curso }, { data: matricula }, { data: estructura }] = await Promise.all([
    supabase.from('cursos').select('id, codigo, nombre').eq('id', params.id).maybeSingle(),
    supabase
      .from('matriculas')
      .select('id, estado')
      .eq('user_id', user.id)
      .eq('curso_id', params.id)
      .in('estado', ['pendiente', 'activa', 'completada'])
      .maybeSingle(),
    supabase
      .from('modulos')
      .select('id, orden, temas ( id, orden, lecciones ( id, orden, titulo ) )')
      .eq('curso_id', params.id)
      .order('orden', { ascending: true }),
  ])

  const { data: progreso } = matricula
    ? await supabase
        .from('progreso_lecciones')
        .select('estado')
        .eq('matricula_id', matricula.id)
        .eq('leccion_id', leccion.id)
        .maybeSingle()
    : { data: null }

  const completada = progreso?.estado === 'completada'

  type EstructuraModulo = { id: string; orden: number; temas: Array<{ id: string; orden: number; lecciones: Array<{ id: string; orden: number; titulo: string }> }> }
  const planas = ((estructura ?? []) as unknown as EstructuraModulo[])
    .sort((a, b) => a.orden - b.orden)
    .flatMap((mod) =>
      [...(mod.temas ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .flatMap((tem) => [...(tem.lecciones ?? [])].sort((a, b) => a.orden - b.orden))
    )

  const indice = planas.findIndex((item) => item.id === leccion.id)
  const anterior = indice > 0 ? planas[indice - 1] : null
  const siguiente = indice >= 0 && indice < planas.length - 1 ? planas[indice + 1] : null
  const objetivos = parseObjetivos(leccion.contenido_json?.objetivos)
  const contenido = leccion.contenido_json?.contenido ?? leccion.descripcion ?? ''

  return (
    <div className="container-inba max-w-4xl space-y-6 py-8">
      <nav aria-label="Migas de pan" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/app/estudiante/cursos" className="hover:text-primary">
          Mis cursos
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link href={`/app/estudiante/cursos/${params.id}`} className="hover:text-primary">
          {curso?.codigo ?? 'Curso'}
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-foreground">Lección {indice + 1}</span>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Módulo {modulo.orden}</Badge>
          <span>{tema.titulo}</span>
          {leccion.duracion_minutos && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {leccion.duracion_minutos} min
            </span>
          )}
          {completada && (
            <Badge variant="default" className="gap-1">
              <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Completada
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-bold text-foreground">{leccion.titulo}</h1>
        {leccion.descripcion && <p className="text-muted-foreground">{leccion.descripcion}</p>}
      </header>

      <Card>
        <CardContent className="space-y-6 p-6 sm:p-8">
          <ContenidoLeccion texto={contenido} />
        </CardContent>
      </Card>

      {objetivos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
              Objetivos de aprendizaje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {objetivos.map((objetivo) => (
                <li key={objetivo}>{objetivo}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {matricula ? (
            <MarcarLeccion matriculaId={matricula.id} leccionId={leccion.id} completada={completada} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sin matrícula activa: el avance no se guarda.{' '}
              <Link href="/formacion/inscripcion" className="font-medium text-primary hover:underline">
                Inscribirme
              </Link>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {anterior && (
            <Link
              href={`/app/estudiante/cursos/${params.id}/lecciones/${anterior.id}`}
              className="btn-outline gap-2"
              aria-label={`Lección anterior: ${anterior.titulo}`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Anterior
            </Link>
          )}
          {siguiente ? (
            <Link
              href={`/app/estudiante/cursos/${params.id}/lecciones/${siguiente.id}`}
              className="btn-primary gap-2"
              aria-label={`Siguiente lección: ${siguiente.titulo}`}
            >
              Siguiente
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link href={`/app/estudiante/cursos/${params.id}`} className="btn-outline gap-2">
              <PlayCircle className="h-4 w-4" aria-hidden="true" />
              Volver al curso
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
