'use client'

export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { ClipboardCheck, Clock, AlertCircle, CheckCircle, AlertTriangle, Award } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

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
  intentos: Attempt[]
  intentos_usados: number
  mejor_nota: number | null
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

  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Evaluaciones</h1>
          <p className="text-muted-foreground mt-1">Examenes, tareas y practicas de tus cursos</p>
        </div>
      </header>

      <div className="border-b border-border">
        <nav className="flex gap-4 -mb-px" aria-label="Filtros de evaluaciones">
          <button
            onClick={() => setActiveTab('disponibles')}
            className={cn(
              'pb-4 text-sm font-medium transition-colors',
              activeTab === 'disponibles'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Disponibles ({evaluaciones.filter(e => {
              const now = new Date()
              const fechaFin = e.fecha_fin ? new Date(e.fecha_fin) : null
              const fechaInicio = e.fecha_inicio ? new Date(e.fecha_inicio) : null
              const estaDisponible = (!fechaInicio || fechaInicio <= new Date()) && (!fechaFin || fechaFin >= new Date())
              const intentos = e.intentos || []
              const intentosUsados = e.intentos_usados || 0
              const mejorNota = e.mejor_nota || 0
              const aprobado = e.mejor_nota !== null && e.mejor_nota >= 70
              const puedeIntentar = (e.intentos_permitidos === 0 || e.intentos_usados < e.intentos_permitidos) && estaDisponible
              return estaDisponible && puedeIntentar && !aprobado
            }).length})
          </button>
          <button
            onClick={() => setActiveTab('calificadas')}
            className={cn(
              'pb-4 text-sm font-medium transition-colors',
              activeTab === 'calificadas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Por calificar ({evaluaciones.filter(e => (e.intentos || []).length > 0 && (e.mejor_nota || 0) < 70).length})
          </button>
          <button
            onClick={() => setActiveTab('completadas')}
            className={cn(
              'pb-4 text-sm font-medium transition-colors',
              activeTab === 'completadas'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Aprobadas ({evaluaciones.filter(e => (e.mejor_nota || 0) >= 70).length})
          </button>
        </nav>
      </div>

      {evaluacionesFiltradas.length === 0 && (
        <div className="text-center py-16">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {activeTab === 'disponibles' ? 'No hay evaluaciones disponibles' :
             activeTab === 'calificadas' ? 'No hay evaluaciones por calificar' :
             'No hay evaluaciones aprobadas'}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {activeTab === 'disponibles' ? 'Cuando hay evaluaciones disponibles apareceran aqui.' :
             activeTab === 'calificadas' ? 'Las evaluaciones que has entregado y estan pendientes de calificacion apareceran aqui.' :
             'Las evaluaciones que has aprobado apareceran aqui.'}
          </p>
        </div>
      )}

      <div className="space-y-4">
        {evaluacionesFiltradas.map((evaluacion) => {
          const ahora = new Date()
          const fechaFin = evaluacion.fecha_fin ? new Date(evaluacion.fecha_fin) : null
          const fechaInicio = evaluacion.fecha_inicio ? new Date(evaluacion.fecha_inicio) : null
          const estaDisponible = (!fechaInicio || fechaInicio <= ahora) && (!fechaFin || fechaFin >= ahora)
          const tiempoRestante = fechaFin ? Math.max(0, Math.ceil((fechaFin.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))) : null
          const intentos = evaluacion.intentos || []
          const intentosUsados = evaluacion.intentos_usados || 0
          const mejorNota = evaluacion.mejor_nota || 0
          const aprobado = mejorNota !== null && mejorNota >= 70
          const puedeIntentar = (evaluacion.intentos_permitidos === 0 || intentosUsados < evaluacion.intentos_permitidos) && (!fechaFin || fechaFin >= ahora)

          return (
            <article key={evaluacion.id} className="card-inba overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={
                        evaluacion.tipo === 'examen_final' ? 'destructive' :
                        evaluacion.tipo === 'cuestionario' ? 'default' :
                        evaluacion.tipo === 'tarea' ? 'secondary' :
                        'outline'
                      }>
                        {evaluacion.tipo.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge variant="secondary">{evaluacion.curso_nombre}</Badge>
                      {evaluacion.modulo_nombre && <Badge variant="outline">{evaluacion.modulo_nombre}</Badge>}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground truncate">{evaluacion.titulo}</h3>
                    {evaluacion.descripcion && <p className="text-sm text-muted-foreground mt-1">{evaluacion.descripcion}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-foreground">{evaluacion.ponderacion}%</p>
                      <p className="text-xs text-muted-foreground">Ponderacion</p>
                    </div>
                    {aprobado && (
                      <Badge variant="success" className="text-lg px-3 py-1">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        APROBADO
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Intentos</p>
                    <p className="text-2xl font-bold text-foreground">
                      {intentosUsados} / {evaluacion.intentos_permitidos === 0 ? 'infinito' : evaluacion.intentos_permitidos}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Mejor nota</p>
                    <p className="text-2xl font-bold text-foreground">
                      {mejorNota !== null ? mejorNota.toFixed(1) + ' / 100' : '—'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {fechaFin ? 'Dias restantes' : 'Sin fecha limite'}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {fechaFin ? tiempoRestante + 'd' : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {evaluacion.tiempo_limite_minutos
                        ? 'Tiempo limite: ' + evaluacion.tiempo_limite_minutos + ' min'
                        : 'Sin limite de tiempo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Ponderacion: {evaluacion.ponderacion}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  {aprobado ? (
                    <>
                      <Badge variant="success" className="flex-1 justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aprobado con {mejorNota ? mejorNota.toFixed(1) : '0'}%
                      </Badge>
                      <Link href={'/app/estudiante/evaluaciones/' + evaluacion.id + '/resultado'}>
                        <Button variant="outline" className="gap-2">
                          <Award className="h-4 w-4" />
                          Ver certificado
                        </Button>
                      </Link>
                    </>
                  ) : !estaDisponible ? (
                    <Badge variant="outline" className="flex-1 justify-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fechaFin && fechaFin < ahora ? 'Cerrado' : 'No disponible aun'}
                    </Badge>
                  ) : !puedeIntentar ? (
                    <Badge variant="outline" className="flex-1 justify-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Sin intentos disponibles
                    </Badge>
                  ) : (
                    <Link href={'/app/estudiante/evaluaciones/' + evaluacion.id + '/iniciar'}>
                      <Button className="flex-1 justify-center gap-2" size="lg">
                        {intentosUsados > 0 ? (
                          <>
                            <AlertTriangle className="h-4 w-4" />
                            Reintentar (Intento {intentosUsados + 1})
                          </>
                        ) : (
                          <>
                            <ClipboardCheck className="h-4 w-4" />
                            Iniciar evaluacion
                          </>
                        )}
                      </Button>
                    </Link>
                  )}
                </div>

                {intentos.length > 0 && !aprobado && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-3">Tus intentos</h4>
                    <div className="space-y-2">
                      {intentos.slice().sort((a, b) => b.numero_intento - a.numero_intento).map((attempt) => (
                        <div key={attempt.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              attempt.estado === 'calificado' ? (attempt.nota_final !== null && attempt.nota_final >= 70 ? 'success' : 'destructive') :
                              attempt.estado === 'entregado' ? 'warning' : 'secondary'
                            }>
                              Intento {attempt.numero_intento}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(attempt.iniciado_at), 'dd MMM yyyy HH:mm', { locale: es })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            {attempt.nota_final !== null && (
                              <span className={cn(
                                'text-lg font-bold',
                                attempt.nota_final >= 70 ? 'text-green-600' : 'text-red-600'
                              )}>
                                {attempt.nota_final.toFixed(1) + ' / 100'}
                              </span>
                            )}
                            {attempt.estado === 'calificado' && (
                              <Badge variant="secondary">Calificado</Badge>
                            )}
                            {attempt.estado === 'entregado' && (
                              <Badge variant="warning">Pendiente</Badge>
                            )}
                            {attempt.estado === 'en_curso' && (
                              <Badge variant="secondary">En curso</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}