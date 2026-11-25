'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, Loader2 } from 'lucide-react'

interface Props {
  matriculaId: string
  leccionId: string
  completada: boolean
}

export function MarcarLeccion({ matriculaId, leccionId, completada }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cambiarEstado = async () => {
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const nuevoEstado = completada ? 'en_progreso' : 'completada'

    const { data: existente } = await supabase
      .from('progreso_lecciones')
      .select('id')
      .eq('matricula_id', matriculaId)
      .eq('leccion_id', leccionId)
      .maybeSingle()

    const payload = {
      estado: nuevoEstado,
      completada_at: completada ? null : new Date().toISOString(),
    }

    const { error: dbError } = existente
      ? await supabase.from('progreso_lecciones').update(payload).eq('id', existente.id)
      : await supabase.from('progreso_lecciones').insert({
          matricula_id: matriculaId,
          leccion_id: leccionId,
          ...payload,
        })

    if (dbError) {
      setError('No se pudo guardar el progreso. Intenta de nuevo.')
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={cambiarEstado}
        disabled={loading}
        variant={completada ? 'outline' : 'default'}
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : completada ? (
          <CheckCircle className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Circle className="h-4 w-4" aria-hidden="true" />
        )}
        {completada ? 'Lección completada' : 'Marcar como completada'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
