import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface EventoRow {
  id: string
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  sede: string
  estado: string
}

export default async function CalendarioPage() {
  const supabase = await createClient()

  const { data: eventos } = await supabase
    .from('eventos')
    .select('id, titulo, descripcion, fecha_inicio, fecha_fin, sede, estado')
    .eq('estado', 'publicado')
    .gte('fecha_fin', new Date().toISOString())
    .order('fecha_inicio', { ascending: true })

  const rows = (eventos ?? []) as EventoRow[]

  return (
    <div className="container-inba py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Calendario</h1>
        <p className="text-muted-foreground mt-1">Próximos eventos oficiales de INBA Ecuador</p>
      </header>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium text-foreground">No hay eventos publicados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Las competencias y seminarios confirmados se publicarán en esta sección.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((evento) => (
            <Card key={evento.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateTime(evento.fecha_inicio)} — {formatDateTime(evento.fecha_fin)}
                  </p>
                </div>
                <Badge variant="secondary">{evento.sede}</Badge>
              </CardHeader>
              {evento.descripcion && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
