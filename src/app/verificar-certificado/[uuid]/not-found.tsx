import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function CertificadoNoEncontrado() {
  return (
    <div className="container-inba section-inba flex min-h-[50vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="h-12 w-12 text-primary" aria-hidden="true" />
      <h1 className="mt-6 text-3xl font-bold text-foreground">Certificado no encontrado</h1>
      <p className="mt-2 max-w-lg text-muted-foreground">
        No existe un certificado con ese identificador en la base oficial de INBA Ecuador. Verifica que hayas copiado el
        código completo o consulta con la organización.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/verificar-certificado" className="btn-primary">
          Intentar con otro código
        </Link>
        <Link href="/contacto" className="btn-outline">
          Contactar a la organización
        </Link>
      </div>
    </div>
  )
}
