import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, MapPin, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Calendario de competencias - INBA Ecuador',
  description: 'Eventos y competencias oficiales programadas por INBA Ecuador.',
}

interface EventoRow {
  id: string
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  sede: string
  estado: string
}

export default async function CalendarioCompetenciasPage() {
  const supabase = await createClient()

  const { data: eventos } = await supabase
    .from('eventos')
    .select('id, titulo, descripcion, fecha_inicio, fecha_fin, sede, estado')
    .eq('estado', 'publicado')
    .order('fecha_inicio', { ascending: true })

  const rows = (eventos ?? []) as EventoRow[]
  const ahora = Date.now()
  const proximos = rows.filter((evento) => new Date(evento.fecha_fin).getTime() >= ahora)
  const pasados = rows.filter((evento) => new Date(evento.fecha_fin).getTime() < ahora)

  const renderEvento = (evento: EventoRow) => (
    <Card key={evento.id}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">{evento.titulo}</CardTitle>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {formatDateTime(evento.fecha_inicio)} — {formatDateTime(evento.fecha_fin)}
          </p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {evento.sede}
        </Badge>
      </CardHeader>
      {evento.descripcion && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{evento.descripcion}</p>
        </CardContent>
      )}
    </Card>
  )

  return (
    <div className="container-inba section-inba space-y-8">
      <nav aria-label="Migas de pan">
        <Link
          href="/competencias"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver a competencias
        </Link>
      </nav>

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Calendario de competencias</h1>
        <p className="text-lg text-muted-foreground">Eventos oficiales publicados por INBA Ecuador.</p>
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
        <>
          <section className="space-y-4" aria-label="Próximos eventos">
            <h2 className="text-2xl font-bold text-foreground">Próximos eventos</h2>
            {proximos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay eventos próximos por ahora.</p>
            ) : (
              <div className="space-y-3">{proximos.map(renderEvento)}</div>
            )}
          </section>

          {pasados.length > 0 && (
            <section className="space-y-4" aria-label="Eventos anteriores">
              <h2 className="text-2xl font-bold text-foreground">Eventos anteriores</h2>
              <div className="space-y-3">{pasados.map(renderEvento)}</div>
            </section>
          )}
        </>
      )}

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Link href="/competencias/inscripcion" className="btn-primary">
          Cómo inscribirme
        </Link>
        <Link href="/competencias/categorias" className="btn-outline">
          Ver categorías
        </Link>
      </div>
    </div>
  )
}
