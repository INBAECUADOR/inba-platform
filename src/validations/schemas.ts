import { z } from 'zod'

// Auth
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  full_name: z.string().min(2, 'Nombre muy corto').max(100),
  phone: z.string().optional(),
  dni: z.string().optional(),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

// Profile
export const profileSchema = z.object({
  full_name: z.string().min(2).max(100),
  phone: z.string().optional(),
  dni: z.string().optional(),
  birth_date: z.string().date().optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
})

// User Management (Admin)
export const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2).max(100),
  roles: z.array(z.enum(['admin_general', 'admin_academico', 'docente', 'estudiante', 'afiliado'])).min(1),
  phone: z.string().optional(),
  dni: z.string().optional(),
})

export const updateUserSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  dni: z.string().optional(),
  roles: z.array(z.enum(['admin_general', 'admin_academico', 'docente', 'estudiante', 'afiliado'])).optional(),
  is_active: z.boolean().optional(),
})

// Courses
export const courseSchema = z.object({
  codigo: z.string().min(2).max(20).regex(/^[A-Z0-9-_]+$/, 'Solo mayúsculas, números, guiones'),
  nombre: z.string().min(3).max(150),
  descripcion: z.string().min(10),
  objetivos: z.string().min(10),
  requisitos: z.string().optional(),
  duracion_horas: z.number().int().positive(),
  modalidad: z.enum(['virtual', 'hibrido', 'presencial']),
  estado: z.enum(['borrador', 'publicado', 'archivado']).default('borrador'),
})

export const moduleSchema = z.object({
  curso_id: z.string().uuid(),
  orden: z.number().int().positive(),
  nombre: z.string().min(3).max(150),
  descripcion: z.string().optional(),
  objetivos: z.string().optional(),
  duracion_horas: z.number().int().positive().optional(),
  es_obligatorio: z.boolean().default(true),
})

export const topicSchema = z.object({
  modulo_id: z.string().uuid(),
  orden: z.number().int().positive(),
  titulo: z.string().min(3).max(150),
  descripcion: z.string().optional(),
  objetivos: z.string().optional(),
  duracion_minutos: z.number().int().positive().optional(),
})

export const lessonSchema = z.object({
  tema_id: z.string().uuid(),
  orden: z.number().int().positive(),
  titulo: z.string().min(3).max(150),
  descripcion: z.string().optional(),
  tipo: z.enum(['video', 'texto', 'pdf', 'embed']),
  contenido_json: z.any().optional(),
  video_url: z.string().url().optional(),
  video_provider: z.string().optional(),
  duracion_minutos: z.number().int().positive().optional(),
  es_obligatoria: z.boolean().default(true),
  prerequisito_leccion_id: z.string().uuid().optional(),
})

export const resourceSchema = z.object({
  leccion_id: z.string().uuid(),
  tipo: z.enum(['pdf', 'enlace', 'documento', 'imagen']),
  titulo: z.string().min(3).max(150),
  url: z.string().url(),
  orden: z.number().int().default(0),
  es_descargable: z.boolean().default(true),
})

// Enrollments
export const enrollmentSchema = z.object({
  user_id: z.string().uuid(),
  curso_id: z.string().uuid(),
  estado: z.enum(['pendiente', 'activa', 'completada', 'abandonada', 'cancelada']).default('pendiente'),
})

// Evaluations
export const evaluationSchema = z.object({
  curso_id: z.string().uuid(),
  modulo_id: z.string().uuid().optional(),
  titulo: z.string().min(3).max(150),
  descripcion: z.string().optional(),
  tipo: z.enum(['cuestionario', 'tarea', 'practica', 'examen_final']),
  ponderacion: z.number().min(0).max(100),
  tiempo_limite_minutos: z.number().int().positive().optional(),
  intentos_permitidos: z.number().int().positive().default(1),
  orden_aleatorio: z.boolean().default(false),
  mostrar_respuestas_despues: z.boolean().default(false),
  fecha_inicio: z.string().datetime().optional(),
  fecha_fin: z.string().datetime().optional(),
  criterio_aprobacion_json: z.any().optional(),
  estado: z.enum(['borrador', 'publicado', 'cerrado']).default('borrador'),
})

export const questionSchema = z.object({
  evaluacion_id: z.string().uuid(),
  enunciado: z.string().min(5),
  tipo: z.enum(['opcion_multiple', 'verdadero_falso', 'respuesta_corta', 'archivo']),
  puntaje: z.number().int().positive().default(1),
  orden: z.number().int().default(0),
  explicacion: z.string().optional(),
})

export const answerOptionSchema = z.object({
  pregunta_id: z.string().uuid(),
  texto: z.string().min(1),
  es_correcta: z.boolean(),
  orden: z.number().int().default(0),
})

// Questions Bank
export const questionBankSchema = z.object({
  enunciado: z.string().min(5),
  tipo: z.enum(['opcion_multiple', 'verdadero_falso', 'respuesta_corta', 'archivo']),
  puntaje: z.number().int().positive().default(1),
  explicacion: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dificultad: z.enum(['facil', 'medio', 'dificil']).default('medio'),
  modulo_id: z.string().uuid().optional(),
  tema_id: z.string().uuid().optional(),
})

// Rubrics
export const rubricSchema = z.object({
  evaluacion_id: z.string().uuid(),
  nombre: z.string().min(3).max(100),
  descripcion: z.string().optional(),
  criterios: z.array(z.object({
    nombre: z.string().min(3),
    descripcion: z.string(),
    puntaje_max: z.number().int().positive(),
  })).min(1),
})

// Practical Sessions
export const practiceSessionSchema = z.object({
  curso_id: z.string().uuid(),
  modulo_id: z.string().uuid().optional(),
  titulo: z.string().min(3).max(150),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime(),
  sede: z.string().min(3),
  direccion: z.string().optional(),
  coordenadas_json: z.any().optional(),
  docente_id: z.string().uuid(),
  cupo_maximo: z.number().int().positive().optional(),
  materiales_json: z.any().optional(),
  instrucciones: z.string().optional(),
  estado: z.enum(['programada', 'en_curso', 'finalizada', 'cancelada']).default('programada'),
})

// Certificates
export const certificateConfigSchema = z.object({
  curso_id: z.string().uuid(),
  requiere_todos_modulos: z.boolean().default(true),
  requiere_examen_final: z.boolean().default(true),
  requiere_practicas: z.boolean().default(false),
  nota_minima_modulos: z.number().min(0).max(100).default(70),
  nota_minima_final: z.number().min(0).max(100).default(70),
  plantilla_pdf: z.string().optional(),
})

// Affiliations
export const affiliationTypeSchema = z.object({
  nombre: z.string().min(3).max(100),
  descripcion: z.string().optional(),
  requisitos_json: z.any().optional(),
  duracion_meses: z.number().int().positive().default(12),
  costo_referencial: z.number().min(0).optional(),
  activo: z.boolean().default(true),
})

export const affiliationRequestSchema = z.object({
  user_id: z.string().uuid(),
  tipo_id: z.string().uuid(),
  documentos_json: z.any().optional(),
})

// CMS
export const pageContentSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-_/]+$/),
  titulo: z.string().min(3).max(150),
  contenido_json: z.any(),
  seo_json: z.any().optional(),
  estado: z.enum(['borrador', 'publicado', 'archivado']).default('borrador'),
})

export const newsSchema = z.object({
  titulo: z.string().min(5).max(200),
  resumen: z.string().min(10).max(300),
  contenido_json: z.any(),
  imagen_url: z.string().url().optional(),
  estado: z.enum(['borrador', 'publicado', 'archivado']).default('borrador'),
})

// Events
export const eventSchema = z.object({
  titulo: z.string().min(3).max(150),
  descripcion: z.string().optional(),
  fecha_inicio: z.string().datetime(),
  fecha_fin: z.string().datetime(),
  sede: z.string().min(3),
  direccion: z.string().optional(),
  categorias_json: z.any().optional(),
  reglamento_url: z.string().url().optional(),
  estado: z.enum(['borrador', 'publicado', 'finalizado', 'cancelado']).default('borrador'),
  requiere_inscripcion: z.boolean().default(false),
  cupo_maximo: z.number().int().positive().optional(),
})

// Contact
export const contactSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  telefono: z.string().optional(),
  asunto: z.string().min(3).max(150),
  mensaje: z.string().min(10).max(2000),
})