import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth/server'
import { formatDate, formatNota } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, ClipboardCheck, Award, Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

const quickActions = [
  { label: 'Mis Cursos', href: '/app/estudiante/cursos', description: 'Ver mis cursos y progreso' },
  { label: 'Evaluaciones', href: '/app/estudiante/evaluaciones', description: 'Exámenes y tareas pendientes' },
  { label: 'Calificaciones', href: '/app/estudiante/calificaciones', description: 'Ver mis notas y feedback' },
  { label: 'Prácticas', href: '/app/estudiante/practicas', description: 'Sesiones presenciales' },
  { label: 'Calendario', href: '/app/estudiante/calendario', description: 'Eventos y fechas importantes' },
  { label: 'Certificados', href: '/app/estudiante/certificados', description: 'Mis certificados emitidos' },
]

export default async function EstudiantePage() {
  const context = await getSessionContext()
  const supabase = await createClient()
  const userId = context.ok ? context.userId : '00000000-0000-0000-0000-000000000000'

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select('id, curso_id, estado, fecha_inicio, cursos(nombre, codigo)')
    .eq('user_id', userId)
    .in('estado', ['pendiente', 'activa', 'completada'])
    .order('fecha_inicio', { ascending: false })

  const activas = (matriculas ?? []).filter((m) => m.estado === 'activa' || m.estado === 'pendiente')
  const matriculaIds = (matriculas ?? []).map((m) => m.id)
  const cursoIds = (matriculas ?? []).map((m) => m.curso_id)

  const [{ data: evaluaciones }, { data: intentos }, { count: certificadosCount }] = await Promise.all([
    cursoIds.length
      ? supabase
          .from('evaluaciones')
          .select('id, titulo, tipo, fecha_fin, curso_id')
          .in('curso_id', cursoIds)
          .eq('estado', 'publicado')
          .order('fecha_fin', { ascending: true })
      : Promise.resolve({ data: [] as Array<{ id: string; titulo: string; tipo: string; fecha_fin: string | null; curso_id: string }> }),
    matriculaIds.length
      ? supabase.from('intentos_evaluacion').select('evaluacion_id, estado, nota_final').in('matricula_id', matriculaIds)
      : Promise.resolve({ data: [] as Array<{ evaluacion_id: string; estado: string; nota_final: number | null }> }),
    supabase
      .from('certificados')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('estado', 'vigente'),
  ])

  const entregadas = new Set(
    (intentos ?? []).filter((i) => i.estado === 'entregado' || i.estado === 'calificado').map((i) => i.evaluacion_id)
  )
  const pendientes = (evaluaciones ?? []).filter((e) => !entregadas.has(e.id))
  const notas = (intentos ?? []).map((i) => i.nota_final).filter((n): n is number => typeof n === 'number')
  const promedio = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : null

  const stats = [
    { label: 'Cursos activos', value: String(activas.length), icon: GraduationCap },
    { label: 'Evaluaciones pendientes', value: String(pendientes.length), icon: ClipboardCheck },
    { label: 'Promedio actual', value: formatNota(promedio), icon: Award },
    { label: 'Certificados vigentes', value: String(certificadosCount ?? 0), icon: Trophy },
  ]

  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Academia</h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenido{context.ok && context.fullName ? `, ${context.fullName}` : ''}
          </p>
        </div>
        <Link href="/app/estudiante/cursos">
          <Button className="gap-2">Ir a mis cursos</Button>
        </Link>
      </header>

      <section aria-label="Resumen">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className="h-8 w-8 text-primary" aria-hidden="true" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Acciones rápidas">
        <h2 className="mb-4 text-2xl font-bold text-foreground">Acciones rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="card-inba group space-y-2 p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <h3 className="font-semibold text-foreground group-hover:text-primary">{action.label}</h3>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-label="Próximas evaluaciones">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Próximas evaluaciones</h2>
          <Link href="/app/estudiante/evaluaciones" className="text-sm font-medium text-primary hover:underline">
            Ver todas →
          </Link>
        </div>
        {pendientes.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No tienes evaluaciones pendientes.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendientes.slice(0, 5).map((evaluacion) => (
              <Card key={evaluacion.id}>
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="font-medium text-foreground">{evaluacion.titulo}</p>
                    <p className="text-sm text-muted-foreground">
                      {evaluacion.tipo} · cierra {formatDate(evaluacion.fecha_fin)}
                    </p>
                  </div>
                  <Link href="/app/estudiante/evaluaciones">
                    <Button variant="outline" size="sm">
                      Abrir
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Mis cursos">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Mis cursos</h2>
          <Link href="/app/estudiante/cursos" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        {(matriculas ?? []).length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Todavía no tienes matrículas activas.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {(matriculas ?? []).slice(0, 4).map((matricula) => {
              const curso = Array.isArray(matricula.cursos) ? matricula.cursos[0] : matricula.cursos
              return (
                <Card key={matricula.id}>
                  <CardContent className="flex items-center justify-between gap-4 p-5">
                    <div>
                      <p className="font-medium text-foreground">{curso?.nombre ?? 'Curso'}</p>
                      <p className="text-sm text-muted-foreground">
                        {curso?.codigo ?? '—'} · inicio {formatDate(matricula.fecha_inicio)}
                      </p>
                    </div>
                    <Badge variant={matricula.estado === 'activa' ? 'default' : 'secondary'}>{matricula.estado}</Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
