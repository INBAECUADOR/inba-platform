import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, ClipboardCheck, GraduationCap, Info, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DocentePage() {
  const supabase = await createClient()

  const [
    { count: cursosCount },
    { count: evaluacionesCount },
    { count: alumnosCount },
    { count: pendientesCount },
    { data: cursos },
  ] = await Promise.all([
    supabase.from('cursos').select('id', { count: 'exact', head: true }).eq('estado', 'publicado'),
    supabase.from('evaluaciones').select('id', { count: 'exact', head: true }).eq('estado', 'publicado'),
    supabase.from('matriculas').select('id', { count: 'exact', head: true }).in('estado', ['activa', 'pendiente']),
    supabase.from('intentos_evaluacion').select('id', { count: 'exact', head: true }).eq('estado', 'entregado'),
    supabase
      .from('cursos')
      .select('id, codigo, nombre, estado, duracion_horas')
      .order('created_at', { ascending: true })
      .limit(10),
  ])

  const stats = [
    { label: 'Cursos publicados', value: cursosCount ?? 0, icon: GraduationCap },
    { label: 'Evaluaciones', value: evaluacionesCount ?? 0, icon: ClipboardCheck },
    { label: 'Alumnos matriculados', value: alumnosCount ?? 0, icon: Users },
    { label: 'Intentos por revisar', value: pendientesCount ?? 0, icon: BookOpen },
  ]

  return (
    <div className="container-inba space-y-8 py-8">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Panel Docente</h1>
        <p className="mt-1 text-muted-foreground">Estado actual de la actividad académica</p>
      </header>

      <section aria-label="Resumen" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-l-4 border-primary">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <stat.icon className="h-6 w-6 text-primary" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Programa académico</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {(cursos ?? []).length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No hay cursos creados.</p>
          ) : (
            (cursos ?? []).map((curso) => (
              <div
                key={curso.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">{curso.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {curso.codigo} · {curso.duracion_horas} h
                  </p>
                </div>
                <Badge variant={curso.estado === 'publicado' ? 'default' : 'secondary'}>{curso.estado}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-5">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Las evaluaciones se califican automáticamente al entregarse (opción múltiple, verdadero/falso y
              cobertura de conceptos en respuestas abiertas). Los intentos que queden pendientes requieren revisión
              manual.
            </p>
            <p>
              La creación de evaluaciones y la revisión individual desde el panel están en implementación. Mientras
              tanto, la administración gestiona esos cambios.{' '}
              <Link href="/contacto" className="font-medium text-primary hover:underline">
                Contactar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
