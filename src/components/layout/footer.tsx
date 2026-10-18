import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone, Dumbbell, Video } from 'lucide-react'
import { cn } from '@/utils/cn'

const footerLinks = {
  institucion: [
    { name: 'Historia', href: '/asociacion/historia' },
    { name: 'Misión y Visión', href: '/asociacion/mision-vision' },
    { name: 'Equipo Directivo', href: '/asociacion/equipo' },
    { name: 'Reglamentos', href: '/asociacion/reglamentos' },
    { name: 'Políticas', href: '/asociacion/politicas' },
  ],
  competencias: [
    { name: 'Calendario', href: '/competencias/calendario' },
    { name: 'Categorías', href: '/competencias/categorias' },
    { name: 'Inscripciones', href: '/competencias/inscripcion' },
    { name: 'Resultados', href: '/competencias/resultados' },
    { name: 'Reglamentos', href: '/competencias/reglamentos' },
  ],
  formacion: [
    { name: 'Programas', href: '/formacion/programas' },
    { name: 'Certificación Entrenadores', href: '/formacion/certificacion' },
    { name: 'Metodología', href: '/formacion/metodologia' },
    { name: 'Docentes', href: '/formacion/docentes' },
    { name: 'Inscripciones', href: '/formacion/inscripcion' },
  ],
  afiliacion: [
    { name: 'Tipos de Afiliación', href: '/afiliacion/tipos' },
    { name: 'Requisitos', href: '/afiliacion/requisitos' },
    { name: 'Solicitud', href: '/afiliacion/solicitud' },
    { name: 'Renovación', href: '/afiliacion/renovacion' },
    { name: 'Beneficios', href: '/afiliacion/beneficios' },
  ],
}

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/inbaecuador', icon: Facebook },
  { name: 'Instagram', href: 'https://instagram.com/inbaecuador', icon: Instagram },
  { name: 'YouTube', href: 'https://youtube.com/@inbaecuador', icon: Video },
  { name: 'Twitter', href: 'https://twitter.com/inbaecuador', icon: Twitter },
]

const contactInfo = {
  address: 'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
  city: 'Quito, Ecuador',
  phone: '+593 2 123 4567',
  email: 'info@inbaecuador.org',
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-muted/50 border-t border-border" role="contentinfo">
      <div className="container-inba section-inba">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2" aria-label="INBA Ecuador - Inicio">
              <Dumbbell className="h-10 w-10 text-primary" aria-hidden="true" />
              <span className="font-bold text-2xl text-foreground">INBA Ecuador</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              Federación Ecuatoriana de Culturismo Natural. Promovemos el deporte limpio, la ciencia del entrenamiento y la formación profesional de entrenadores.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full p-2 text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Institución</h3>
            <nav aria-label="Enlaces institucionales">
              <ul className="space-y-2">
                {footerLinks.institucion.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Competencias</h3>
            <nav aria-label="Enlaces de competencias">
              <ul className="space-y-2">
                {footerLinks.competencias.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Formación</h3>
            <nav aria-label="Enlaces de formación">
              <ul className="space-y-2">
                {footerLinks.formacion.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Afiliación</h3>
            <nav aria-label="Enlaces de afiliación">
              <ul className="space-y-2">
                {footerLinks.afiliacion.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <address className="not-italic space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <p>{contactInfo.address}</p>
                  <p>{contactInfo.city}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a href={`tel:${contactInfo.phone}`} className="hover:text-primary transition-colors">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary transition-colors">
                  {contactInfo.email}
                </a>
              </div>
            </address>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} INBA Ecuador. Todos los derechos reservados.
            </p>
            <nav className="flex gap-6" aria-label="Enlaces legales">
              <Link href="/privacidad" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terminos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Política de Cookies
              </Link>
              <Link href="/verificar-certificado" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Verificar Certificado
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}