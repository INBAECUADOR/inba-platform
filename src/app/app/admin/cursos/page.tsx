import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CursoRow {
  id: string
  codigo: string
  nombre: string
  modalidad: string
  estado: string
  duracion_horas: number
  created_at: string
}

export default async function AdminCursosPage() {
  const supabase = await createClient()

  const [{ data: cursos }, { data: modulos }, { data: matriculas }] = await Promise.all([
    supabase
      .from('cursos')
      .select('id, codigo, nombre, modalidad, estado, duracion_horas, created_at')
      .order('created_at', { ascending: true }),
    supabase.from('modulos').select('id, curso_id'),
    supabase.from('matriculas').select('id, curso_id, estado'),
  ])

  const modulosPorCurso = new Map<string, number>()
  for (const modulo of modulos ?? []) {
    modulosPorCurso.set(modulo.curso_id, (modulosPorCurso.get(modulo.curso_id) ?? 0) + 1)
  }

  const alumnosPorCurso = new Map<string, number>()
  for (const matricula of matriculas ?? []) {
    if (matricula.estado === 'cancelada' || matricula.estado === 'abandonada') continue
    alumnosPorCurso.set(matricula.curso_id, (alumnosPorCurso.get(matricula.curso_id) ?? 0) + 1)
  }

  const rows = (cursos ?? []) as CursoRow[]

  return (
    <div className="container-inba py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Cursos</h1>
        <p className="text-muted-foreground mt-1">Programa académico cargado en la plataforma</p>
      </header>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium text-foreground">No hay cursos creados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rows.map((curso) => (
            <Card key={curso.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-lg">{curso.nombre}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {curso.codigo} · {curso.modalidad} · {curso.duracion_horas} h
                  </p>
                </div>
                <Badge variant={curso.estado === 'publicado' ? 'default' : 'secondary'}>{curso.estado}</Badge>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <span>{modulosPorCurso.get(curso.id) ?? 0} módulos</span>
                <span>{alumnosPorCurso.get(curso.id) ?? 0} alumnos matriculados</span>
                <span>Creado el {formatDate(curso.created_at)}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        La edición de cursos y módulos desde el panel está pendiente.{' '}
        <Link href="/app/admin" className="text-primary hover:underline">
          Volver al panel
        </Link>
      </p>
    </div>
  )
}
