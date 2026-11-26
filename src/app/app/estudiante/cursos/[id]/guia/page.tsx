import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { biblioteca } from '@/content/biblioteca'
import { GuiaModuloCard } from '@/components/estudiante/guia-modulo'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, BookOpen, GraduationCap } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function GuiaCursoPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: curso }, { data: modulos }] = await Promise.all([
    supabase.from('cursos').select('id, codigo, nombre, descripcion').eq('id', params.id).maybeSingle(),
    supabase.from('modulos').select('id, orden, nombre').eq('curso_id', params.id).order('orden', { ascending: true }),
  ])

  if (!curso) notFound()

  const rows = (modulos ?? []) as Array<{ id: string; orden: number; nombre: string }>

  return (
    <div className="container-inba max-w-4xl space-y-8 py-8">
      <Link
        href={`/app/estudiante/cursos/${params.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al curso
      </Link>

      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">Guía de estudio y bibliografía</p>
        <h1 className="text-3xl font-bold text-foreground">{curso.nombre}</h1>
        <p className="max-w-3xl text-muted-foreground">
          Cada módulo incluye los conceptos que debes dominar y lecturas recomendadas. La idea no es memorizar todo, sino
          poder explicar y aplicar cada tema con fuentes verificables.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/app/estudiante/cursos/${params.id}`} className="btn-outline gap-2">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Contenido del curso
          </Link>
          <Link href={`/app/estudiante/cursos/${params.id}/progreso`} className="btn-ghost gap-2">
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            Mi progreso
          </Link>
        </div>
      </header>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Cómo usar esta guía</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Lee la lección completa y subraya los conceptos que no puedas explicar con tus palabras.</li>
            <li>Revisa los conceptos clave del módulo y compáralos con tus apuntes.</li>
            <li>Elige al menos una lectura por módulo y anota cómo se aplica a un caso real de tu consulta.</li>
            <li>Responde la autoevaluación del módulo sin mirar las respuestas.</li>
          </ol>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este curso todavía no tiene módulos publicados.</p>
        ) : (
          rows.map((modulo) => {
            const guia = biblioteca[modulo.orden]
            if (!guia) {
              return (
                <Card key={modulo.id}>
                  <CardContent className="p-6">
                    <h2 className="text-lg font-semibold text-foreground">
                      Módulo {modulo.orden}: {modulo.nombre}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      La guía de lecturas de este módulo está en preparación.
                    </p>
                  </CardContent>
                </Card>
              )
            }
            return (
              <section key={modulo.id} id={`modulo-${modulo.orden}`} aria-label={`Guía del módulo ${modulo.orden}`}>
                <h2 className="mb-3 text-xl font-semibold text-foreground">
                  Módulo {modulo.orden}: {modulo.nombre}
                </h2>
                <GuiaModuloCard guia={guia} cursoId={params.id} mostrarEnlace={false} />
              </section>
            )
          })
        )}
      </div>
    </div>
  )
}
