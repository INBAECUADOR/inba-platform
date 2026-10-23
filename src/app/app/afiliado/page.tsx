'use client'

import { useAuth } from '@/hooks/useAuth'
import { Award, User, Calendar, CreditCard, Shield, Bell, TrendingUp, Users, BookOpen, Trophy, Calendar as CalendarIcon, CreditCard as CreditCardIcon, Users as UsersIcon, BookOpen as BookOpenIcon, Trophy as TrophyIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/utils/cn'

const stats = [
  { label: 'Estado de afiliación', value: 'Vigente', icon: Award, color: 'text-green-600' },
  { label: 'Tipo de afiliación', value: 'Entrenador Certificado', icon: Award, color: 'text-blue-600' },
  { label: 'Fecha de vencimiento', value: '15 Mar 2027', icon: Calendar, color: 'text-amber-600' },
  { label: 'Próximo pago', value: '$50.00', icon: CreditCard, color: 'text-purple-600' },
]

const benefits = [
  { icon: Users, title: 'Directorio público', description: 'Apareces en el directorio oficial de entrenadores INBA', active: true },
  { icon: Award, title: 'Eventos exclusivos', description: 'Acceso prioritario a seminarios y talleres INBA', active: true },
  { icon: BookOpen, title: 'Actualizaciones científicas', description: 'Boletín mensual con evidencia actualizada', active: true },
  { icon: Trophy, title: 'Descuento recertificación', description: '20% de descuento en renovación de certificación', active: true },
  { icon: Shield, title: 'Seguro deportivo', description: 'Cobertura básica en eventos oficiales INBA', active: false },
  { icon: Users, title: 'Red de contactos', description: 'Acceso a comunidad privada de entrenadores INBA', active: true },
]

const upcomingEvents = [
  { name: 'Seminario: Periodización avanzada', date: '15 Nov 2026', location: 'Virtual', status: 'Inscrito', discount: '20% desc. afiliado' },
  { name: 'Taller: Nutrición en peak week', date: '22 Nov 2026', location: 'Quito - Presencial', status: 'Disponible', discount: '15% desc. afiliado' },
  { name: 'Congreso INBA Ciencia del Entrenamiento', date: '10-12 Dic 2026', location: 'Guayaquil', status: 'Próximamente', discount: '30% desc. afiliado' },
]

const paymentHistory = [
  { date: '15 Mar 2026', concept: 'Renovación afiliación - Entrenador Certificado', amount: '$50.00', status: 'Pagado', method: 'Transferencia' },
  { date: '15 Mar 2025', concept: 'Renovación afiliación - Entrenador Certificado', amount: '$50.00', status: 'Pagado', method: 'Tarjeta' },
  { date: '15 Mar 2024', concept: 'Afiliación inicial - Entrenador Certificado', amount: '$50.00', status: 'Pagado', method: 'Efectivo' },
]

export default function AfiliadoPage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="container-inba py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <svg className="h-12 w-12 animate-spin text-primary mx-auto" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-muted-foreground">Cargando tu perfil de afiliado...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mi Perfil de Afiliado</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu afiliación, beneficios y renovaciones</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/afiliado/renovacion">
            <Button className="gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Renovar ahora
            </Button>
          </Link>
        </div>
      </header>

      <section aria-label="Estado de afiliación">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-l-4 border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  </div>
                  <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: stat.color + '10' }}>
                    <stat.icon className="h-6 w-6" style={{ color: stat.color }} aria-hidden="true" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Información de afiliación">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalles de afiliación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm text-muted-foreground">Número de afiliado</label>
                  <p className="font-mono text-lg font-medium">INBA-ENT-2024-001247</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Tipo</label>
                  <p className="font-medium">Entrenador Certificado</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fecha de inicio</label>
                  <p>15 Mar 2024</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Fecha de vencimiento</label>
                  <p className="font-medium text-amber-600">15 Mar 2027</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Estado</label>
                  <Badge variant="success">Vigente</Badge>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Próximo pago</label>
                  <p className="font-medium">$50.00 - 15 Mar 2027</p>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <Progress value={75} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">Tu afiliación vence en 6 meses. Renovación automática activada.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximo pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="card-inba p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Renovación anual - Entrenador Certificado</p>
                    <p className="text-sm text-muted-foreground">Vence: 15 Marzo 2027</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">$50.00</p>
                    <p className="text-sm text-muted-foreground">Pago anual</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Método preferido: </span>
                  <span className="font-medium">Transferencia bancaria</span>
                </div>
                <div className="flex gap-2">
                  <Link href="/app/afiliado/renovacion">
                    <Button className="flex-1">Renovar ahora</Button>
                  </Link>
                  <Button variant="outline">Cambiar método</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-label="Beneficios activos">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Mis beneficios</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="card-inba p-6 space-y-3">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: benefit.active ? 'rgba(212, 175, 55, 0.1)' : 'rgba(116, 116, 116, 0.1)' }}>
                  <benefit.icon className="h-5 w-5" style={{ color: benefit.active ? '#d4af37' : '#a9a9ae' }} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{benefit.description}</p>
                </div>
                <Badge variant={benefit.active ? 'success' : 'outline'}>
                  {benefit.active ? 'Activo' : 'No disponible'}
                </Badge>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Eventos para afiliados">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Eventos para afiliados</h2>
          <Link href="/app/afiliado/eventos" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {upcomingEvents.map((event) => (
            <article key={event.name} className="card-inba p-6 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">{event.name}</h3>
                  <p className="text-sm text-muted-foreground">{event.date} · {event.location}</p>
                </div>
                <Badge variant={event.status === 'Inscrito' ? 'success' : event.status === 'Disponible' ? 'default' : 'outline'}>
                  {event.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{event.discount}</p>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Link href={`/app/afiliado/eventos/${event.name}`} className="btn-outline text-sm flex-1 justify-center">
                  Ver detalles
                </Link>
                {event.status === 'Disponible' && (
                  <Link href={`/app/afiliado/eventos/${event.name}/inscribir`} className="btn-primary text-sm flex-1 justify-center">
                    Inscribirme
                  </Link>
                )}
                {event.status === 'Inscrito' && (
                  <Button variant="outline" className="flex-1 justify-center" disabled>
                    Ya inscrito
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-label="Historial de pagos">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Historial de pagos</h2>
        </div>
        <div className="card-inba overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold text-muted-foreground">Fecha</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Concepto</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Monto</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Estado</th>
                <th className="text-left p-4 font-semibold text-muted-foreground">Método</th>
                <th className="text-right p-4 font-semibold text-muted-foreground">Comprobante</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((payment) => (
                <tr key={payment.date} className="border-b border-border hover:bg-muted/50">
                  <td className="p-4 text-muted-foreground">{payment.date}</td>
                  <td className="p-4 text-foreground">{payment.concept}</td>
                  <td className="p-4 font-medium text-foreground">{payment.amount}</td>
                  <td className="p-4">
                    <Badge variant={payment.status === 'Pagado' ? 'success' : 'warning'}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-muted-foreground">{payment.method}</td>
                  <td className="p-4 text-right">
                    <Button variant="ghost" size="sm">Ver</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}