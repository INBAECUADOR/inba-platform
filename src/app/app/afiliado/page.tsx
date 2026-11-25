import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSessionContext } from '@/lib/auth/server'
import { formatDate } from '@/utils/format'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, ExternalLink, CreditCard, ShieldCheck, UserCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AfiliadoPage() {
  const context = await getSessionContext()
  const supabase = await createClient()

  const { data: afiliacion } = await supabase
    .from('afiliaciones')
    .select('id, estado, numero_afiliado, fecha_inicio, fecha_fin')
    .eq('user_id', context.ok ? context.userId : '00000000-0000-0000-0000-000000000000')
    .order('created_at', { ascending: false })
    .maybeSingle()

  const vigente =
    afiliacion?.estado === 'activa' && (!afiliacion.fecha_fin || new Date(afiliacion.fecha_fin) >= new Date())

  return (
    <div className="container-inba space-y-8 py-8">
      <header className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <UserCircle className="h-7 w-7 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi afiliación</h1>
          <p className="mt-1 text-muted-foreground">
            {context.ok && context.fullName ? context.fullName : 'Afiliado INBA Ecuador'}
          </p>
          <div className="mt-3">
            {vigente ? (
              <Badge className="gap-1">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Afiliación vigente
              </Badge>
            ) : (
              <Badge variant="secondary">Sin afiliación vigente</Badge>
            )}
          </div>
        </div>
      </header>

      {afiliacion ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
              Datos de afiliación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">Número de afiliado</dt>
                <dd className="font-mono text-sm font-medium text-foreground">
                  {afiliacion.numero_afiliado || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Estado</dt>
                <dd className="text-sm font-medium text-foreground">{afiliacion.estado}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Vigente desde</dt>
                <dd className="text-sm font-medium text-foreground">{formatDate(afiliacion.fecha_inicio)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Vigente hasta</dt>
                <dd className="text-sm font-medium text-foreground">{formatDate(afiliacion.fecha_fin)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-3 py-10 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="font-medium text-foreground">Todavía no tienes una afiliación registrada</p>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">
              La solicitud en línea está en implementación. Puedes revisar las modalidades, requisitos y beneficios, y
              escribir a la organización para iniciar el trámite.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/afiliacion/tipos" className="btn-primary">
                Ver modalidades
              </Link>
              <Link href="/afiliacion/requisitos" className="btn-outline">
                Requisitos
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4 text-primary" aria-hidden="true" />
              Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Consulta las competencias y seminarios oficiales publicados.</p>
            <Link href="/competencias/calendario" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Ver calendario <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Beneficios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Competencias, formación, certificados verificables y comunidad profesional.</p>
            <Link href="/afiliacion/beneficios" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
              Ver beneficios <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
