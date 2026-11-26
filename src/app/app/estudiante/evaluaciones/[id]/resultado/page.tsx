import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatNota } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Award, CheckCircle, Clock, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface IntentoRow {
  id: string
  numero_intento: number
  estado: string
  iniciado_at: string
  entregado_at: string | null
  nota_final: number | null
}

interface DetalleRespuesta {
  pregunta: string
  tipo: string
  puntaje: number
  obtenido: number | null
  respuesta: string | null
  esperada: string | null
}

interface ResultadoIntento {
  nota: number | null
  estado: string
  respuestas: DetalleRespuesta[]
}

export default async function ResultadoEvaluacionPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: evaluacion } = await supabase
    .from('evaluaciones')
    .select('id, titulo, descripcion, curso_id, modulos(orden)')
    .eq('id', params.id)
    .maybeSingle()

  if (!evaluacion) notFound()

  const moduloRel = (evaluacion as unknown as { modulos: { orden: number } | { orden: number }[] | null }).modulos
  const moduloOrden = Array.isArray(moduloRel) ? moduloRel[0]?.orden ?? null : moduloRel?.orden ?? null

  const { data: intentos } = await supabase
    .from('intentos_evaluacion')
    .select('id, numero_intento, estado, iniciado_at, entregado_at, nota_final, matriculas!inner(user_id)')
    .eq('evaluacion_id', params.id)
    .eq('matriculas.user_id', user.id)
    .order('numero_intento', { ascending: false })

  const rows = (intentos ?? []) as unknown as IntentoRow[]
  const ultimo = rows[0] ?? null
  const notas = rows.map((row) => row.nota_final).filter((n): n is number => typeof n === 'number')
  const mejorNota = notas.length > 0 ? Math.max(...notas) : null
  const aprobado = mejorNota !== null && mejorNota >= 70
  const pendiente = rows.some((row) => row.estado === 'entregado')

  let detalle: DetalleRespuesta[] = []
  if (ultimo) {
    const { data } = await supabase.rpc('obtener_resultado_intento', { p_intento_id: ultimo.id })
    const resultado = data as unknown as ResultadoIntento | null
    detalle = resultado?.respuestas ?? []
  }

  return (
    <div className="container-inba max-w-3xl space-y-6 py-8">
      <Link
        href="/app/estudiante/evaluaciones"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a evaluaciones
      </Link>

      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{evaluacion.titulo}</h1>
        {evaluacion.descripcion && <p className="text-muted-foreground">{evaluacion.descripcion}</p>}
      </header>

      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          {pendiente ? (
            <>
              <Clock className="h-12 w-12 text-amber-500" aria-hidden="true" />
              <p className="text-xl font-semibold text-foreground">Intento entregado</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Tu intento quedó registrado y está pendiente de revisión docente. La nota aparecerá aquí cuando se
                califique.
              </p>
            </>
          ) : aprobado ? (
            <>
              <CheckCircle className="h-12 w-12 text-green-600" aria-hidden="true" />
              <p className="text-xl font-semibold text-foreground">Evaluación aprobada</p>
              <p className="text-4xl font-bold text-primary">{formatNota(mejorNota)}</p>
              <p className="text-sm text-muted-foreground">Mejor nota de {rows.length} intento(s)</p>
            </>
          ) : (
            <>
              <XCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
              <p className="text-xl font-semibold text-foreground">
                {rows.length === 0 ? 'Sin intentos registrados' : 'Evaluación no aprobada'}
              </p>
              <p className="text-4xl font-bold text-foreground">{formatNota(mejorNota)}</p>
              <p className="max-w-md text-sm text-muted-foreground">
                {rows.length === 0
                  ? 'Todavía no has iniciado esta evaluación.'
                  : 'La nota mínima de aprobación es 70/100. Puedes revisar tus intentos disponibles.'}
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de intentos</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="py-2 pr-4 font-medium">Intento</th>
                  <th className="py-2 pr-4 font-medium">Iniciado</th>
                  <th className="py-2 pr-4 font-medium">Entregado</th>
                  <th className="py-2 pr-4 font-medium">Estado</th>
                  <th className="py-2 text-right font-medium">Nota</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="py-3 pr-4 font-medium text-foreground">#{row.numero_intento}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDateTime(row.iniciado_at)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{formatDateTime(row.entregado_at)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={row.estado === 'calificado' ? 'default' : 'secondary'}>{row.estado}</Badge>
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">{formatNota(row.nota_final)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {detalle.length > 0 && (
        <section className="space-y-4" aria-label="Detalle de respuestas">          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Award className="h-5 w-5 text-primary" aria-hidden="true" />
            Detalle de tu último intento
          </h2>
          {detalle.map((item, index) => {
            const correcta = typeof item.obtenido === 'number' && item.obtenido >= item.puntaje
            return (
              <Card key={`${index}-${item.pregunta}`}>
                <CardContent className="space-y-2 py-4">
                  <p className="font-medium text-foreground">
                    {index + 1}. {item.pregunta}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tu respuesta: {item.respuesta || 'Sin respuesta'}
                  </p>
                  {item.esperada && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Respuesta esperada: </span>
                      {item.esperada}
                    </p>
                  )}
                  <Badge variant={correcta ? 'default' : 'secondary'}>
                    {item.obtenido === null
                      ? 'En revisión'
                      : `${item.obtenido} / ${item.puntaje} pts`}
                  </Badge>
                </CardContent>
              </Card>
            )
          })}
        </section>
      )}

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            ¿Quieres reforzar los temas antes del siguiente intento? Revisa la guía del módulo con los conceptos clave y
            las lecturas recomendadas.
          </p>
          {moduloOrden && evaluacion.curso_id ? (
            <Link
              href={`/app/estudiante/cursos/${evaluacion.curso_id}/guia#modulo-${moduloOrden}`}
              className="btn-outline shrink-0 justify-center gap-2"
            >
              <Award className="h-4 w-4" aria-hidden="true" />
              Guía del módulo {moduloOrden}
            </Link>
          ) : (
            <Link href="/app/estudiante/cursos" className="btn-outline shrink-0 justify-center gap-2">
              <Award className="h-4 w-4" aria-hidden="true" />
              Ir a mis cursos
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
