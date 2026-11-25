import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PaginaInstitucionalView } from '@/components/institucional/pagina-institucional'
import { paginasInstitucionales } from '@/content/institucional'

const PREFIJO = 'formacion/'

export function generateStaticParams() {
  return Object.keys(paginasInstitucionales)
    .filter((key) => key.startsWith(PREFIJO))
    .map((key) => ({ seccion: key.slice(PREFIJO.length) }))
}

export function generateMetadata({ params }: { params: { seccion: string } }): Metadata {
  const pagina = paginasInstitucionales[`${PREFIJO}${params.seccion}`]
  return pagina
    ? { title: `${pagina.titulo} - INBA Ecuador`, description: pagina.descripcion }
    : { title: 'Sección no encontrada - INBA Ecuador' }
}

export default function FormacionSeccionPage({ params }: { params: { seccion: string } }) {
  const pagina = paginasInstitucionales[`${PREFIJO}${params.seccion}`]
  if (!pagina) notFound()

  return <PaginaInstitucionalView pagina={pagina} />
}
