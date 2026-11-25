import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth/server'
import { formatDateTime } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface SesionRow {
  id: string
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  sede: string
  direccion: string | null
  estado: string
  cursos: { nombre: string } | { nombre: string }[] | null
}

export default async function PracticasPage() {
  const context = await getSessionContext()
  const supabase = await createClient()
  const userId = context.ok ? context.userId : '00000000-0000-0000-0000-000000000000'

  const { data: matriculas } = await supabase
    .from('matriculas')
    .select('id, curso_id')
    .eq('user_id', userId)
    .in('estado', ['pendiente', 'activa', 'completada'])

  const cursoIds = (matriculas ?? []).map((m) => m.curso_id)
  const matriculaIds = (matriculas ?? []).map((m) => m.id)

  const [{ data: sesiones }, { data: inscripciones }] = await Promise.all([
    cursoIds.length
      ? supabase
          .from('practicas_sesiones')
          .select('id, titulo, descripcion, fecha_inicio, fecha_fin, sede, direccion, estado, cursos(nombre)')
          .in('curso_id', cursoIds)
          .order('fecha_inicio', { ascending: true })
      : Promise.resolve({ data: [] as SesionRow[] }),
    matriculaIds.length
      ? supabase.from('practicas_inscripciones').select('sesion_id, estado').in('matricula_id', matriculaIds)
      : Promise.resolve({ data: [] as Array<{ sesion_id: string; estado: string }> }),
  ])

  const inscritas = new Map((inscripciones ?? []).map((i) => [i.sesion_id, i.estado]))
  const rows = (sesiones ?? []) as unknown as SesionRow[]

  return (
    <div className="container-inba py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Prácticas</h1>
        <p className="text-muted-foreground mt-1">Sesiones presenciales de tus cursos</p>
      </header>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium text-foreground">No hay prácticas programadas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Cuando la administración programe una sesión para tus cursos aparecerá aquí.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((sesion) => {
            const curso = Array.isArray(sesion.cursos) ? sesion.cursos[0] : sesion.cursos
            const estadoInscripcion = inscritas.get(sesion.id)
            return (
              <Card key={sesion.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="text-lg">{sesion.titulo}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{curso?.nombre ?? 'Curso'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary">{sesion.estado}</Badge>
                    {estadoInscripcion && <Badge variant="outline">Inscripción: {estadoInscripcion}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    {formatDateTime(sesion.fecha_inicio)} — {formatDateTime(sesion.fecha_fin)}
                  </p>
                  <p className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    {sesion.sede}
                    {sesion.direccion ? ` · ${sesion.direccion}` : ''}
                  </p>
                  {sesion.descripcion && <p>{sesion.descripcion}</p>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
