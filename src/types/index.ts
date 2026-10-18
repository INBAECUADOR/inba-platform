import { UserRole } from '@/lib/auth/roles'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  dni: string | null
  birth_date: string | null
  address: string | null
  emergency_contact: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UserWithRoles extends UserProfile {
  roles: UserRole[]
}

export interface Course {
  id: string
  codigo: string
  nombre: string
  descripcion: string
  objetivos: string
  requisitos: string | null
  duracion_horas: number
  modalidad: 'virtual' | 'hibrido' | 'presencial'
  estado: 'borrador' | 'publicado' | 'archivado'
  version: number
  created_by: string
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface Module {
  id: string
  curso_id: string
  orden: number
  nombre: string
  descripcion: string | null
  objetivos: string | null
  duracion_horas: number | null
  es_obligatorio: boolean
  created_at: string
  updated_at: string
}

export interface Topic {
  id: string
  modulo_id: string
  orden: number
  titulo: string
  descripcion: string | null
  objetivos: string | null
  duracion_minutos: number | null
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  tema_id: string
  orden: number
  titulo: string
  descripcion: string | null
  tipo: 'video' | 'texto' | 'pdf' | 'embed'
  contenido_json: any | null
  video_url: string | null
  video_provider: string | null
  duracion_minutos: number | null
  es_obligatoria: boolean
  prerequisito_leccion_id: string | null
  created_at: string
  updated_at: string
}

export interface Resource {
  id: string
  leccion_id: string
  tipo: 'pdf' | 'enlace' | 'documento' | 'imagen'
  titulo: string
  url: string
  orden: number
  es_descargable: boolean
  tamano_bytes: number | null
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  curso_id: string
  estado: 'pendiente' | 'activa' | 'completada' | 'abandonada' | 'cancelada'
  fecha_inicio: string | null
  fecha_fin_estimada: string | null
  fecha_completada: string | null
  aprobado_por: string | null
  aprobado_at: string | null
  created_at: string
  updated_at: string
}

export interface LessonProgress {
  id: string
  matricula_id: string
  leccion_id: string
  estado: 'no_iniciada' | 'en_progreso' | 'completada'
  tiempo_visto_segundos: number
  completada_at: string | null
  created_at: string
  updated_at: string
}

export interface Evaluation {
  id: string
  curso_id: string
  modulo_id: string | null
  titulo: string
  descripcion: string | null
  tipo: 'cuestionario' | 'tarea' | 'practica' | 'examen_final'
  ponderacion: number
  tiempo_limite_minutos: number | null
  intentos_permitidos: number
  orden_aleatorio: boolean
  mostrar_respuestas_despues: boolean
  fecha_inicio: string | null
  fecha_fin: string | null
  criterio_aprobacion_json: any | null
  estado: 'borrador' | 'publicado' | 'cerrado'
  created_by: string
  created_at: string
  updated_at: string
}

export interface Question {
  id: string
  evaluacion_id: string
  enunciado: string
  tipo: 'opcion_multiple' | 'verdadero_falso' | 'respuesta_corta' | 'archivo'
  puntaje: number
  orden: number
  explicacion: string | null
  created_at: string
  updated_at: string
}

export interface AnswerOption {
  id: string
  pregunta_id: string
  texto: string
  es_correcta: boolean
  orden: number
}

export interface EvaluationAttempt {
  id: string
  evaluacion_id: string
  matricula_id: string
  numero_intento: number
  estado: 'en_curso' | 'entregado' | 'calificado'
  iniciado_at: string
  entregado_at: string | null
  calificado_at: string | null
  calificado_por: string | null
  nota_final: number | null
}

export interface Answer {
  id: string
  intento_id: string
  pregunta_id: string
  respuesta_json: any
  puntaje_obtenido: number | null
  calificado_por: string | null
  calificado_at: string | null
  observaciones_docente: string | null
}

export interface Rubric {
  id: string
  evaluacion_id: string
  nombre: string
  descripcion: string | null
  criterios: Array<{
    nombre: string
    descripcion: string
    puntaje_max: number
  }>
}

export interface PracticalGrade {
  id: string
  evaluacion_id: string
  matricula_id: string
  docente_id: string
  rubrica_id: string
  puntuaciones_json: any
  nota_final: number
  observaciones: string | null
  creado_at: string
  actualizado_at: string
}

export interface PracticeSession {
  id: string
  curso_id: string
  modulo_id: string | null
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  sede: string
  direccion: string | null
  coordenadas_json: any | null
  docente_id: string
  cupo_maximo: number | null
  materiales_json: any | null
  instrucciones: string | null
  estado: 'programada' | 'en_curso' | 'finalizada' | 'cancelada'
  created_at: string
  updated_at: string
}

export interface PracticeEnrollment {
  id: string
  sesion_id: string
  matricula_id: string
  estado: 'inscrito' | 'asistio' | 'falto' | 'justificado'
  confirmado_at: string | null
  created_at: string
}

export interface Attendance {
  id: string
  sesion_id: string
  matricula_id: string
  registrada_por: string
  hora_entrada: string | null
  hora_salida: string | null
  observaciones: string | null
}

export interface Certificate {
  id: string
  uuid_publico: string
  matricula_id: string
  curso_id: string
  user_id: string
  numero_serie: string
  fecha_emision: string
  autoridad_emite_id: string
  autoridad_nombre: string
  autoridad_cargo: string
  pdf_url: string | null
  qr_code_url: string | null
  estado: 'vigente' | 'anulado' | 'revocado'
  motivo_anulacion: string | null
  anulado_por: string | null
  anulado_at: string | null
  created_at: string
}

export interface CertificateConfig {
  id: string
  curso_id: string
  requiere_todos_modulos: boolean
  requiere_examen_final: boolean
  requiere_practicas: boolean
  nota_minima_modulos: number
  nota_minima_final: number
  plantilla_pdf: string | null
}

export interface AffiliationType {
  id: string
  nombre: string
  descripcion: string | null
  requisitos_json: any | null
  duracion_meses: number
  costo_referencial: number | null
  activo: boolean
}

export interface AffiliationRequest {
  id: string
  user_id: string
  tipo_id: string
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'vencida'
  documentos_json: any | null
  observaciones_admin: string | null
  revisado_por: string | null
  revisado_at: string | null
  created_at: string
  updated_at: string
}

export interface Affiliation {
  id: string
  user_id: string
  tipo_id: string
  estado: 'activa' | 'suspendida' | 'vencida' | 'cancelada'
  fecha_inicio: string
  fecha_fin: string
  numero_afiliado: string
  renovaciones_json: any
  created_at: string
  updated_at: string
}

export interface PageContent {
  id: string
  slug: string
  titulo: string
  contenido_json: any
  seo_json: any | null
  estado: 'borrador' | 'publicado' | 'archivado'
  version: number
  created_by: string
  created_at: string
  updated_at: string
  published_at: string | null
}

export interface News {
  id: string
  titulo: string
  resumen: string
  contenido_json: any
  imagen_url: string | null
  autor_id: string
  estado: 'borrador' | 'publicado' | 'archivado'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  titulo: string
  descripcion: string | null
  fecha_inicio: string
  fecha_fin: string
  sede: string
  direccion: string | null
  categorias_json: any | null
  reglamento_url: string | null
  estado: 'borrador' | 'publicado' | 'finalizado' | 'cancelado'
  requiere_inscripcion: boolean
  cupo_maximo: number | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface EventEnrollment {
  id: string
  evento_id: string
  user_id: string
  categoria: string | null
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  documentos_json: any | null
  pago_referencia: string | null
  created_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  accion: string
  entidad: string
  entidad_id: string | null
  datos_anteriores_json: any | null
  datos_nuevos_json: any | null
  ip: string | null
  user_agent: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  tipo: string
  titulo: string
  mensaje: string
  datos_json: any | null
  leida: boolean
  leida_at: string | null
  created_at: string
}

export interface AffiliationType {
  id: string
  nombre: string
  descripcion: string | null
  requisitos_json: any | null
  duracion_meses: number
  costo_referencial: number | null
  activo: boolean
}

export interface AffiliationRequest {
  id: string
  user_id: string
  tipo_id: string
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'vencida'
  documentos_json: any | null
  observaciones_admin: string | null
  revisado_por: string | null
  revisado_at: string | null
  created_at: string
  updated_at: string
}

export interface Affiliation {
  id: string
  user_id: string
  tipo_id: string
  estado: 'activa' | 'suspendida' | 'vencida' | 'cancelada'
  fecha_inicio: string
  fecha_fin: string
  numero_afiliado: string
  renovaciones_json: any
  created_at: string
  updated_at: string
}

export interface CertificateConfig {
  id: string
  curso_id: string
  requiere_todos_modulos: boolean
  requiere_examen_final: boolean
  requiere_practicas: boolean
  nota_minima_modulos: number
  nota_minima_final: number
  plantilla_pdf: string | null
}