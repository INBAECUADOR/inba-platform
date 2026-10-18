import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string }>
}

async function getPage(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('paginas_contenido')
    .select('*')
    .eq('slug', slug)
    .eq('estado', 'publicado')
    .single()

  if (error || !data) return null
  return data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPage(slug)
  
  if (!page) {
    return { title: 'Página no encontrada' }
  }

  return {
    title: page.titulo,
    description: page.seo_json?.description || page.contenido_json?.subtitulo || '',
    openGraph: {
      title: page.titulo,
      description: page.seo_json?.description || '',
      type: 'website',
    },
  }
}

export default async function PublicPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPage(slug)

  if (!page) {
    notFound()
  }

  return (
    <div className="container-inba py-16">
      <article className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            {page.titulo}
          </h1>
          {page.seo_json?.description && (
            <p className="text-muted-foreground text-lg">
              {page.seo_json.description}
            </p>
          )}
        </header>

        <div className="prose prose-inba max-w-none">
          {renderContent(page.contenido_json)}
        </div>
      </article>
    </div>
  )
}

function renderContent(content: any): React.ReactNode {
  if (!content) return null

  if (typeof content === 'string') {
    return <p>{content}</p>
  }

  if (Array.isArray(content)) {
    return (
      <div className="space-y-6">
        {content.map((item, index) => (
          <React.Fragment key={index}>{renderContent(item)}</React.Fragment>
        ))}
      </div>
    )
  }

  if (typeof content === 'object' && content !== null) {
    if (content.titulo && content.contenido) {
      return (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">{content.titulo}</h2>
          <div className="prose prose-inba">{content.contenido}</div>
        </section>
      )
    }

    if (content.secciones) {
      return (
        <div className="space-y-8">
          {content.secciones.map((s: any, i: number) => (
            <section key={i} className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">{s.titulo}</h2>
              <div className="prose prose-inba">{s.contenido}</div>
            </section>
          ))}
        </div>
      )
    }

    if (content.programas) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.programas.map((p: any, i: number) => (
            <article key={i} className="card-inba p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">{p.titulo}</h3>
              <p className="text-muted-foreground">{p.descripcion}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{p.duracion}</span>
                <span>{p.modalidad}</span>
              </div>
              <a href={p.href} className="text-sm font-medium text-primary hover:underline">
                Ver detalles →
              </a>
            </article>
          ))}
        </div>
      )
    }

    if (content.eventos_proximos) {
      return (
        <div className="grid gap-6 md:grid-cols-3">
          {content.eventos_proximos.map((e: any, i: number) => (
            <article key={i} className="card-inba p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>📅</span>
                <time>{e.fecha_inicio} - {e.fecha_fin}</time>
              </div>
              <h3 className="text-xl font-semibold text-foreground">{e.nombre}</h3>
              <p className="text-muted-foreground">{e.sede}</p>
              <span className="badge-inba badge-warning">{e.estado}</span>
            </article>
          ))}
        </div>
      )
    }

    if (content.programas) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {content.programas.map((p: any, i: number) => (
            <article key={i} className="card-inba p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">{p.titulo}</h3>
              <p className="text-muted-foreground">{p.descripcion}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{p.duracion}</span>
                <span>{p.modalidad}</span>
              </div>
              <a href={p.href} className="text-sm font-medium text-primary hover:underline">
                Ver detalles →
              </a>
            </article>
          ))}
        </div>
      )
    }

    if (content.tipos) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.tipos.map((t: any, i: number) => (
            <article key={i} className="card-inba p-6 space-y-4">
              <h3 className="text-xl font-semibold text-foreground">{t.nombre}</h3>
              <p className="text-muted-foreground">{t.descripcion}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{t.duracion_meses} meses</span>
                <span>${t.costo}</span>
              </div>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {t.beneficios?.map((b: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )
    }

    if (content.miembros) {
      return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.miembros.map((m: any, i: number) => (
            <article key={i} className="card-inba p-6 space-y-3 text-center">
              {m.foto_url && (
                <img src={m.foto_url} alt={m.nombre} className="h-24 w-24 rounded-full mx-auto object-cover" />
              )}
              <h3 className="text-lg font-semibold text-foreground">{m.nombre}</h3>
              <p className="text-primary font-medium">{m.cargo}</p>
              <p className="text-muted-foreground text-sm">{m.bio}</p>
            </article>
          ))}
        </div>
      )
    }

    if (content.documentos) {
      return (
        <div className="space-y-4">
          {content.documentos.map((d: any, i: number) => (
            <article key={i} className="card-inba p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground">{d.titulo}</h3>
                <p className="text-sm text-muted-foreground">{d.descripcion}</p>
                <span className="badge-inba">{d.categoria}</span>
              </div>
              <a href={d.archivo_url} target="_blank" rel="noopener noreferrer" className="btn-outline">
                Descargar
              </a>
            </article>
          ))}
        </div>
      )
    }

    if (content.politicas) {
      return (
        <div className="space-y-6">
          {content.politicas.map((p: any, i: number) => (
            <article key={i} className="card-inba p-6 space-y-2">
              <h3 className="text-xl font-semibold text-foreground">{p.titulo}</h3>
              <div className="prose prose-inba">{p.contenido}</div>
            </article>
          ))}
        </div>
      )
    }

    if (content.mision || content.vision) {
      return (
        <div className="space-y-8">
          {content.mision && (
            <section className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Misión</h2>
              <p className="text-muted-foreground">{content.mision}</p>
            </section>
          )}
          {content.vision && (
            <section className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Visión</h2>
              <p className="text-muted-foreground">{content.vision}</p>
            </section>
          )}
          {content.valores && (
            <section className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Valores</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {content.valores.map((v: any, i: number) => (
                  <article key={i} className="card-inba p-4 space-y-1">
                    <h3 className="font-semibold text-foreground">{v.nombre}</h3>
                    <p className="text-muted-foreground text-sm">{v.descripcion}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )
    }

    if (content.hero) {
      return (
        <section className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">{content.hero.titulo}</h1>
          <p className="text-xl text-muted-foreground">{content.hero.subtitulo}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href={content.hero.cta_principal.href} className="btn-primary w-full sm:w-auto">
              {content.hero.cta_principal.texto}
            </a>
            <a href={content.hero.cta_secundario.href} className="btn-outline w-full sm:w-auto">
              {content.hero.cta_secundario.texto}
            </a>
          </div>
        </section>
      )
    }

    if (content.stats) {
      return (
        <section className="grid gap-6 md:grid-cols-4">
          {content.stats.map((s: any, i: number) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-4xl font-bold text-primary">{s.valor}</div>
              <div className="text-sm text-muted-foreground">{s.etiqueta}</div>
            </div>
          ))}
        </section>
      )
    }

    if (content.pilares) {
      return (
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Pilares de <span className="text-gradient-gold">INBA Ecuador</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {content.pilares.map((p: any, i: number) => (
              <article key={i} className="card-inba p-6 space-y-4">
                <div className="rounded-lg bg-primary/10 p-3 w-fit">
                  <p className="text-3xl">{p.icono}</p>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{p.titulo}</h3>
                <p className="text-muted-foreground">{p.descripcion}</p>
                <a href={p.href} className="text-sm font-medium text-primary hover:underline">
                  Explorar →
                </a>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (content.eventos_proximos) {
      return (
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Próximas <span className="text-gradient-gold">Competencias</span>
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {content.eventos_proximos.map((e: any, i: number) => (
              <article key={i} className="card-inba p-6 space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>📅</span>
                  <time>{e.fecha_inicio} - {e.fecha_fin}</time>
                </div>
                <h3 className="text-xl font-semibold text-foreground">{e.nombre}</h3>
                <p className="text-muted-foreground">{e.sede}</p>
                <span className="badge-inba badge-warning">{e.estado}</span>
                <a href="/competencias" className="btn-outline w-full justify-center gap-2">
                  Ver detalles →
                </a>
              </article>
            ))}
          </div>
        </section>
      )
    }

    if (content.info_contacto) {
      return (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <article className="card-inba p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="font-semibold">Dirección</h3>
              <address className="not-italic text-muted-foreground space-y-1">
                <p>{content.info_contacto.direccion}</p>
                <p>{content.info_contacto.ciudad}</p>
              </address>
            </article>
            <article className="card-inba p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold">Teléfono</h3>
              <a href={`tel:${content.info_contacto.telefono}`} className="text-muted-foreground hover:text-primary transition-colors">
                {content.info_contacto.telefono}
              </a>
            </article>
            <article className="card-inba p-6 text-center space-y-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl">✉️</span>
              </div>
              <h3 className="font-semibold">Email</h3>
              <a href={`mailto:${content.info_contacto.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                {content.info_contacto.email}
              </a>
            </article>
          </div>
        </div>
      )
    }

    if (content.redes_sociales) {
      return (
        <div className="flex gap-4 justify-center">
          {content.redes_sociales.map((r: any, i: number) => (
            <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="rounded-full p-3 text-muted-foreground hover:text-primary hover:bg-muted transition-colors" aria-label={r.nombre}>
              <span className="text-2xl">{r.icono}</span>
            </a>
          ))}
        </div>
      )
    }

    return <div className="prose prose-inba">{JSON.stringify(content, null, 2)}</div>
  }

  return null
}