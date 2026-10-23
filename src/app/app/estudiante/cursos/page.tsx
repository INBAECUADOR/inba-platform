'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { GraduationCap } from 'lucide-react'
import { MisCursosMainView } from '@/components/estudiante/MisCursosMainView'

interface Course {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  duracion_horas: number
  modalidad: string
  estado: string
  progreso: number
  modulos_completados: number
  total_modulos: number
  siguiente_leccion?: string
}

interface Enrollment {
  id: string
  curso_id: string
  estado: string
  fecha_inicio: string
  fecha_completada?: string
  curso: Course
  progreso: number
  modulos_completados: number
  total_modulos: number
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
          <p className="text-muted-foreground">Cargando tus cursos...</p>
        </div>
      </div>
    </div>
  )
}

export default function MisCursosPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEnrollments() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('matriculas')
        .select(`
          id,
          estado,
          fecha_inicio,
          fecha_completada,
          cursos:curso_id (
            id,
            codigo,
            nombre,
            descripcion,
            duracion_horas,
            modalidad,
            estado
          )
        `)
        .eq('user_id', (await createClient().auth.getUser()).data.user?.id)

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const enrollmentsWithProgress = await Promise.all(
        (data || []).map(async (enrollment: any) => {
          const { data: progress } = await createClient()
            .from('progreso_lecciones')
            .select('estado, lecciones!inner(modulo_id)')
            .eq('matricula_id', enrollment.id)

          const totalLecciones = progress?.length || 0
          const completadas = progress?.filter((p: any) => p.estado === 'completada').length || 0
          const progreso = totalLecciones > 0 ? Math.round((completadas / totalLecciones) * 100) : 0

          const { data: modulos } = await createClient()
            .from('modulos')
            .select('id')
            .eq('curso_id', enrollment.cursos.id)

          const { data: modulosCompletados } = await createClient()
            .from('progreso_lecciones')
            .select('lecciones!inner(modulo_id)')
            .eq('matricula_id', enrollment.id)
            .eq('estado', 'completada')

          const modulosIdsCompletados = new Set(
            (modulosCompletados || []).map((p: any) => p.lecciones?.modulo_id)
          )
          const modulosCompletadosCount = modulosIdsCompletados.size

          return {
            ...enrollment,
            curso: enrollment.cursos,
            progreso,
            modulos_completados: modulosCompletadosCount,
            total_modulos: modulos?.length || 0,
          }
        })
      )

      setEnrollments(enrollmentsWithProgress)
      setLoading(false)
    }

    fetchEnrollments()
  }, [])

  const activeEnrollments = enrollments.filter(e => e.estado === 'activa')
  const pendingEnrollments = enrollments.filter(e => e.estado === 'pendiente')
  const completedEnrollments = enrollments.filter(e => e.estado === 'completada')

  if (loading) {
    return <LoadingView />
  }

  return (
    <MisCursosMainView
      activeEnrollments={activeEnrollments}
      pendingEnrollments={pendingEnrollments}
      completedEnrollments={completedEnrollments}
    />
  )
}