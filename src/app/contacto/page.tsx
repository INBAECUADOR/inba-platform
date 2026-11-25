import type { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, MapPin, Phone, MessageSquare, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contacto - INBA Ecuador',
  description: 'Canales de contacto de INBA Ecuador: afiliaciones, formación, competencias y verificación de certificados.',
}

const contactInfo = {
  address: 'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
  city: 'Quito, Ecuador',
  phone: '+593 2 123 4567',
  email: 'info@inbaecuador.org',
}

const temas = [
  { titulo: 'Afiliaciones', descripcion: 'Altas, renovaciones y carnet digital.' },
  { titulo: 'Formación', descripcion: 'Programas, matrículas y certificación de entrenadores.' },
  { titulo: 'Competencias', descripcion: 'Convocatorias, inscripciones y resultados.' },
  { titulo: 'Certificados', descripcion: 'Verificación pública y solicitudes de corrección.' },
]

export default function ContactoPage() {
  const mailto = `mailto:${contactInfo.email}?subject=${encodeURIComponent('Consulta desde el sitio web de INBA Ecuador')}`

  return (
    <div className="container-inba section-inba space-y-8">
      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Contacto</h1>
        <p className="text-lg text-muted-foreground">
          Escríbenos para consultas sobre afiliación, formación, competencias o verificación de certificados.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-5 p-6">
            <h2 className="text-xl font-semibold text-foreground">Datos de la organización</h2>
            <address className="space-y-4 text-sm not-italic text-muted-foreground">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Oficina</p>
                  <p>{contactInfo.address}</p>
                  <p>{contactInfo.city}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Teléfono</p>
                  <a href={`tel:${contactInfo.phone}`} className="hover:text-primary">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">Correo</p>
                  <a href={mailto} className="hover:text-primary">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            </address>
            <a href={mailto} className="btn-primary w-full gap-2 sm:w-auto">
              <Mail className="h-4 w-4" aria-hidden="true" />
              Escribir correo
            </a>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
                <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
                ¿Sobre qué puedo consultar?
              </h2>
              <ul className="space-y-3">
                {temas.map((tema) => (
                  <li key={tema.titulo} className="text-sm">
                    <span className="font-medium text-foreground">{tema.titulo}: </span>
                    <span className="text-muted-foreground">{tema.descripcion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-6">
              <h2 className="text-xl font-semibold text-foreground">Verificar un certificado</h2>
              <p className="text-sm text-muted-foreground">
                La validación es pública e inmediata: solo necesitas el identificador del certificado.
              </p>
              <Link href="/verificar-certificado" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                Ir a la verificación
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        El formulario de contacto en línea está en implementación. Mientras tanto, el correo y el teléfono indicados son
        los canales oficiales de atención.
      </p>
    </div>
  )
}
