import Link from 'next/link'
import { BookMarked, ExternalLink, ListChecks, Target } from 'lucide-react'
import type { GuiaModulo, Lectura } from '@/content/biblioteca'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const TIPO_LABEL: Record<Lectura['tipo'], string> = {
  libro: 'Libro',
  articulo: 'Artículo científico',
  guia: 'Documento oficial',
  web: 'Recurso web',
}

export function LecturasModulo({ lecturas }: { lecturas: Lectura[] }) {
  return (
    <ul className="space-y-3">
      {lecturas.map((lectura) => (
        <li key={`${lectura.titulo}-${lectura.anio ?? ''}`} className="text-sm">
          <div className="flex flex-wrap items-baseline gap-x-2">
            {lectura.url ? (
              <a
                href={lectura.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {lectura.titulo}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : (
              <span className="font-medium text-foreground">{lectura.titulo}</span>
            )}
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {TIPO_LABEL[lectura.tipo]}
              {lectura.anio ? ` · ${lectura.anio}` : ''}
            </span>
          </div>
          {lectura.autores && <p className="text-muted-foreground">{lectura.autores}</p>}
          {lectura.nota && <p className="text-muted-foreground">{lectura.nota}</p>}
        </li>
      ))}
    </ul>
  )
}

interface Props {
  guia: GuiaModulo
  cursoId?: string
  mostrarEnlace?: boolean
}

export function GuiaModuloCard({ guia, cursoId, mostrarEnlace = true }: Props) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookMarked className="h-4 w-4 text-primary" aria-hidden="true" />
          Guía de estudio: Módulo {guia.orden}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{guia.resumen}</p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" aria-hidden="true" />
            Conceptos que debes dominar
          </h4>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {guia.conceptosClave.map((concepto) => (
              <li key={concepto}>{concepto}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <ListChecks className="h-4 w-4 text-primary" aria-hidden="true" />
            Dónde leer más
          </h4>
          <LecturasModulo lecturas={guia.lecturas} />
        </div>

        {mostrarEnlace && cursoId && (
          <Link
            href={`/app/estudiante/cursos/${cursoId}/guia`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver la guía completa del curso
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
