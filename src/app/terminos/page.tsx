import type { Metadata } from 'next'
import { PaginaInstitucionalView } from '@/components/institucional/pagina-institucional'
import { paginasInstitucionales } from '@/content/institucional'

const pagina = paginasInstitucionales.terminos

export const metadata: Metadata = {
  title: `${pagina.titulo} - INBA Ecuador`,
  description: pagina.descripcion,
}

export default function TerminosPage() {
  return <PaginaInstitucionalView pagina={pagina} />
}
