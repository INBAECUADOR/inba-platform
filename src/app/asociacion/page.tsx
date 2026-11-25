import Link from 'next/link'
import { ArrowRight, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const secciones = [
  { nombre: 'Historia', href: '/asociacion/historia', descripcion: 'Trayectoria y líneas de trabajo de la organización.' },
  { nombre: 'Misión y Visión', href: '/asociacion/mision-vision', descripcion: 'Propósito, visión y valores institucionales.' },
  { nombre: 'Equipo Directivo', href: '/asociacion/equipo', descripcion: 'Áreas de trabajo de la organización.' },
  { nombre: 'Reglamentos', href: '/asociacion/reglamentos', descripcion: 'Documentos que rigen la actividad institucional.' },
  { nombre: 'Políticas', href: '/asociacion/politicas', descripcion: 'Juego limpio, integridad y protección de datos.' },
]

export default function AsociacionPage() {
  return (
    <div className="container-inba section-inba space-y-8">
      <header className="max-w-3xl space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="h-6 w-6" aria-hidden="true" />
          <span className="text-sm font-semibold uppercase tracking-wide">Institución</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">La organización</h1>
        <p className="text-lg text-muted-foreground">
          INBA Ecuador reúne a atletas, entrenadores, jueces y clubes en torno al culturismo natural. Estas secciones
          explican cómo se organiza y qué reglas aplican.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {secciones.map((seccion) => (
          <Link key={seccion.href} href={seccion.href} className="group">
            <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-lg">
              <CardContent className="space-y-2 p-6">
                <h2 className="flex items-center justify-between gap-2 text-lg font-semibold text-foreground group-hover:text-primary">
                  {seccion.nombre}
                  <ArrowRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                </h2>
                <p className="text-sm text-muted-foreground">{seccion.descripcion}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
