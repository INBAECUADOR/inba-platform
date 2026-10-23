import Link from 'next/link'
import { Dumbbell, Trophy, Calendar, Medal, Users, Shield, BookOpen, ArrowRight, MapPin, Clock, Building2, UserPlus, CheckCircle, User, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export const dynamic = 'force-static'

const categories = [
  { name: 'Men\'s Physique', icon: Dumbbell, color: 'text-blue-500' },
  { name: 'Classic Physique', icon: Trophy, color: 'text-amber-500' },
  { name: 'Bodybuilding', icon: Dumbbell, color: 'text-red-500' },
  { name: 'Women\'s Bikini', icon: Medal, color: 'text-pink-500' },
  { name: 'Women\'s Figure', icon: Trophy, color: 'text-purple-500' },
  { name: 'Women\'s Wellness', icon: Medal, color: 'text-orange-500' },
  { name: 'Men\'s Classic', icon: Dumbbell, color: 'text-indigo-500' },
  { name: 'Junior / Master', icon: Users, color: 'text-green-500' },
]

const events = [
  {
    name: 'Campeonato Nacional INBA 2026',
    date: '15-16 Noviembre 2026',
    location: 'Quito - Teatro Nacional',
    status: 'Inscripciones abiertas',
    categories: ['Todas las categorías'],
    deadline: '01 Nov 2026',
    link: '/competencias/inscripcion?evento=nacional-2026',
  },
  {
    name: 'Copa Andes Natural 2026',
    date: '20 Septiembre 2026',
    location: 'Guayaquil - Centro de Convenciones',
    status: 'Próximamente',
    categories: ['Men\'s Physique', 'Classic Physique', 'Bikini'],
    deadline: '01 Sep 2026',
    link: '/competencias/inscripcion?evento=andes-2026',
  },
  {
    name: 'Sudamericano Natural 2026',
    date: '5-7 Diciembre 2026',
    location: 'Cuenca - Coliseo Jefferson Pérez',
    status: 'En planificación',
    categories: ['Todas las categorías'],
    deadline: '15 Nov 2026',
    link: '/competencias/inscripcion?evento=sudamericano-2026',
  },
  {
    name: 'Copa Quito Natural',
    date: '15 Marzo 2026',
    location: 'Quito - Coliseo Rumiñahui',
    status: 'Finalizado',
    categories: ['Bodybuilding', 'Classic Physique', 'Bikini'],
    results: '/competencias/resultados?evento=quito-2026',
  },
  {
    name: 'Copa Guayaquil Natural',
    date: '22 Junio 2026',
    location: 'Guayaquil - Coliseo Voltaire Paladines',
    status: 'Finalizado',
    categories: ['Men\'s Physique', 'Classic Physique', 'Bikini'],
    results: '/competencias/resultados?evento=guayaquil-2026',
  },
]

const categoriesInfo = [
  { name: 'Men\'s Physique', description: 'Evaluación de simetría, muscularidad y presencia escénica. Pantalón de tabla obligatorio.', height: 'Sin límite', weight: 'Sin límite' },
  { name: 'Classic Physique', description: 'Equilibrio entre estética clásica y muscularidad. Límite de peso por altura.', height: 'Según tabla', weight: 'Según tabla' },
  { name: 'Bodybuilding', description: 'Máxima muscularidad, definición y simetría. Categorías por peso.', height: 'Sin límite', weight: 'Por categorías' },
  { name: 'Women\'s Bikini', description: 'Forma atlética, líneas femeninas, presentación y confianza. Bikini reglamentario.', height: 'Sin límite', weight: 'Sin límite' },
  { name: 'Women\'s Figure', description: 'Desarrollo muscular moderado, simetría y líneas femeninas. Traje de dos piezas.', height: 'Sin límite', weight: 'Sin límite' },
  { name: 'Women\'s Wellness', description: 'Desarrollo de tren inferior prioritario, líneas atléticas femeninas. Traje de dos piezas.', height: 'Sin límite', weight: 'Sin límite' },
]

export default function CompetenciasPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_70%)] opacity-10" aria-hidden="true" />
        <div className="container-inba relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="animate-in slide-in-from-bottom">
              <Badge variant="secondary" className="gap-2">
                <Trophy className="h-3 w-3" />
                Competencias Oficiales INBA Ecuador
              </Badge>
            </div>
            <div className="animate-in slide-in-from-bottom duration-300 delay-100 space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Calendario <span className="text-gradient-gold">Oficial 2026</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Eventos oficiales INBA Ecuador con categorías naturales, jueces certificados y total transparencia.
                Competencias WADA compliant con controles antidopaje.
              </p>
            </div>
            <div className="animate-in slide-in-from-bottom duration-300 delay-200 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/competencias/calendario">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <Calendar className="h-5 w-5" />
                  Ver Calendario Completo
                </Button>
              </Link>
              <Link href="/competencias/inscripcion" className="btn-outline size-lg gap-2 w-full sm:w-auto">
                <UserPlus className="h-5 w-5" />
                Inscribirse
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Próximos Eventos */}
      <section id="calendario" className="section-inba">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Próximos <span className="text-gradient-gold">Eventos</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Próximas competencias oficiales INBA Ecuador
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article key={event.name} className="card-inba p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <time className="font-medium text-foreground">{event.date}</time>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{event.name}</h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    event.status === 'Inscripciones abiertas' ? 'success' :
                    event.status === 'Próximamente' ? 'default' :
                    event.status === 'En planificación' ? 'secondary' :
                    'outline'
                  }>
                    {event.status}
                  </Badge>
                  {event.deadline && (
                    <span className="text-sm text-muted-foreground">
                      Límite: {event.deadline}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {event.categories.slice(0, 3).map((cat, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                  ))}
                  {event.categories.length > 3 && (
                    <Badge variant="outline" className="text-xs">+{event.categories.length - 3} más</Badge>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-border">
                  {event.link && (
                    <Link href={event.link} className="btn-primary flex-1 justify-center gap-2">
                      {event.status === 'Finalizado' ? (
                        <>
                          <Award className="h-4 w-4" />
                          Ver resultados
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Inscribirse
                        </>
                      )}
                    </Link>
                  )}
                  <Link href="/competencias" className="btn-outline flex-1 justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ver todas
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/competencias/calendario" className="btn-outline gap-2">
              <Calendar className="h-4 w-4" />
              Ver calendario completo 2026
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section id="categorias" className="section-inba bg-muted/30">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Categorías <span className="text-gradient-gold">Oficiales</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Categorías oficiales INBA alineadas con estándares internacionales
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const info = categoriesInfo.find(c => c.name === cat.name)
              return (
                <article key={cat.name} className="card-inba p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('rounded-lg p-3', `bg-${cat.color.replace('text-', 'bg-')}/10`)}>
                      <cat.icon className={cn('h-7 w-7', cat.color)} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{cat.name}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{info?.description}</p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Altura: {info?.height}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Dumbbell className="h-4 w-4" />
                      <span>Peso: {info?.weight}</span>
                    </div>
                  </div>
                  <Link href="/competencias/inscripcion" className="btn-outline w-full justify-center gap-2">
                    Inscribirse <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Reglas y Reglamentos */}
      <section className="section-inba bg-muted/30">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Reglas y <span className="text-gradient-gold">Reglamentos</span>
            </h2>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-inba p-6">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary" />
                <CardTitle>Antidopaje WADA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Controles aleatorios y dirigidos según código WADA</p>
                <p>Laboratorios acreditados internacionalmente</p>
                <p>Sanciones según código mundial antidopaje</p>
                <Link href="/competencias/reglamentos" className="text-primary hover:underline">Ver reglamento completo →</Link>
              </CardContent>
            </Card>
            <Card className="card-inba p-6">
              <CardHeader>
                <BookOpen className="h-10 w-10 text-primary" />
                <CardTitle>Reglamento de Competencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Criterios de juzgamiento por categoría</p>
                <p>Poses obligatorias y rutina libre</p>
                <p>Puntuación y desempates</p>
                <Link href="/competencias/reglamentos" className="text-primary hover:underline">Ver reglamento completo →</Link>
              </CardContent>
            </Card>
            <Card className="card-inba p-6">
              <CardHeader>
                <Users className="h-10 w-10 text-primary" />
                <CardTitle>Categorías y Pesajes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Categorías oficiales por edad, altura y peso</p>
                <p>Protocolo de pesaje oficial</p>
                <p>Requisitos de elegibilidad</p>
                <Link href="/competencias/categorias" className="text-primary hover:underline">Ver categorías →</Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-inba">
        <div className="container-inba">
          <div className="card-inba p-8 md:p-16 bg-primary text-primary-foreground rounded-xl text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Trophy className="h-8 w-8" />
                <span className="text-2xl font-bold">¿Listo para competir?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Inscríbete en la próxima competencia
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
                Inscríbete temprano y asegura tu cupo. Las inscripciones cierran 15 días antes del evento.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/competencias/inscripcion">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2 w-full sm:w-auto">
                    <UserPlus className="h-5 w-5" />
                    Inscribirse ahora
                  </Button>
                </Link>
                <Link href="/competencias/calendario" className="btn-outline size-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 w-full sm:w-auto">
                  <Calendar className="h-5 w-5" />
                  Ver calendario
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}