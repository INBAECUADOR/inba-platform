import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth/server'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CertificadoRow {
  id: string
  uuid_publico: string
  numero_serie: string
  fecha_emision: string
  estado: string
  cursos: { nombre: string } | { nombre: string }[] | null
}

export default async function CertificadosPage() {
  const context = await getSessionContext()
  const supabase = await createClient()

  const { data } = await supabase
    .from('certificados')
    .select('id, uuid_publico, numero_serie, fecha_emision, estado, cursos(nombre)')
    .eq('user_id', context.ok ? context.userId : '00000000-0000-0000-0000-000000000000')
    .order('fecha_emision', { ascending: false })

  const certificados = (data ?? []) as CertificadoRow[]

  return (
    <div className="container-inba py-8 space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Mis certificados</h1>
        <p className="text-muted-foreground mt-1">
          Certificados emitidos a tu nombre. Cada uno tiene una URL pública de verificación.
        </p>
      </header>

      {certificados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="mt-4 font-medium text-foreground">Todavía no tienes certificados emitidos</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Al completar los requisitos de un curso, la administración emite tu certificado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificados.map((cert) => {
            const curso = Array.isArray(cert.cursos) ? cert.cursos[0] : cert.cursos
            return (
              <Card key={cert.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div>
                    <CardTitle className="text-lg">{curso?.nombre ?? 'Curso'}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">Serie {cert.numero_serie}</p>
                  </div>
                  <Badge variant={cert.estado === 'vigente' ? 'default' : 'destructive'}>{cert.estado}</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">Emitido el {formatDate(cert.fecha_emision)}</p>
                  <Link
                    href={`/verificar-certificado/${cert.uuid_publico}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Ver verificación pública <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
