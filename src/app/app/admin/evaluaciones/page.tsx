import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatNota } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface EvaluacionRow {
  id: string
  titulo: string
  tipo: string
  estado: string
  tiempo_limite_minutos: number | null
  intentos_permitidos: number
  modulo_id: string | null
  cursos: { nombre: string; codigo: string } | { nombre: string; codigo: string }[] | null
  modulos: { nombre: string; orden: number } | { nombre: string; orden: number }[] | null
}

const first = <T,>(value: T | T[] | null): T | null => (Array.isArray(value) ? value[0] ?? null : value)

export default async function AdminEvaluacionesPage() {
  const supabase = await createClient()

  const [{ data: evaluaciones }, { data: preguntas }, { data: intentos }] = await Promise.all([
    supabase
      .from('evaluaciones')
      .select(
        'id, titulo, tipo, estado, tiempo_limite_minutos, intentos_permitidos, modulo_id, cursos(nombre, codigo), modulos(nombre, orden)'
      )
      .order('created_at', { ascending: true }),
    supabase.from('preguntas').select('id, evaluacion_id, puntaje'),
    supabase.from('intentos_evaluacion').select('id, evaluacion_id, estado, nota_final'),
  ])

  const preguntasPorEvaluacion = new Map<string, number>()
  for (const pregunta of preguntas ?? []) {
    preguntasPorEvaluacion.set(pregunta.evaluacion_id, (preguntasPorEvaluacion.get(pregunta.evaluacion_id) ?? 0) + 1)
  }

  const intentosPorEvaluacion = new Map<string, { total: number; calificados: number; suma: number }>()
  for (const intento of intentos ?? []) {
    const actual = intentosPorEvaluacion.get(intento.evaluacion_id) ?? { total: 0, calificados: 0, suma: 0 }
    actual.total += 1
    if (typeof intento.nota_final === 'number') {
      actual.calificados += 1
      actual.suma += intento.nota_final
    }
    intentosPorEvaluacion.set(intento.evaluacion_id, actual)
  }

  const rows = (evaluaciones ?? []) as unknown as EvaluacionRow[]

  return (
    <div className="container-inba space-y-6 py-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Evaluaciones</h1>
        <p className="mt-1 text-muted-foreground">
          {rows.length} evaluaciones publicadas en el programa académico y su actividad registrada
        </p>
      </header>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium text-foreground">No hay evaluaciones creadas</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rows.map((evaluacion) => {
            const curso = first(evaluacion.cursos)
            const modulo = first(evaluacion.modulos)
            const actividad = intentosPorEvaluacion.get(evaluacion.id)
            const promedio = actividad && actividad.calificados > 0 ? actividad.suma / actividad.calificados : null
            const preguntasCount = preguntasPorEvaluacion.get(evaluacion.id) ?? 0
            return (
              <Card key={evaluacion.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="text-lg">{evaluacion.titulo}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {curso ? `${curso.codigo} · ${curso.nombre}` : 'Sin curso'}
                      {modulo ? ` · Módulo ${modulo.orden}: ${modulo.nombre}` : ''}
                    </p>
                  </div>
                  <Badge variant={evaluacion.estado === 'publicado' ? 'default' : 'secondary'}>{evaluacion.estado}</Badge>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span>{preguntasCount} preguntas</span>
                  <span>{evaluacion.intentos_permitidos} intento(s) permitido(s)</span>
                  {evaluacion.tiempo_limite_minutos && <span>{evaluacion.tiempo_limite_minutos} min</span>}
                  <span>{actividad?.total ?? 0} intentos entregados</span>
                  <span>Promedio: {formatNota(promedio)}</span>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Las preguntas se califican automáticamente al entregar el intento. La edición de evaluaciones desde el panel está
        pendiente.{' '}
        <Link href="/app/admin" className="text-primary hover:underline">
          Volver al panel
        </Link>
      </p>
    </div>
  )
}
