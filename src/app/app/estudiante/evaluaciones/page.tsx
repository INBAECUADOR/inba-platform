'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { EvaluacionesMainView } from '@/components/estudiante/EvaluacionesMainView'

interface Evaluation {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  tiempo_limite_minutos: number | null
  intentos_permitidos: number
  fecha_inicio: string | null
  fecha_fin: string | null
  estado: string
  curso_id: string
  curso_nombre: string
  modulo_nombre: string | null
  ponderacion: number
  intentos?: Attempt[]
  intentos_usados?: number
  mejor_nota?: number | null
}

interface Attempt {
  id: string
  evaluacion_id: string
  numero_intento: number
  estado: string
  iniciado_at: string
  entregado_at: string | null
  nota_final: number | null
}

function LoadingView() {
  return (
    <div className="container-inba py-8">
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <svg className="h-12 w-12 animate-spin text-primary mx-auto" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-muted-foreground">Cargando tus evaluaciones...</p>
        </div>
      </div>
    </div>
  )
}

export default function EvaluacionesPage() {
  const [evaluaciones, setEvaluaciones] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'disponibles' | 'completadas' | 'calificadas'>('disponibles')

  useEffect(() => {
    async function fetchEvaluaciones() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: matriculas } = await supabase
        .from('matriculas')
        .select('id, curso_id')
        .eq('user_id', user.id)
        .eq('estado', 'activa')

      if (!matriculas?.length) {
        setEvaluaciones([])
        setLoading(false)
        return
      }

      const cursoIds = matriculas.map(m => m.curso_id)
      const matriculaIds = matriculas.map(m => m.id)

      const { data: evaluacionesData } = await supabase
        .from('evaluaciones')
        .select(`
          id,
          titulo,
          descripcion,
          tipo,
          tiempo_limite_minutos,
          intentos_permitidos,
          fecha_inicio,
          fecha_fin,
          estado,
          curso_id,
          ponderacion,
          cursos!inner(nombre),
          modulos!inner(nombre)
        `)
        .in('curso_id', cursoIds)
        .eq('estado', 'publicado')

      const { data: intentosData } = await supabase
        .from('intentos_evaluacion')
        .select('*')
        .in('matricula_id', matriculaIds)

      const attemptsByEval: Record<string, any[]> = {}
      intentosData?.forEach(attempt => {
        if (!attemptsByEval[attempt.evaluacion_id]) {
          attemptsByEval[attempt.evaluacion_id] = []
        }
        attemptsByEval[attempt.evaluacion_id].push(attempt)
      })

      const evaluacionesConIntentos = (evaluacionesData || []).map(evaluacion => ({
        ...evaluacion,
        modulo_nombre: evaluacion.modulos?.[0]?.nombre || null,
        curso_nombre: evaluacion.cursos?.[0]?.nombre || '',
        intentos: attemptsByEval[evaluacion.id] || [],
        mejor_nota: attemptsByEval[evaluacion.id]?.reduce((max, a) => Math.max(max, a.nota_final || 0), 0) || null,
        intentos_usados: attemptsByEval[evaluacion.id]?.length || 0,
      }))

      setEvaluaciones(evaluacionesConIntentos)
      setLoading(false)
    }

    fetchEvaluaciones()
  }, [])

  const getEvaluacionesFiltradas = () => {
    const now = new Date()
    return evaluaciones.filter(evaluacion => {
      const fechaFin = evaluacion.fecha_fin ? new Date(evaluacion.fecha_fin) : null
      const fechaInicio = evaluacion.fecha_inicio ? new Date(evaluacion.fecha_inicio) : null
      const estaDisponible = (!fechaInicio || fechaInicio <= now) && (!fechaFin || fechaFin >= now)
      const intentos = evaluacion.intentos || []
      const intentosUsados = evaluacion.intentos_usados || 0
      const mejorNota = evaluacion.mejor_nota || 0
      const aprobado = mejorNota !== null && mejorNota >= 70
      const puedeIntentar = (evaluacion.intentos_permitidos === 0 || intentosUsados < evaluacion.intentos_permitidos) && estaDisponible

      switch (activeTab) {
        case 'disponibles':
          return estaDisponible && puedeIntentar && !aprobado
        case 'completadas':
          return aprobado
        case 'calificadas':
          return intentos.length > 0 && !aprobado
        default:
          return false
      }
    })
  }

  const evaluacionesFiltradas = getEvaluacionesFiltradas()

  if (loading) {
    return <LoadingView />
  }

  return (
    <EvaluacionesMainView
      evaluaciones={evaluaciones}
      evaluacionesFiltradas={evaluacionesFiltradas}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  )
}