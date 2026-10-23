import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Dumbbell, Award, Shield, Calendar, User, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import Link from 'next/link'

interface CertificateData {
  id: string
  numero_serie: string
  fecha_emision: string
  estado: 'vigente' | 'anulado' | 'revocado'
  curso_nombre: string
  autoridad_nombre: string
  autoridad_cargo: string
  user_nombre: string
  user_dni: string
}

interface PageProps {
  params: Promise<{ uuid: string }>
}

async function getCertificate(uuid: string): Promise<CertificateData | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('certificados')
    .select(`
      id,
      numero_serie,
      fecha_emision,
      estado,
      cursos!inner(nombre),
      user_id,
      profiles!inner(full_name, dni),
      autoridad_nombre,
      autoridad_cargo
    `)
    .eq('uuid_publico', uuid)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    numero_serie: data.numero_serie,
    fecha_emision: data.fecha_emision,
    estado: data.estado,
    curso_nombre: data.cursos?.[0]?.nombre || '',
    autoridad_nombre: data.autoridad_nombre,
    autoridad_cargo: data.autoridad_cargo,
    user_nombre: data.profiles?.[0]?.full_name || '',
    user_dni: data.profiles?.[0]?.dni || '',
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uuid } = await params
  const cert = await getCertificate(uuid)

  if (!cert) {
    return { title: 'Certificado no encontrado' }
  }

  return {
    title: `Certificado ${cert.numero_serie} - INBA Ecuador`,
    description: `Verificación de certificado ${cert.numero_serie} para ${cert.user_nombre}`,
  }
}

export default async function VerificarCertificadoPage({ params }: PageProps) {
  const { uuid } = await params
  const certificate = await getCertificate(uuid)

  if (!certificate) {
    notFound()
  }

  const estadoConfig = {
    vigente: { label: 'Vigente', variant: 'success' as const },
    anulado: { label: 'Anulado', variant: 'destructive' as const },
    revocado: { label: 'Revocado', variant: 'destructive' as const },
  }

  const estado = estadoConfig[certificate.estado] || { label: certificate.estado, variant: 'default' as const };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container-inba max-w-4xl space-y-8">
        <header className="text-center space-y-4">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="INBA Ecuador - Inicio">
            <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span className="font-bold text-xl text-foreground">INBA Ecuador</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Verificación de Certificado</h1>
            <p className="text-muted-foreground">Comprobación oficial de certificación INBA Ecuador</p>
          </div>
        </header>

        <div className="flex items-center justify-center gap-3">
          <Badge variant={estado.variant} className="gap-2 text-lg px-4 py-2">
            {estado.label}
          </Badge>
          {certificate.estado !== 'vigente' && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              <AlertCircle className="h-4 w-4 mr-1" />
              No válido para uso oficial
            </Badge>
          )}
        </div>

        <Card className="space-y-6">
          <CardHeader className="border-b border-border pb-4">
            <CardTitle className="text-2xl">Certificado #{certificate.numero_serie}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Nombre del titular</label>
                <p className="text-lg font-medium text-foreground">{certificate.user_nombre}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">DNI / Cédula</label>
                <p className="font-mono text-lg">{certificate.user_dni}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Programa certificado</label>
                <p className="text-lg font-medium text-foreground">{certificate.curso_nombre}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Fecha de emisión</label>
                <p>{new Date(certificate.fecha_emision).toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Autoridad emisora</label>
                <p className="font-medium">{certificate.autoridad_nombre}</p>
                <p className="text-sm text-muted-foreground">{certificate.autoridad_cargo}</p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Número de serie</label>
                <p className="font-mono text-lg font-medium">{certificate.numero_serie}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Validación</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex-1">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.074 4.057-4.864 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                  </svg>
                  Compartir verificación
                </Button>
                <Button variant="outline" className="flex-1">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Descargar PDF
                </Button>
              </div>
            </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-semibold text-foreground">Verificación oficial</h4>
                <p className="text-sm text-muted-foreground">
                  Esta verificación se realiza directamente contra la base de datos oficial de INBA Ecuador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-amber-600" />
              <div>
                <h4 className="font-semibold text-foreground">Certificación INBA</h4>
                <p className="text-sm text-muted-foreground">
                  Este certificado es emitido por INBA Ecuador bajo sus propios estándares y reglamentos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-semibold text-foreground">Validez</h4>
                <p className="text-sm text-muted-foreground">
                  {certificate.estado === 'vigente'
                    ? 'Certificado vigente y válido para uso oficial.'
                    : 'Certificado no vigente. No válido para uso oficial.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground border-t border-border pt-8">
        <p>INBA Ecuador - Federación Ecuatoriana de Culturismo Natural</p>
        <p>Verificación realizada el {new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="mt-2">
          <Link href="/contacto" className="text-primary hover:underline">
            Contactar para consultas
          </Link>
        </p>
      </div>
    </div>
  </div>
  )
}