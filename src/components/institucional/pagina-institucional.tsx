import Link from 'next/link'
import { ArrowLeft, ArrowRight, CheckCircle, Info } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { PaginaInstitucional } from '@/content/institucional'

interface Props {
  pagina: PaginaInstitucional
}

export function PaginaInstitucionalView({ pagina }: Props) {
  return (
    <div className="container-inba section-inba space-y-8">
      <nav aria-label="Migas de pan">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Volver al inicio
        </Link>
      </nav>

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{pagina.titulo}</h1>
        <p className="text-lg text-muted-foreground">{pagina.descripcion}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {pagina.bloques.map((bloque) => (
          <section key={bloque.titulo} className="card-inba space-y-3 p-6">
            <h2 className="text-xl font-semibold text-foreground">{bloque.titulo}</h2>
            {bloque.parrafos?.map((parrafo) => (
              <p key={parrafo} className="text-muted-foreground">
                {parrafo}
              </p>
            ))}
            {bloque.items && (
              <ul className="space-y-2">
                {bloque.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      {pagina.nota && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-5">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">{pagina.nota}</p>
          </CardContent>
        </Card>
      )}

      {pagina.cta && (
        <div className="pt-2">
          <Link href={pagina.cta.href} className="btn-primary gap-2">
            {pagina.cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
