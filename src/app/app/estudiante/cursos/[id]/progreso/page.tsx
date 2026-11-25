import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface ModuloProgreso {
  id: string
  orden: number
  nombre: string
  lecciones: Array<{ id: string; orden: number; titulo: string }>
}

export default async function ProgresoCursoPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: curso }, { data: modulos }, { data: matricula }] = await Promise.all([
    supabase.from('cursos').select('id, codigo, nombre').eq('id', params.id).maybeSingle(),
    supabase
      .from('modulos')
      .select('id, orden, nombre, temas ( id, orden, lecciones ( id, orden, titulo ) )')
      .eq('curso_id', params.id)
      .order('orden', { ascending: true }),
    supabase
      .from('matriculas')
      .select('id, estado')
      .eq('user_id', user.id)
      .eq('curso_id', params.id)
      .maybeSingle(),
  ])

  if (!curso) notFound()

  const { data: progreso } = matricula
    ? await supabase.from('progreso_lecciones').select('leccion_id, estado').eq('matricula_id', matricula.id)
    : { data: [] as Array<{ leccion_id: string; estado: string }> }

  const completadas = new Set(
    (progreso ?? []).filter((row) => row.estado === 'completada').map((row) => row.leccion_id)
  )

  const rows = ((modulos ?? []) as unknown as Array<{
    id: string
    orden: number
    nombre: string
    temas: Array<{ id: string; orden: number; lecciones: Array<{ id: string; orden: number; titulo: string }> }>
  }>)
    .sort((a, b) => a.orden - b.orden)
    .map<ModuloProgreso>((modulo) => ({
      id: modulo.id,
      orden: modulo.orden,
      nombre: modulo.nombre,
      lecciones: [...(modulo.temas ?? [])]
        .sort((a, b) => a.orden - b.orden)
        .flatMap((tema) => [...(tema.lecciones ?? [])].sort((a, b) => a.orden - b.orden)),
    }))

  const total = rows.reduce((suma, modulo) => suma + modulo.lecciones.length, 0)
  const totalCompletadas = rows.reduce(
    (suma, modulo) => suma + modulo.lecciones.filter((leccion) => completadas.has(leccion.id)).length,
    0
  )
  const porcentaje = total > 0 ? Math.round((totalCompletadas / total) * 100) : 0

  return (
    <div className="container-inba max-w-4xl space-y-6 py-8">
      <Link
        href={`/app/estudiante/cursos/${params.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al curso
      </Link>

      <header className="space-y-3">
        <h1 className="text-3xl font-bold text-foreground">Mi progreso</h1>
        <p className="text-muted-foreground">
          {curso.codigo} · {curso.nombre}
        </p>
        <div className="max-w-xl space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {totalCompletadas} de {total} lecciones
            </span>
            <span className="font-medium text-foreground">{porcentaje}%</span>
          </div>
          <Progress value={porcentaje} className="h-2" />
        </div>
      </header>

      <div className="space-y-4">
        {rows.map((modulo) => {
          const hechas = modulo.lecciones.filter((leccion) => completadas.has(leccion.id)).length
          const completo = modulo.lecciones.length > 0 && hechas === modulo.lecciones.length
          return (
            <Card key={modulo.id}>
              <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
                <CardTitle className="text-base">
                  Módulo {modulo.orden}: {modulo.nombre}
                </CardTitle>
                <Badge variant={completo ? 'default' : 'secondary'}>
                  {hechas}/{modulo.lecciones.length}
                </Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1.5">
                  {modulo.lecciones.map((leccion) => {
                    const hecha = completadas.has(leccion.id)
                    return (
                      <li key={leccion.id}>
                        <Link
                          href={`/app/estudiante/cursos/${params.id}/lecciones/${leccion.id}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          {hecha ? (
                            <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" aria-hidden="true" />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          )}
                          {leccion.titulo}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
