import { Fragment } from 'react'

/** Los objetivos vienen como JSON serializado dentro de contenido_json. */
export function parseObjetivos(valor: unknown): string[] {
  if (Array.isArray(valor)) {
    return valor.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
  }
  if (typeof valor === 'string' && valor.trim()) {
    try {
      const parsed = JSON.parse(valor)
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      return valor
        .split('\n')
        .map((linea) => linea.replace(/^[-*\d.\s]+/, '').trim())
        .filter(Boolean)
    }
  }
  return []
}

function inline(texto: string) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g)
  return partes.map((parte, indice) => {
    if (parte.startsWith('**') && parte.endsWith('**')) {
      return (
        <strong key={indice} className="font-semibold text-foreground">
          {parte.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={indice}>{parte}</Fragment>
  })
}

interface Bloque {
  tipo: 'parrafo' | 'lista' | 'numerada' | 'titulo'
  items: string[]
}

function bloques(texto: string): Bloque[] {
  const lineas = texto.replace(/\r\n/g, '\n').split('\n')
  const salida: Bloque[] = []
  let actual: Bloque | null = null

  const cerrar = () => {
    if (actual && actual.items.length > 0) salida.push(actual)
    actual = null
  }

  for (const lineaCruda of lineas) {
    const linea = lineaCruda.trimEnd()
    const limpia = linea.trim()

    if (!limpia) {
      cerrar()
      continue
    }

    if (/^[-*]\s+/.test(limpia)) {
      const item = limpia.replace(/^[-*]\s+/, '')
      if (!actual || actual.tipo !== 'lista') {
        cerrar()
        actual = { tipo: 'lista', items: [] }
      }
      actual.items.push(item)
      continue
    }

    if (/^\d+[.)]\s+/.test(limpia)) {
      const item = limpia.replace(/^\d+[.)]\s+/, '')
      if (!actual || actual.tipo !== 'numerada') {
        cerrar()
        actual = { tipo: 'numerada', items: [] }
      }
      actual.items.push(item)
      continue
    }

    cerrar()
    if (limpia.startsWith('#') || (limpia.endsWith(':') && limpia.length < 80 && !limpia.includes('.'))) {
      salida.push({ tipo: 'titulo', items: [limpia.replace(/^#+\s*/, '').replace(/:$/, '')] })
    } else {
      salida.push({ tipo: 'parrafo', items: [limpia] })
    }
  }

  cerrar()
  return salida
}

export function ContenidoLeccion({ texto }: { texto: string }) {
  const contenido = bloques(texto)

  return (
    <div className="space-y-4 text-muted-foreground">
      {contenido.map((bloque, indice) => {
        if (bloque.tipo === 'titulo') {
          return (
            <h3 key={indice} className="pt-2 text-lg font-semibold text-foreground">
              {inline(bloque.items[0])}
            </h3>
          )
        }
        if (bloque.tipo === 'lista') {
          return (
            <ul key={indice} className="list-disc space-y-1.5 pl-5">
              {bloque.items.map((item, i) => (
                <li key={i}>{inline(item)}</li>
              ))}
            </ul>
          )
        }
        if (bloque.tipo === 'numerada') {
          return (
            <ol key={indice} className="list-decimal space-y-1.5 pl-5">
              {bloque.items.map((item, i) => (
                <li key={i}>{inline(item)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={indice} className="leading-relaxed">
            {inline(bloque.items[0])}
          </p>
        )
      })}
    </div>
  )
}
