import type { Metadata } from 'next'
import { PaginaInstitucionalView } from '@/components/institucional/pagina-institucional'
import { paginasInstitucionales } from '@/content/institucional'

const pagina = paginasInstitucionales.cookies

export const metadata: Metadata = {
  title: `${pagina.titulo} - INBA Ecuador`,
  description: pagina.descripcion,
}

export default function CookiesPage() {
  return <PaginaInstitucionalView pagina={pagina} />
}
