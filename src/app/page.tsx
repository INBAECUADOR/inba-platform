import Link from 'next/link'
import { Dumbbell, Trophy, GraduationCap, Users, Shield, BookOpen, ArrowRight, Calendar, Medal, UserPlus, LogIn, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'

export const dynamic = 'force-static'

const stats = [
  { value: '15+', label: 'Años de experiencia' },
  { value: '500+', label: 'Atletas certificados' },
  { value: '12', label: 'Competencias anuales' },
  { value: '50+', label: 'Entrenadores formados' },
]

const features = [
  {
    icon: GraduationCap,
    title: 'Formación Científica',
    description: 'Programa basado en evidencia con 12 módulos: anatomía, biomecánica, fisiología, nutrición, programación y ética.',
    href: '/formacion',
  },
  {
    icon: Trophy,
    title: 'Competencias Oficiales',
    description: 'Calendario anual de eventos INBA con categorías naturales, jueces certificados y transparencia total.',
    href: '/competencias',
  },
  {
    icon: Shield,
    title: 'Culturismo Natural',
    description: 'Compromiso absoluto con el juego limpio. Cumplimiento estricto de códigos WADA y controles antidopaje.',
    href: '/asociacion/politicas',
  },
  {
    icon: Users,
    title: 'Comunidad Profesional',
    description: 'Red de entrenadores, atletas y jueces. Afiliación con beneficios, actualización continua y networking.',
    href: '/afiliacion',
  },
]

const upcomingEvents = [
  { name: 'Campeonato Nacional INBA 2026', date: '15-16 Nov 2026', location: 'Quito', status: 'Inscripciones abiertas' },
  { name: 'Copa Andes Natural', date: '20 Sep 2026', location: 'Guayaquil', status: 'Próximamente' },
  { name: 'Sudamericano Natural 2026', date: '5-7 Dic 2026', location: 'Cuenca', status: 'En planificación' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_70%)] opacity-10" aria-hidden="true" />
        <div className="container-inba relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="animate-in slide-in-from-bottom">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                Inscripciones abiertas: Certificación Entrenadores 2026
              </span>
            </div>

            <div className="animate-in slide-in-from-bottom duration-300 delay-100 space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Federación Ecuatoriana de{' '}
                <span className="text-gradient-gold">Culturismo Natural</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Formamos entrenadores con base científica, promovemos el juego limpio y organizamos competencias de alto nivel.
                Autoridad deportiva, transparencia y excelencia académica.
              </p>
            </div>

            <div className="animate-in slide-in-from-bottom duration-300 delay-200 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/formacion">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <GraduationCap className="h-5 w-5" />
                  Explorar Formación
                </Button>
              </Link>
              <Link href="/competencias">
                <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                  <Calendar className="h-5 w-5" />
                  Próximas Competencias
                </Button>
              </Link>
              <Link href="/afiliacion">
                <Button variant="ghost" size="lg" className="gap-2 w-full sm:w-auto">
                  <UserPlus className="h-5 w-5" />
                  Afiliarse
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                Inscripciones abiertas 2026
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Certificación WADA Compliant
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-inba bg-muted/30">
        <div className="container-inba">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-primary">{stat.value}</div>
                <div className="text-muted-foreground text-sm font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-inba">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Pilares de <span className="text-gradient-gold">INBA Ecuador</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Cuatro pilares fundamentales que sustentan nuestra misión de promover el culturismo natural con rigor científico y ética profesional.
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="card-inba p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="rounded-lg bg-primary/10 p-3 w-fit">
                  <feature.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <Link
                  href={feature.href}
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Explorar <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section-inba bg-muted/30">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Próximas <span className="text-gradient-gold">Competencias</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Eventos oficiales INBA Ecuador con categorías naturales, jueces certificados y total transparencia.
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            {upcomingEvents.map((event) => (
              <article key={event.name} className="card-inba p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <time className="font-medium text-foreground">{event.date}</time>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{event.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'badge-inba',
                    event.status === 'Inscripciones abiertas' && 'badge-success',
                    event.status === 'Próximamente' && 'badge-warning',
                    event.status === 'En planificación' && 'bg-muted text-muted-foreground border-border'
                  )}>
                    {event.status}
                  </span>
                </div>
                <Link
                  href="/competencias"
                  className="btn-outline w-full justify-center gap-2"
                >
                  Ver detalles <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/competencias" className="btn-outline gap-2">
              <Calendar className="h-4 w-4" />
              Ver calendario completo
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-inba">
        <div className="container-inba">
          <div className="card-inba p-8 md:p-16 bg-primary text-primary-foreground rounded-xl text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Dumbbell className="h-8 w-8" />
                <span className="text-2xl font-bold">¿Listo para dar el siguiente paso?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Inicia tu certificación como entrenador de culturismo natural
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
                Programa basado en evidencia científica, 12 módulos completos, prácticas supervisadas y certificación oficial INBA.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/formacion">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2 w-full sm:w-auto">
                    <GraduationCap className="h-5 w-5" />
                    Iniciar inscripción
                  </Button>
                </Link>
                <Link href="/contacto">
                  <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 w-full sm:w-auto">
                    <Mail className="h-5 w-5" />
                    Solicitar información
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-primary-foreground/60 mt-4">
                Próximo inicio: Enero 2026 · Cupos limitados · Modalidad híbrida
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 border-t border-border">
        <div className="container-inba">
          <div className="grid gap-8 md:grid-cols-5">
            <div className="text-center space-y-2">
              <Shield className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Juego Limpio</h3>
              <p className="text-sm text-muted-foreground">Cumplimiento WADA</p>
            </div>
            <div className="text-center space-y-2">
              <BookOpen className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Evidencia Científica</h3>
              <p className="text-sm text-muted-foreground">Programa basado en papers</p>
            </div>
            <div className="text-center space-y-2">
              <GraduationCap className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Certificación Oficial</h3>
              <p className="text-sm text-muted-foreground">Reconocida por INBA</p>
            </div>
            <div className="text-center space-y-2">
              <Medal className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Competencias Reales</h3>
              <p className="text-sm text-muted-foreground">Eventos oficiales anuales</p>
            </div>
            <div className="text-center space-y-2">
              <Users className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Comunidad Activa</h3>
              <p className="text-sm text-muted-foreground">Entrenadores y atletas</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}