import Link from 'next/link'
import { Dumbbell, Trophy, GraduationCap, Users, Shield, BookOpen, ArrowRight, Calendar, Medal, UserPlus, LogIn, Mail, CreditCard, Award, FileText, Building2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'

export const dynamic = 'force-static'

const afiliacionTypes = [
  {
    name: 'Entrenador Certificado',
    price: '$50/año',
    description: 'Para entrenadores con certificación INBA vigente',
    features: [
      'Directorio público de entrenadores',
      '20% descuento en recertificación',
      'Acceso a eventos exclusivos',
      'Boletín científico mensual',
      'Seguro deportivo básico',
      'Red de contactos privada',
    ],
    cta: 'Solicitar afiliación',
    href: '/afiliacion/solicitud?tipo=entrenador',
  },
  {
    name: 'Atleta Competidor',
    price: '$30/año',
    description: 'Para atletas que compiten en eventos INBA',
    features: [
      'Inscripción simplificada a competencias',
      'Acceso a calendario oficial',
      'Resultados y rankings en línea',
      'Seguro en eventos oficiales',
      'Descuentos en formación',
    ],
    cta: 'Afiliarse como atleta',
    href: '/afiliacion/solicitud?tipo=atleta',
  },
  {
    name: 'Juez Certificado',
    price: '$40/año',
    description: 'Para jueces certificados por INBA',
    features: [
      'Acceso a protocolos de juzgamiento',
      'Actualizaciones de reglamentos',
      'Asignación a eventos oficiales',
      'Formación continua gratuita',
      'Red de jueces nacional',
    ],
    cta: 'Afiliarse como juez',
    href: '/afiliacion/solicitud?tipo=juez',
  },
  {
    name: 'Entidad / Gimnasio',
    price: '$100/año',
    description: 'Para gimnasios y entidades afiliadas',
    features: [
      'Listado en directorio de entidades',
      'Descuentos para afiliados',
      'Eventos promocionales conjuntos',
      'Acceso a materiales educativos',
      'Soporte prioritario',
    ],
    cta: 'Afiliar entidad',
    href: '/afiliacion/solicitud?tipo=entidad',
  },
]

const benefits = [
  { icon: Users, title: 'Directorio Público', desc: 'Apareces en el buscador oficial de INBA Ecuador' },
  { icon: Award, title: 'Eventos Exclusivos', desc: 'Acceso prioritario a seminarios, workshops y congresos' },
  { icon: BookOpen, title: 'Actualización Científica', desc: 'Boletín mensual con evidencia actualizada en entrenamiento y nutrición' },
  { icon: Trophy, title: 'Descuentos', desc: '20% en recertificación, formación y eventos' },
  { icon: Shield, title: 'Seguro Deportivo', desc: 'Cobertura básica en eventos oficiales INBA' },
  { icon: Users, title: 'Red de Contactos', desc: 'Comunidad privada de profesionales del culturismo natural' },
  { icon: Calendar, title: 'Calendario Oficial', desc: 'Acceso anticipado a inscripciones de competencias' },
  { icon: FileText, title: 'Reglamentos Actualizados', desc: 'Acceso inmediato a cambios en normas y categorías' },
]

const requirements = [
  { title: 'Entrenador Certificado', items: ['Certificación INBA vigente', 'Título profesional o técnico afín', 'Experiencia mínima 1 año', 'Certificado de antecedentes'] },
  { title: 'Atleta Competidor', items: ['Inscripción en competencia INBA', 'Certificado médico deportivo', 'Firma de código de ética WADA', 'Foto tipo carnet'] },
  { title: 'Juez Certificado', items: ['Certificación de juez INBA', 'Experiencia en 2+ eventos', 'Curso de actualización anual', 'Evaluación práctica aprobada'] },
  { title: 'Entidad / Gimnasio', items: ['RUC / Registro legal vigente', 'Instalaciones aptas', 'Personal certificado INBA', 'Seguro de responsabilidad civil'] },
];

export default function AfiliacionPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--accent)_0%,_transparent_70%)] opacity-10" aria-hidden="true" />
        <div className="container-inba relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="animate-in slide-in-from-bottom">
              <Badge variant="secondary" className="gap-2">
                <Users className="h-3 w-3" />
                Afiliación INBA Ecuador
              </Badge>
            </div>
            <div className="animate-in slide-in-from-bottom duration-300 delay-100 space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                Únete a la <span className="text-gradient-gold">Comunidad INBA</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Forma parte de la red oficial de profesionales del culturismo natural en Ecuador.
                Accede a beneficios exclusivos, formación continua y la red más grande de entrenadores naturales.
              </p>
            </div>
            <div className="animate-in slide-in-from-bottom duration-300 delay-200 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="#tipos">
                <Button size="lg" className="gap-2 w-full sm:w-auto">
                  <UserPlus className="h-5 w-5" />
                  Ver tipos de afiliación
                </Button>
              </Link>
              <Link href="/contacto" className="btn-outline size-lg gap-2 w-full sm:w-auto">
                <Mail className="h-5 w-5" />
                Consultar requisitos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tipos de Afiliación */}
      <section id="tipos" className="section-inba">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Tipos de <span className="text-gradient-gold">Afiliación</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Elige la categoría que mejor se adapte a tu perfil profesional
            </p>
          </header>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {afiliacionTypes.map((tipo) => (
              <article key={tipo.name} className="card-inba p-6 space-y-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-3">
                    {tipo.name.includes('Entrenador') && <GraduationCap className="h-6 w-6 text-primary" />}
                    {tipo.name.includes('Atleta') && <Trophy className="h-6 w-6 text-primary" />}
                    {tipo.name.includes('Juez') && <Award className="h-6 w-6 text-primary" />}
                    {tipo.name.includes('Entidad') && <Building2 className="h-6 w-6 text-primary" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{tipo.name}</h3>
                    <p className="text-sm text-muted-foreground">{tipo.price}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{tipo.description}</p>
                <ul className="space-y-2">
                  {tipo.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tipo.href}
                  className="btn-primary w-full justify-center gap-2 mt-2"
                >
                  {tipo.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="section-inba bg-muted/30">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Beneficios de <span className="text-gradient-gold">Ser Afiliado</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Más que una membresía, es tu credencial profesional en el culturismo natural
            </p>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit, i) => (
              <article key={i} className="card-inba p-6 space-y-3">
                <div className="rounded-lg bg-primary/10 p-3 w-fit">
                  <benefit.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Requisitos */}
      <section id="requisitos" className="section-inba">
        <div className="container-inba">
          <header className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Requisitos por <span className="text-gradient-gold">Tipo de Afiliación</span>
            </h2>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {requirements.map((req, i) => (
              <article key={i} className="card-inba p-6 space-y-4">
                <h3 className="text-xl font-semibold text-foreground">{req.title}</h3>
                <ul className="space-y-2">
                  {req.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-inba">
        <div className="container-inba">
          <div className="card-inba p-8 md:p-16 bg-primary text-primary-foreground rounded-xl text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Dumbbell className="h-8 w-8" />
                <span className="text-2xl font-bold">¿Listo para afiliarte?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Inicia tu proceso de afiliación hoy
              </h2>
              <p className="text-lg text-primary-foreground/80 max-w-xl mx-auto">
                Completa el formulario en línea y nuestro equipo revisará tu solicitud en 48 horas.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/afiliacion/solicitud">
                  <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 gap-2 w-full sm:w-auto">
                    <UserPlus className="h-5 w-5" />
                    Iniciar solicitud
                  </Button>
                </Link>
                <Link href="/contacto" className="btn-outline size-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 gap-2 w-full sm:w-auto">
                  <Mail className="h-5 w-5" />
                  Consultar dudas
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}