import Link from 'next/link'
import { Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-inba section-inba flex min-h-[50vh] flex-col items-center justify-center text-center">
      <Compass className="h-12 w-12 text-primary" aria-hidden="true" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">Página no encontrada</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        La dirección que buscas no existe o fue movida. Puedes volver al inicio o consultar las secciones principales.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
        <Link href="/formacion" className="btn-outline">
          Ver formación
        </Link>
        <Link href="/verificar-certificado" className="btn-outline">
          Verificar certificado
        </Link>
      </div>
    </div>
  )
}
