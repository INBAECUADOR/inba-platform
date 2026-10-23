'use client'

import { ClipboardCheck, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
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

interface EvaluacionesMainViewProps {
  evaluaciones: Evaluation[]
  evaluacionesFiltradas: Evaluation[]
  activeTab: 'disponibles' | 'completadas' | 'calificadas'
  setActiveTab: (tab: 'disponibles' | 'completadas' | 'calificadas') => void
}

function TabButton({ label, count, isActive, onClick }: { label: string, count: number, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ borderBottom: isActive ? '2px solid hsl(var(--primary))' : '2px solid transparent', color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
      className="pb-4 text-sm font-medium transition-colors hover:text-foreground"
    >
      {label} ({count})
    </button>
  )
}

function StatsGrid({ evaluacion }: { evaluacion: Evaluation }) {
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
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Intentos</p>
        <p className="text-2xl font-bold text-foreground">
          {intentosUsados} / {evaluacion.intentos_permitidos === 0 ? '∞' : evaluacion.intentos_permitidos}
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
          {fechaFin ? 'Días restantes' : 'Sin fecha límite'}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {fechaFin ? tiempoRestante + 'd' : '—'}
        </p>
      </div>
    </div>
  )
}

function TimeLimit({ evaluacion }: { evaluacion: Evaluation }) {
  return (
    <div className="flex items-center gap-3 pt-4 border-t border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-1">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>
          {evaluacion.tiempo_limite_minutos
            ? 'Tiempo límite: ' + evaluacion.tiempo_limite_minutos + ' min'
            : 'Sin límite de tiempo'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Ponderación: {evaluacion.ponderacion}%</span>
      </div>
    </div>
  )
}

function ActionButtons({ evaluacion, estaDisponible, puedeIntentar, intentosUsados, aprobado }: { 
  evaluacion: Evaluation, 
  estaDisponible: boolean, 
  puedeIntentar: boolean, 
  intentosUsados: number, 
  aprobado: boolean 
}) {
  const mejorNota = evaluacion.mejor_nota || 0
  const fechaFin = evaluacion.fecha_fin ? new Date(evaluacion.fecha_fin) : null
  const ahora = new Date()

  return (
    <div className="flex items-center gap-3 pt-2 border-t border-border">
      {aprobado ? (
        <>
          <Badge variant="success" className="flex-1 justify-center">
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Aprobado con {mejorNota ? mejorNota.toFixed(1) : '0'}%
          </Badge>
          <Link href={'/app/estudiante/evaluaciones/' + evaluacion.id + '/resultado'}>
            <Button variant="outline" className="gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Ver certificado
            </Button>
          </Link>
        </>
      ) : !estaDisponible ? (
        <Badge variant="outline" className="flex-1 justify-center">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" /></svg>
          {fechaFin && fechaFin < ahora ? 'Cerrado' : 'No disponible aún'}
        </Badge>
      ) : !puedeIntentar ? (
        <Badge variant="outline" className="flex-1 justify-center">
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" /></svg>
          Sin intentos disponibles
        </Badge>
      ) : (
        <Link href={'/app/estudiante/evaluaciones/' + evaluacion.id + '/iniciar'}>
          <Button className="flex-1 justify-center gap-2" size="lg">
            {intentosUsados > 0 ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77-1.333.192 3 1.732 3z" /></svg>
                Reintentar (Intento {intentosUsados + 1})
              </>
            ) : (
              <>
                <ClipboardCheck className="h-4 w-4" />
                Iniciar evaluación
              </>
            )}
          </Button>
        </Link>
      )}
    </div>
  )
}

function AttemptsList({ intentos, mejorNota, aprobado }: { intentos: Attempt[], mejorNota: number | null, aprobado: boolean }) {
  if (intentos.length === 0 || aprobado) return null

  return (
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
                <span className="text-lg font-bold" style={{ color: attempt.nota_final >= 70 ? 'green' : 'red' }}>
                  {attempt.nota_final.toFixed(1) + ' / 100'}
                </span>
              )}
              {attempt.estado === 'calificado' && <Badge variant="secondary">Calificado</Badge>}
              {attempt.estado === 'entregado' && <Badge variant="warning">Pendiente</Badge>}
              {attempt.estado === 'en_curso' && <Badge variant="secondary">En curso</Badge>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function EvaluationCard({ evaluacion }: { evaluacion: Evaluation }) {
  const ahora = new Date()
  const fechaFin = evaluacion.fecha_fin ? new Date(evaluacion.fecha_fin) : null
  const fechaInicio = evaluacion.fecha_inicio ? new Date(evaluacion.fecha_inicio) : null
  const estaDisponible = (!fechaInicio || fechaInicio <= ahora) && (!fechaFin || fechaFin >= ahora)
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
              <p className="text-xs text-muted-foreground">Ponderación</p>
            </div>
            {aprobado && (
              <Badge variant="success" className="text-lg px-3 py-1">
                <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                APROBADO
              </Badge>
            )}
          </div>
        </div>

        <StatsGrid evaluacion={evaluacion} />
        <TimeLimit evaluacion={evaluacion} />
        <ActionButtons 
          evaluacion={evaluacion} 
          estaDisponible={estaDisponible} 
          puedeIntentar={puedeIntentar} 
          intentosUsados={intentosUsados} 
          aprobado={aprobado} 
        />
        <AttemptsList intentos={intentos} mejorNota={mejorNota} aprobado={aprobado} />
      </div>
    </article>
  )
}

function EmptyState({ activeTab }: { activeTab: 'disponibles' | 'completadas' | 'calificadas' }) {
  return (
    <div className="text-center py-16">
      <ClipboardCheck className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {activeTab === 'disponibles' ? 'No hay evaluaciones disponibles' :
         activeTab === 'calificadas' ? 'No hay evaluaciones por calificar' :
         'No hay evaluaciones aprobadas'}
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        {activeTab === 'disponibles' ? 'Cuando hay evaluaciones disponibles aparecerán aquí.' :
         activeTab === 'calificadas' ? 'Las evaluaciones que has entregado y están pendientes de calificación aparecerán aquí.' :
         'Las evaluaciones que has aprobado aparecerán aquí.'}
      </p>
    </div>
  )
}

export function EvaluacionesMainView({ evaluaciones, evaluacionesFiltradas, activeTab, setActiveTab }: EvaluacionesMainViewProps) {
  return (
    <div className="container-inba py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Evaluaciones</h1>
          <p className="text-muted-foreground mt-1">Exámenes, tareas y prácticas de tus cursos</p>
        </div>
      </header>

      <div className="border-b border-border">
        <nav className="flex gap-4 -mb-px" aria-label="Filtros de evaluaciones">
          <TabButton
            label="Disponibles"
            count={evaluaciones.filter(e => {
              const now = new Date()
              const fechaFin = e.fecha_fin ? new Date(e.fecha_fin) : null
              const fechaInicio = e.fecha_inicio ? new Date(e.fecha_inicio) : null
              const estaDisponible = (!fechaInicio || fechaInicio <= new Date()) && (!fechaFin || fechaFin >= new Date())
              const intentos = e.intentos || []
              const intentosUsados = e.intentos_usados || 0
              const mejorNota = e.mejor_nota || 0
              const aprobado = (mejorNota !== null && mejorNota !== undefined) && mejorNota >= 70
              const puedeIntentar = (e.intentos_permitidos === 0 || intentosUsados < e.intentos_permitidos) && estaDisponible
              return estaDisponible && puedeIntentar && !aprobado
            }).length}
            isActive={activeTab === 'disponibles'}
            onClick={() => setActiveTab('disponibles')}
          />
          <TabButton
            label="Por calificar"
            count={evaluaciones.filter(e => (e.intentos || []).length > 0 && (e.mejor_nota || 0) < 70).length}
            isActive={activeTab === 'calificadas'}
            onClick={() => setActiveTab('calificadas')}
          />
          <TabButton
            label="Aprobadas"
            count={evaluaciones.filter(e => (e.mejor_nota || 0) >= 70).length}
            isActive={activeTab === 'completadas'}
            onClick={() => setActiveTab('completadas')}
          />
        </nav>
      </div>

      {evaluacionesFiltradas.length === 0 && <EmptyState activeTab={activeTab} />}

      <div className="space-y-4">
        {evaluacionesFiltradas.map((evaluacion) => <EvaluationCard evaluacion={evaluacion} />)}
      </div>
    </div>
  )
}