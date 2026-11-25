import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth/server'
import { formatDateTime, formatNota } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface IntentoRow {
  id: string
  estado: string
  nota_final: number | null
  entregado_at: string | null
  iniciado_at: string | null
  evaluaciones: { titulo: string; tipo: string; ponderacion: number } | { titulo: string; tipo: string; ponderacion: number }[] | null
}

interface CalificacionRow {
  id: string
  nota_final: number | null
  observaciones: string | null
  creado_at: string
  evaluaciones: { titulo: string } | { titulo: string }[] | null
}

const first = <T,>(value: T | T[] | null): T | null => (Array.isArray(value) ? value[0] ?? null : value)

export default async function CalificacionesPage() {
  const context = await getSessionContext()
  const supabase = await createClient()
  const userId = context.ok ? context.userId : '00000000-0000-0000-0000-000000000000'

  const [{ data: intentos }, { data: calificaciones }] = await Promise.all([
    supabase
      .from('intentos_evaluacion')
      .select('id, estado, nota_final, entregado_at, iniciado_at, matriculas!inner(user_id), evaluaciones(titulo, tipo, ponderacion)')
      .eq('matriculas.user_id', userId)
      .order('iniciado_at', { ascending: false }),
    supabase
      .from('calificaciones_practica')
      .select('id, nota_final, observaciones, creado_at, matriculas!inner(user_id), evaluaciones(titulo)')
      .eq('matriculas.user_id', userId)
      .order('creado_at', { ascending: false }),
  ])

  const intentosRows = (intentos ?? []) as unknown as IntentoRow[]
  const calificacionesRows = (calificaciones ?? []) as unknown as CalificacionRow[]
  const vacio = intentosRows.length === 0 && calificacionesRows.length === 0

  return (
    <div className="container-inba py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Calificaciones</h1>
        <p className="text-muted-foreground mt-1">Notas de tus evaluaciones y prácticas</p>
      </header>

      {vacio ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium text-foreground">Aún no tienes calificaciones</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando entregues una evaluación o la califique un docente, aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {intentosRows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evaluaciones</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Evaluación</th>
                      <th className="py-2 pr-4 font-medium">Tipo</th>
                      <th className="py-2 pr-4 font-medium">Estado</th>
                      <th className="py-2 pr-4 font-medium">Entregado</th>
                      <th className="py-2 font-medium text-right">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intentosRows.map((row) => {
                      const evaluacion = first(row.evaluaciones)
                      return (
                        <tr key={row.id} className="border-t border-border">
                          <td className="py-3 pr-4 font-medium text-foreground">{evaluacion?.titulo ?? '—'}</td>
                          <td className="py-3 pr-4 text-muted-foreground">{evaluacion?.tipo ?? '—'}</td>
                          <td className="py-3 pr-4">
                            <Badge variant={row.estado === 'calificado' ? 'default' : 'secondary'}>{row.estado}</Badge>
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">{formatDateTime(row.entregado_at)}</td>
                          <td className="py-3 text-right font-medium text-foreground">{formatNota(row.nota_final)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {calificacionesRows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Prácticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {calificacionesRows.map((row) => (
                  <div key={row.id} className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-foreground">{first(row.evaluaciones)?.titulo ?? 'Práctica'}</p>
                      <p className="text-sm text-muted-foreground">{row.observaciones || 'Sin observaciones'}</p>
                    </div>
                    <span className="font-semibold text-foreground">{formatNota(row.nota_final)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
