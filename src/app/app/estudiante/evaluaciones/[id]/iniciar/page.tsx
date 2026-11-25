'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowLeft, ClipboardCheck, Clock, Send } from 'lucide-react'
import Link from 'next/link'

interface Opcion {
  id: string
  texto: string
}

interface Pregunta {
  id: string
  enunciado: string
  tipo: 'opcion_multiple' | 'verdadero_falso' | 'respuesta_corta' | 'archivo'
  puntaje: number
  opciones: Opcion[]
}

interface Evaluacion {
  id: string
  titulo: string
  descripcion: string | null
  tiempo_limite_minutos: number | null
  intentos_permitidos: number
}

// Las respuestas abiertas guardan la respuesta esperada como opcion para la
// calificacion por conceptos, pero nunca deben mostrarse como alternativas.
function mostrarOpciones(pregunta: Pregunta) {
  return (
    (pregunta.tipo === 'opcion_multiple' || pregunta.tipo === 'verdadero_falso') && pregunta.opciones.length > 0
  )
}

export default function IniciarEvaluacionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null)
  const [intentoId, setIntentoId] = useState<string | null>(null)
  const [preguntas, setPreguntas] = useState<Pregunta[]>([])
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const iniciar = useCallback(async () => {
    const supabase = createClient()
    setLoading(true)
    setError(null)

    const { data: evaluacionData, error: evaluacionError } = await supabase
      .from('evaluaciones')
      .select('id, titulo, descripcion, tiempo_limite_minutos, intentos_permitidos')
      .eq('id', params.id)
      .maybeSingle()

    if (evaluacionError || !evaluacionData) {
      setError('No se encontró la evaluación o no tienes acceso a ella.')
      setLoading(false)
      return
    }

    setEvaluacion(evaluacionData as Evaluacion)

    const { data: intento, error: intentoError } = await supabase.rpc('iniciar_intento', {
      p_evaluacion_id: params.id,
    })

    if (intentoError || !intento) {
      setError(intentoError?.message ?? 'No se pudo iniciar el intento.')
      setLoading(false)
      return
    }

    setIntentoId(intento as string)

    const { data: preguntasData, error: preguntasError } = await supabase.rpc('obtener_preguntas_intento', {
      p_intento_id: intento as string,
    })

    if (preguntasError) {
      setError(preguntasError.message)
      setLoading(false)
      return
    }

    setPreguntas((preguntasData as Pregunta[]) ?? [])
    setLoading(false)
  }, [params.id])

  useEffect(() => {
    void iniciar()
  }, [iniciar])

  const actualizarRespuesta = (preguntaId: string, valor: string) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: valor }))
  }

  const entregar = async () => {
    if (!intentoId) return
    const sinResponder = preguntas.filter((p) => !respuestas[p.id]?.trim())
    if (sinResponder.length > 0) {
      setError(`Faltan ${sinResponder.length} preguntas por responder.`)
      return
    }

    setError(null)
    setEnviando(true)

    const supabase = createClient()
    const { error: entregaError } = await supabase.rpc('entregar_intento', {
      p_intento_id: intentoId,
      p_respuestas: respuestas,
    })

    if (entregaError) {
      setError(entregaError.message)
      setEnviando(false)
      return
    }

    router.replace(`/app/estudiante/evaluaciones/${params.id}/resultado`)
  }

  if (loading) {
    return (
      <div className="container-inba py-8">
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
          <svg className="h-12 w-12 animate-spin text-primary" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-muted-foreground">Preparando tu evaluación...</p>
        </div>
      </div>
    )
  }

  if (error && preguntas.length === 0) {
    return (
      <div className="container-inba py-8">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" aria-hidden="true" />
            <p className="font-medium text-foreground">{error}</p>
            <Link href="/app/estudiante/evaluaciones" className="btn-outline">
              Volver a evaluaciones
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container-inba max-w-3xl space-y-6 py-8">
      <Link
        href="/app/estudiante/evaluaciones"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver a evaluaciones
      </Link>

      <header className="space-y-3">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{evaluacion?.titulo}</h1>
        {evaluacion?.descripcion && <p className="text-muted-foreground">{evaluacion.descripcion}</p>}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1">
            <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {preguntas.length} preguntas
          </Badge>
          {evaluacion?.tiempo_limite_minutos && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              Límite: {evaluacion.tiempo_limite_minutos} min
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Las respuestas abiertas se evalúan automáticamente por conceptos clave. Puedes enviar el intento una sola vez.
        </p>
      </header>

      <div className="space-y-4">
        {preguntas.map((pregunta, index) => (
          <Card key={pregunta.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">
                <span className="mr-2 text-primary">{index + 1}.</span>
                {pregunta.enunciado}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mostrarOpciones(pregunta) ? (
                <div className="space-y-2">
                  {pregunta.opciones.map((opcion) => (
                    <label
                      key={opcion.id}
                      className="flex cursor-pointer items-start gap-2 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name={`pregunta-${pregunta.id}`}
                        value={opcion.id}
                        checked={respuestas[pregunta.id] === opcion.id}
                        onChange={() => actualizarRespuesta(pregunta.id, opcion.id)}
                        className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
                      />
                      <span className="text-foreground">{opcion.texto}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor={`respuesta-${pregunta.id}`} className="sr-only">
                    Respuesta
                  </label>
                  <textarea
                    id={`respuesta-${pregunta.id}`}
                    value={respuestas[pregunta.id] ?? ''}
                    onChange={(event) => actualizarRespuesta(pregunta.id, event.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    placeholder="Escribe tu respuesta"
                  />
                  {pregunta.tipo !== 'respuesta_corta' && (
                    <p className="text-xs text-muted-foreground">
                      Esta pregunta se responde por escrito y será revisada por el docente.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={entregar} disabled={enviando || preguntas.length === 0} className="gap-2">
          <Send className="h-4 w-4" aria-hidden="true" />
          {enviando ? 'Enviando...' : 'Entregar evaluación'}
        </Button>
        <Link href="/app/estudiante/evaluaciones" className="btn-outline text-center">
          Cancelar
        </Link>
      </div>
    </div>
  )
}
