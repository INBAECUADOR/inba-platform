-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USUARIOS Y AUTENTICACIÓN
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  dni TEXT,
  birth_date DATE,
  address TEXT,
  emergency_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE roles (
  id SMALLSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

INSERT INTO roles (name, description) VALUES
  ('admin_general', 'Acceso total al sistema, gestión de usuarios, roles, configuración global'),
  ('admin_academico', 'Gestión académica: cursos, módulos, evaluaciones, docentes, matrículas'),
  ('docente', 'Gestión de sus cursos asignados: evaluaciones, calificaciones, prácticas'),
  ('estudiante', 'Acceso a sus cursos, evaluaciones, calificaciones, certificados'),
  ('afiliado', 'Gestión de su afiliación, beneficios, renovaciones');

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- HELPERS DE AUTORIZACION
-- ============================================
-- IMPORTANTE: estas funciones son SECURITY DEFINER para que puedan leer
-- user_roles sin disparar su propia politica RLS. Sin esto, cualquier
-- politica que consulte user_roles provoca:
--   ERROR: infinite recursion detected in policy for relation "user_roles"

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin_general', 'admin_academico')
  )
$$;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin_general', 'admin_academico', 'docente')
  )
$$;

-- ============================================
-- AFILIACIONES
-- ============================================

CREATE TABLE afiliacion_tipos (
  id SMALLSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  requisitos_json JSONB,
  duracion_meses SMALLINT DEFAULT 12,
  costo_referencial NUMERIC(10,2),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE afiliacion_solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo_id SMALLINT NOT NULL REFERENCES afiliacion_tipos(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'vencida')),
  documentos_json JSONB,
  observaciones_admin TEXT,
  revisado_por UUID REFERENCES profiles(id),
  revisado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE afiliaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo_id SMALLINT NOT NULL REFERENCES afiliacion_tipos(id),
  estado TEXT NOT NULL DEFAULT 'activa' CHECK (estado IN ('activa', 'suspendida', 'vencida', 'cancelada')),
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  numero_afiliado TEXT UNIQUE NOT NULL,
  renovaciones_json JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATÁLOGO ACADÉMICO
-- ============================================

CREATE TABLE cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  objetivos TEXT NOT NULL,
  requisitos TEXT,
  duracion_horas INTEGER NOT NULL,
  modalidad TEXT NOT NULL CHECK (modalidad IN ('virtual', 'hibrido', 'presencial')),
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE modulos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  orden SMALLINT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  objetivos TEXT,
  duracion_horas INTEGER,
  es_obligatorio BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (curso_id, orden)
);

CREATE TABLE temas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modulo_id UUID NOT NULL REFERENCES modulos(id) ON DELETE CASCADE,
  orden SMALLINT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  objetivos TEXT,
  duracion_minutos INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (modulo_id, orden)
);

CREATE TABLE lecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tema_id UUID NOT NULL REFERENCES temas(id) ON DELETE CASCADE,
  orden SMALLINT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('video', 'texto', 'pdf', 'embed')),
  contenido_json JSONB,
  video_url TEXT,
  video_provider TEXT,
  duracion_minutos INTEGER,
  es_obligatoria BOOLEAN DEFAULT TRUE,
  prerequisito_leccion_id UUID REFERENCES lecciones(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (tema_id, orden)
);

CREATE TABLE recursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('pdf', 'enlace', 'documento', 'imagen')),
  titulo TEXT NOT NULL,
  url TEXT NOT NULL,
  orden SMALLINT DEFAULT 0,
  es_descargable BOOLEAN DEFAULT TRUE,
  tamano_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MATRÍCULAS Y PROGRESO
-- ============================================

CREATE TABLE matriculas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'activa', 'completada', 'abandonada', 'cancelada')),
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  fecha_completada DATE,
  aprobado_por UUID REFERENCES profiles(id),
  aprobado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_active_enrollment ON matriculas (user_id, curso_id) WHERE estado IN ('pendiente', 'activa');

CREATE TABLE progreso_lecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  leccion_id UUID NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'no_iniciada' CHECK (estado IN ('no_iniciada', 'en_progreso', 'completada')),
  tiempo_visto_segundos INTEGER DEFAULT 0,
  completada_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (matricula_id, leccion_id)
);

-- ============================================
-- EVALUACIONES
-- ============================================

CREATE TABLE evaluaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('cuestionario', 'tarea', 'practica', 'examen_final')),
  ponderacion SMALLINT NOT NULL DEFAULT 0 CHECK (ponderacion BETWEEN 0 AND 100),
  tiempo_limite_minutos INTEGER,
  intentos_permitidos SMALLINT DEFAULT 1,
  orden_aleatorio BOOLEAN DEFAULT FALSE,
  mostrar_respuestas_despues BOOLEAN DEFAULT FALSE,
  fecha_inicio TIMESTAMPTZ,
  fecha_fin TIMESTAMPTZ,
  criterio_aprobacion_json JSONB,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'cerrado')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE preguntas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
  enunciado TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('opcion_multiple', 'verdadero_falso', 'respuesta_corta', 'archivo')),
  puntaje SMALLINT NOT NULL DEFAULT 1,
  orden SMALLINT DEFAULT 0,
  explicacion TEXT,
  tags TEXT[],
  dificultad TEXT CHECK (dificultad IN ('facil', 'medio', 'dificil')),
  modulo_id UUID REFERENCES modulos(id),
  tema_id UUID REFERENCES temas(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE opciones_respuesta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta_id UUID NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  es_correcta BOOLEAN NOT NULL DEFAULT FALSE,
  orden SMALLINT DEFAULT 0
);

CREATE TABLE intentos_evaluacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
  matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  numero_intento SMALLINT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'en_curso' CHECK (estado IN ('en_curso', 'entregado', 'calificado')),
  iniciado_at TIMESTAMPTZ DEFAULT NOW(),
  entregado_at TIMESTAMPTZ,
  calificado_at TIMESTAMPTZ,
  calificado_por UUID REFERENCES profiles(id),
  nota_final NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE respuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intento_id UUID NOT NULL REFERENCES intentos_evaluacion(id) ON DELETE CASCADE,
  pregunta_id UUID NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
  respuesta_json JSONB,
  puntaje_obtenido NUMERIC(5,2),
  calificado_por UUID REFERENCES profiles(id),
  calificado_at TIMESTAMPTZ,
  observaciones_docente TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rubricas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  criterios JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRÁCTICAS PRESENCIALES
-- ============================================

CREATE TABLE practicas_sesiones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos(id) ON DELETE SET NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  sede TEXT NOT NULL,
  direccion TEXT,
  coordenadas_json JSONB,
  docente_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  cupo_maximo INTEGER,
  materiales_json JSONB,
  instrucciones TEXT,
  estado TEXT NOT NULL DEFAULT 'programada' CHECK (estado IN ('programada', 'en_curso', 'finalizada', 'cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE practicas_inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES practicas_sesiones(id) ON DELETE CASCADE,
  matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  estado TEXT NOT NULL DEFAULT 'inscrito' CHECK (estado IN ('inscrito', 'asistio', 'falto', 'justificado')),
  confirmado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sesion_id, matricula_id)
);

CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID NOT NULL REFERENCES practicas_sesiones(id) ON DELETE CASCADE,
  matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  registrada_por UUID REFERENCES profiles(id),
  hora_entrada TIMESTAMPTZ,
  hora_salida TIMESTAMPTZ,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (sesion_id, matricula_id)
);

CREATE TABLE calificaciones_practica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
  matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  docente_id UUID NOT NULL REFERENCES profiles(id),
  rubrica_id UUID REFERENCES rubricas(id),
  puntuaciones_json JSONB,
  nota_final NUMERIC(5,2),
  observaciones TEXT,
  creado_at TIMESTAMPTZ DEFAULT NOW(),
  actualizado_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (evaluacion_id, matricula_id)
);

-- ============================================
-- CERTIFICADOS
-- ============================================

CREATE TABLE certificados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uuid_publico UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  matricula_id UUID NOT NULL REFERENCES matriculas(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  numero_serie TEXT UNIQUE NOT NULL,
  fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
  autoridad_emite_id UUID NOT NULL REFERENCES profiles(id),
  autoridad_nombre TEXT NOT NULL,
  autoridad_cargo TEXT NOT NULL,
  pdf_url TEXT,
  qr_code_url TEXT,
  estado TEXT NOT NULL DEFAULT 'vigente' CHECK (estado IN ('vigente', 'anulado', 'revocado')),
  motivo_anulacion TEXT,
  anulado_por UUID REFERENCES profiles(id),
  anulado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX unique_vigente_certificado ON certificados (matricula_id) WHERE estado = 'vigente';

CREATE TABLE certificado_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE UNIQUE,
  requiere_todos_modulos BOOLEAN DEFAULT TRUE,
  requiere_examen_final BOOLEAN DEFAULT TRUE,
  requiere_practicas BOOLEAN DEFAULT FALSE,
  nota_minima_modulos SMALLINT DEFAULT 70 CHECK (nota_minima_modulos BETWEEN 0 AND 100),
  nota_minima_final SMALLINT DEFAULT 70 CHECK (nota_minima_final BETWEEN 0 AND 100),
  plantilla_pdf TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTOS DEPORTIVOS
-- ============================================

CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ NOT NULL,
  sede TEXT NOT NULL,
  direccion TEXT,
  categorias_json JSONB,
  reglamento_url TEXT,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'finalizado', 'cancelado')),
  requiere_inscripcion BOOLEAN DEFAULT FALSE,
  cupo_maximo INTEGER,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE evento_inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  categoria TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'cancelada')),
  documentos_json JSONB,
  pago_referencia TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (evento_id, user_id)
);

CREATE TABLE evento_resultados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  categoria TEXT NOT NULL,
  posicion SMALLINT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  puntaje NUMERIC(6,2),
  observaciones TEXT,
  publicado BOOLEAN DEFAULT FALSE,
  publicado_por UUID REFERENCES profiles(id),
  publicado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CMS INSTITUCIONAL
-- ============================================

CREATE TABLE paginas_contenido (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  contenido_json JSONB NOT NULL,
  seo_json JSONB,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE TABLE noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  resumen TEXT,
  contenido_json JSONB,
  imagen_url TEXT,
  autor_id UUID REFERENCES profiles(id),
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE documentos_institucionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  archivo_url TEXT NOT NULL,
  categoria TEXT,
  version TEXT,
  vigente_desde DATE,
  vigente_hasta DATE,
  creado_por UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AUDITORÍA Y NOTIFICACIONES
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  accion TEXT NOT NULL,
  entidad TEXT NOT NULL,
  entidad_id UUID,
  datos_anteriores_json JSONB,
  datos_nuevos_json JSONB,
  ip INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entidad ON audit_logs(entidad, entidad_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  datos_json JSONB,
  leida BOOLEAN DEFAULT FALSE,
  leida_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONFIGURACIÓN INSTITUCIONAL
-- ============================================

CREATE TABLE configuracion_institucional (
  clave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE temas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso_lecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas ENABLE ROW LEVEL SECURITY;
ALTER TABLE opciones_respuesta ENABLE ROW LEVEL SECURITY;
ALTER TABLE intentos_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE rubricas ENABLE ROW LEVEL SECURITY;
ALTER TABLE practicas_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE practicas_inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones_practica ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificado_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE afiliacion_tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE afiliacion_solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE afiliaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento_inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evento_resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE paginas_contenido ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_institucionales ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion_institucional ENABLE ROW LEVEL SECURITY;

-- Profiles: usuario ve su perfil, admins ven todos
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id OR EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles: cada usuario ve los suyos; los admins gestionan todos.
-- Se usa is_admin() (SECURITY DEFINER) para evitar recursion infinita de RLS.
CREATE POLICY "Users view own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage user_roles" ON user_roles
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Cursos: públicos ven publicados, admins/académicos gestionan, docentes ven asignados
CREATE POLICY "Public view published courses" ON cursos
  FOR SELECT USING (estado = 'publicado');

CREATE POLICY "Admins manage courses" ON cursos
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

CREATE POLICY "Docentes view assigned courses" ON cursos
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'docente'
  ));

-- Matrículas: estudiante ve las suyas, docente ve de sus cursos, admins ven todas
CREATE POLICY "Users view own enrollments" ON matriculas
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
    ) OR
    EXISTS (
      SELECT 1 FROM cursos c
      WHERE c.id = matriculas.curso_id
      AND EXISTS (
        SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'docente'
      )
    )
  );

CREATE POLICY "Students self-enroll" ON matriculas
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins manage enrollments" ON matriculas
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

-- Evaluaciones: estudiantes ven publicadas de sus cursos
CREATE POLICY "Students view published evaluations" ON evaluaciones
  FOR SELECT USING (
    estado = 'publicado' AND
    EXISTS (
      SELECT 1 FROM matriculas m
      WHERE m.curso_id = evaluaciones.curso_id
      AND m.user_id = auth.uid()
      AND m.estado = 'activa'
    )
  );

CREATE POLICY "Admins/Academicos manage evaluations" ON evaluaciones
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

CREATE POLICY "Docentes manage their evaluations" ON evaluaciones
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'docente'
  ));

-- Intentos de evaluación: estudiante ve los suyos, docente de sus cursos, admins todos
CREATE POLICY "Users view own attempts" ON intentos_evaluacion
  FOR SELECT USING (
    matricula_id IN (SELECT id FROM matriculas WHERE user_id = auth.uid()) OR
    EXISTS (
      SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
    ) OR
    EXISTS (
      SELECT 1 FROM matriculas m
      WHERE m.id = intentos_evaluacion.matricula_id
      AND EXISTS (
        SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid() AND r.name = 'docente'
      )
    )
  );

-- Respuestas: similar a intentos
CREATE POLICY "Users view own answers" ON respuestas
  FOR SELECT USING (
    intento_id IN (
      SELECT id FROM intentos_evaluacion
      WHERE matricula_id IN (SELECT id FROM matriculas WHERE user_id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
    )
  );

-- Certificados: la verificacion publica NO expone la tabla completa.
-- Se resuelve con verificar_certificado(uuid), que devuelve solo los campos
-- necesarios para la pagina de verificacion (SECURITY DEFINER).
CREATE OR REPLACE FUNCTION verificar_certificado(p_uuid uuid)
RETURNS TABLE (
  numero_serie text,
  fecha_emision date,
  estado text,
  curso_nombre text,
  alumno_nombre text,
  alumno_dni text,
  autoridad_nombre text,
  autoridad_cargo text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.numero_serie, c.fecha_emision, c.estado,
         cu.nombre, p.full_name, p.dni,
         c.autoridad_nombre, c.autoridad_cargo
  FROM certificados c
  JOIN cursos cu ON cu.id = c.curso_id
  JOIN profiles p ON p.id = c.user_id
  WHERE c.uuid_publico = p_uuid
$$;

GRANT EXECUTE ON FUNCTION verificar_certificado(uuid) TO anon, authenticated;

CREATE POLICY "Users view own certificates" ON certificados
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage certificates" ON certificados
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

-- Afiliaciones
CREATE POLICY "Users view own affiliations" ON afiliaciones
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins manage affiliations" ON afiliaciones
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

-- Configuración institucional: solo admins
CREATE POLICY "Admins manage config" ON configuracion_institucional
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin_general'
  ));

-- CMS: público ve publicado, admins gestionan
CREATE POLICY "Public view published content" ON paginas_contenido
  FOR SELECT USING (estado = 'publicado');

CREATE POLICY "Admins manage content" ON paginas_contenido
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

-- Noticias: público ve publicadas, admins gestionan
CREATE POLICY "Public view published news" ON noticias
  FOR SELECT USING (estado = 'publicado');

CREATE POLICY "Admins manage news" ON noticias
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

-- Auditoría: solo admins
CREATE POLICY "Admins view audit" ON audit_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name IN ('admin_general', 'admin_academico')
  ));

-- Notificaciones: usuario ve las suyas
CREATE POLICY "Users view own notifications" ON notificaciones
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notificaciones
  FOR UPDATE USING (user_id = auth.uid());

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cursos_updated_at BEFORE UPDATE ON cursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modulos_updated_at BEFORE UPDATE ON modulos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_temas_updated_at BEFORE UPDATE ON temas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecciones_updated_at BEFORE UPDATE ON lecciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recursos_updated_at BEFORE UPDATE ON recursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matriculas_updated_at BEFORE UPDATE ON matriculas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluaciones_updated_at BEFORE UPDATE ON evaluaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lecciones_updated_at_2 BEFORE UPDATE ON lecciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_recursos_updated_at_2 BEFORE UPDATE ON recursos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluaciones_updated_at_2 BEFORE UPDATE ON evaluaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_practicas_sesiones_updated_at BEFORE UPDATE ON practicas_sesiones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certificados_updated_at BEFORE UPDATE ON certificados FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_paginas_contenido_updated_at BEFORE UPDATE ON paginas_contenido FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON noticias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_configuracion_updated_at BEFORE UPDATE ON configuracion_institucional FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para auditoría automática
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, accion, entidad, entidad_id, datos_nuevos_json)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, accion, entidad, entidad_id, datos_anteriores_json, datos_nuevos_json)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, accion, entidad, entidad_id, datos_anteriores_json)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers de auditoría a tablas críticas
CREATE TRIGGER audit_cursos AFTER INSERT OR UPDATE OR DELETE ON cursos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_modulos AFTER INSERT OR UPDATE OR DELETE ON modulos FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_lecciones AFTER INSERT OR UPDATE OR DELETE ON lecciones FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_evaluaciones AFTER INSERT OR UPDATE OR DELETE ON evaluaciones FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_matriculas AFTER INSERT OR UPDATE OR DELETE ON matriculas FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_intentos_evaluacion AFTER INSERT OR UPDATE OR DELETE ON intentos_evaluacion FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_certificados AFTER INSERT OR UPDATE OR DELETE ON certificados FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_afiliaciones AFTER INSERT OR UPDATE OR DELETE ON afiliaciones FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_paginas_contenido AFTER INSERT OR UPDATE OR DELETE ON paginas_contenido FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
CREATE TRIGGER audit_usuarios AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
-- ============================================
-- CURSO PRINCIPAL: CERTIFICACIÓN ENTRENADORES INBA ECUADOR
-- ============================================

INSERT INTO cursos (codigo, nombre, descripcion, objetivos, requisitos, duracion_horas, modalidad, estado, version, created_by, published_at)
VALUES (
  'CERT-ENT-2026',
  'Certificación de Entrenadores de Culturismo Natural INBA Ecuador',
  'Programa integral de formación para entrenadores de culturismo natural basado en evidencia científica. 12 módulos que cubren anatomía, biomecánica, fisiología, programación, nutrición, evaluación, ética y prácticas supervisadas.',
  '["Comprender los fundamentos científicos del culturismo natural", "Dominar anatomía funcional, biomecánica y fisiología aplicada al entrenamiento", "Diseñar programas de hipertrofia y fuerza basados en evidencia", "Evaluar atletas y diseñar planes individualizados", "Aplicar principios nutricionales dentro del alcance profesional", "Promover la ética deportiva y el cumplimiento antidopaje", "Desarrollar competencias de comunicación, ética y gestión profesional"]',
  '["Ser mayor de 18 años", "Tener conocimientos básicos de entrenamiento (recomendado)", "Compromiso con el culturismo natural y el juego limpio", "Disponibilidad para clases híbridas y prácticas presenciales"]',
  72,
  'hibrido',
  'publicado',
  1,
  (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  objetivos = EXCLUDED.objetivos,
  requisitos = EXCLUDED.requisitos,
  duracion_horas = EXCLUDED.duracion_horas,
  modalidad = EXCLUDED.modalidad,
  estado = EXCLUDED.estado,
  version = EXCLUDED.version,
  updated_at = NOW();

-- Obtener ID del curso para usar en módulos
DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 1: INDUCCIÓN Y FUNDAMENTOS DEL CULTURISMO NATURAL
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 1, 'Inducción y fundamentos del culturismo natural',
    'Comprender qué es el culturismo natural, cuáles son sus principios y qué responsabilidades asume un entrenador.',
    '["Definir culturismo natural y diferenciarlo de otras preparaciones", "Explicar los principios básicos del entrenamiento", "Identificar el rol y límites del entrenador"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  -- Temas Módulo 1
  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, '¿Qué es el culturismo natural?',
    'Definición, criterios de juicio y diferencia con preparación estética.',
    '["Definir culturismo natural", "Explicar criterios de juicio", "Diferenciar natural vs asistido"]', 90),
  (v_modulo_id, 2, 'Principios del entrenamiento',
    'Sobrecarga progresiva, especificidad, individualización, consistencia, recuperación, adherencia.',
    '["Explicar cada principio", "Aplicar a casos prácticos"]', 90),
  (v_modulo_id, 3, 'El papel del entrenador',
    'Evaluar, planificar, enseñar, adaptar. Límites: no diagnosticar, no prescribir medicamentos.',
    '["Definir rol del entrenador", "Identificar límites profesionales"]', 60);

  -- Lecciones Módulo 1
  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, '¿Qué es el culturismo natural?',
    'Definición, criterios de juicio (muscularidad, proporción, simetría, definición), diferencia con preparación estética. La condición natural se define por reglas y controles, no por apariencia.',
    'texto', jsonb_build_object(
      'contenido', 'El culturismo es una disciplina deportiva que busca desarrollar la musculatura y presentar el físico mediante criterios como muscularidad, proporción, simetría, condición física y presentación escénica, según la categoría y el reglamento de cada competición.

El culturismo natural comparte estos objetivos, pero incorpora el compromiso con el deporte libre de sustancias prohibidas. La condición de atleta natural no se determina únicamente por su apariencia física: depende de los criterios de elegibilidad, controles y normas de la organización deportiva correspondiente.',
      'objetivos', '["Definir culturismo natural", "Identificar criterios de juicio", "Diferenciar natural vs asistido"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = v_modulo_id AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Principios del entrenamiento',
    'Sobrecarga progresiva, especificidad, individualización, consistencia, recuperación, adherencia.',
    'texto', jsonb_build_object(
      'contenido', 'Principios fundamentales del entrenamiento:

1. **Sobrecarga progresiva**: aumentar gradualmente el estímulo mediante más repeticiones, carga, mejor ejecución o mayor trabajo tolerable.

2. **Especificidad**: el entrenamiento debe corresponder al objetivo. Desarrollar fuerza, ganar masa muscular y preparar una presentación escénica son objetivos relacionados, pero diferentes.

3. **Individualización**: la respuesta depende de experiencia, edad, técnica, recuperación, disponibilidad y características personales.

4. **Consistencia**: los resultados se construyen mediante meses de trabajo, no con sesiones aisladas.

5. **Recuperación**: el entrenamiento genera un estímulo; la adaptación requiere tiempo, alimentación y descanso.

6. **Adherencia**: un programa eficaz debe ser viable y sostenible para la persona.',
      'objetivos', '["Explicar cada principio", "Aplicar a casos prácticos"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = v_modulo_id AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'El papel del entrenador',
    'Evaluar, planificar, enseñar técnica, registrar resultados, adaptar. Límites: no diagnosticar, no prescribir medicamentos.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador evalúa, planifica, enseña técnica, registra resultados y adapta el proceso. No debe diagnosticar enfermedades, prescribir medicamentos ni sustituir a profesionales sanitarios.

Debe comunicar con claridad, respetar la privacidad del atleta, evitar promesas irreales y documentar sus decisiones.

**Actividad**: el estudiante explica con sus propias palabras qué diferencia al culturismo natural de una preparación enfocada exclusivamente en la apariencia.',
      'objetivos', '["Definir rol del entrenador", "Identificar límites profesionales"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = v_modulo_id AND t.orden = 3;

  -- Recursos Módulo 1
  INSERT INTO recursos (leccion_id, tipo, titulo, url, orden, es_descargable)
  SELECT l.id, 'pdf', 'Criterios de juicio INBA', '/recursos/criterios-juicio-inba.pdf', 1, TRUE
  FROM lecciones l JOIN temas t ON l.tema_id = t.id WHERE t.modulo_id = v_modulo_id AND l.orden = 1 LIMIT 1;

  INSERT INTO recursos (leccion_id, tipo, titulo, url, orden, es_descargable)
  SELECT l.id, 'pdf', 'Tabla principios vs mitos', '/recursos/principios-vs-mitos.pdf', 2, TRUE
  FROM lecciones l JOIN temas t ON l.tema_id = t.id WHERE t.modulo_id = v_modulo_id AND l.orden = 1 LIMIT 1;

  -- Autoevaluación Módulo 1
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  VALUES (v_curso_id, v_modulo_id, 'Autoevaluación Módulo 1: Fundamentos', 'Práctica sin calificar para repasar conceptos clave', 'cuestionario', 0, 20, 3, 'publicado')
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué significa sobrecarga progresiva?', 'respuesta_corta', 2, 1, 'Aumentar gradualmente el estímulo mediante más repeticiones, carga, mejor ejecución o mayor trabajo tolerable.'),
  (v_eval_id, '¿Por qué no todos los atletas deben seguir la misma rutina?', 'respuesta_corta', 2, 2, 'La planificación debe adaptarse al individuo: experiencia, edad, técnica, recuperación, disponibilidad.'),
  (v_eval_id, 'La apariencia física demuestra que una persona compite sin sustancias prohibidas. ¿Verdadero o Falso?', 'verdadero_falso', 1, 3, 'Falso. La apariencia no acredita el cumplimiento antidopaje; la condición natural se define por reglas y controles.');

END $$;
-- ============================================
-- MÓDULOS 2-4: ANATOMÍA, FISIOLOGÍA, BIOMECÁNICA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 2: ANATOMÍA APLICADA AL ENTRENAMIENTO
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES ((SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026'), 2, 'Anatomía aplicada al entrenamiento',
    'Identificar las principales estructuras musculoesqueléticas y relacionarlas con los ejercicios de gimnasio.',
    '["Identificar estructuras musculoesqueléticas clave", "Relacionar músculos con ejercicios de gimnasio", "Comprender planos, ejes y movimientos articulares", "Diferenciar agonistas, antagonistas, sinergistas y estabilizadores"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  -- Temas Módulo 2
  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Sistema musculoesquelético', 'Huesos, articulaciones, músculos, tendones, ligamentos y SN', '["Describir componentes del sistema musculoesquelético"]', 60),
  (v_modulo_id, 2, 'Principales grupos musculares', 'Pecho/espalda/hombros, piernas/glúteos, brazos', '["Identificar músculos principales y sus acciones"]', 120),
  (v_modulo_id, 3, 'Planos y ejes anatómicos', 'Sagital, frontal, transversal y sus ejes', '["Identificar planos y ejes", "Relacionar con movimientos"]', 60),
  (v_modulo_id, 4, 'La escápula', 'Movimientos escapulares y su relevancia en hombro', '["Describir movimientos escapulares", "Aplicar a ejercicios"]', 60),
  (v_modulo_id, 5, 'Agonistas, antagonistas y estabilizadores', 'Roles musculares en ejercicios básicos', '["Diferenciar roles musculares", "Aplicar a ejercicios básicos"]', 60);

  -- Lecciones Módulo 2
  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Sistema musculoesquelético',
    'Huesos, articulaciones, músculos, tendones, ligamentos y SN. Función de cada componente.',
    'texto', jsonb_build_object(
      'contenido', 'El sistema musculoesquelético está compuesto por huesos, articulaciones, músculos, tendones y otros tejidos conectivos.

Los huesos proporcionan soporte y puntos de inserción. Las articulaciones permiten movimiento. Los músculos producen fuerza y los tendones transmiten esa fuerza hacia los huesos.

El entrenador debe conocer la anatomía necesaria para seleccionar ejercicios, comprender movimientos y reconocer cuándo una molestia requiere evaluación profesional.',
      'objetivos', '["Describir componentes del sistema musculoesquelético"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Principales grupos musculares - Pecho, espalda, hombros',
    'Pectoral mayor, dorsal ancho, trapecio, romboides, deltoides: acciones y ejercicios.',
    'texto', jsonb_build_object(
      'contenido', 'Pecho, espalda y hombros:
- Pectoral mayor: participa en la aducción horizontal y movimientos de empuje.
- Dorsal ancho: contribuye a la extensión y aducción del hombro.
- Trapecio y romboides: intervienen en los movimientos y el control escapular.
- Deltoides: contribuye a la elevación del brazo en diferentes direcciones.',
      'objetivos', '["Identificar músculos y sus acciones"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 2, 'Principales grupos musculares - Piernas, glúteos, brazos',
    'Cuádriceps, isquiotibiales, glúteo mayor, gastrocnemio, sóleo, bíceps, tríceps, antebrazo.',
    'texto', jsonb_build_object(
      'contenido', 'Piernas y glúteos:
- Cuádriceps: extiende la rodilla.
- Isquiotibiales: flexionan la rodilla y participan en la extensión de cadera.
- Glúteo mayor: contribuye a la extensión de cadera.
- Gastrocnemio y sóleo: participan en la flexión plantar del tobillo.

Brazos:
- Bíceps braquial: flexiona el codo y participa en la supinación del antebrazo.
- Tríceps braquial: extiende el codo.
- Músculos del antebrazo: intervienen en el agarre y los movimientos de muñeca y dedos.',
      'objetivos', '["Identificar músculos y sus acciones"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Planos y ejes anatómicos',
    'Plano sagital (flexión/extensión), frontal (abducción/aducción), transversal (rotaciones).',
    'texto', jsonb_build_object(
      'contenido', 'Planos y ejes anatómicos:
- Plano sagital: divide el cuerpo en derecha e izquierda. Se relaciona con movimientos como flexión y extensión.
- Plano frontal: divide el cuerpo en anterior y posterior. Se relaciona con abducción y aducción.
- Plano transversal: divide el cuerpo en superior e inferior. Se relaciona con rotaciones.

Los ejes son líneas imaginarias alrededor de las cuales se produce el movimiento. En términos generales, el movimiento en el plano sagital ocurre alrededor de un eje mediolateral; en el frontal, alrededor de uno anteroposterior; y en el transversal, alrededor de uno longitudinal.',
      'objetivos', '["Identificar planos y ejes", "Relacionar con movimientos"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'La escápula y sus movimientos',
    'Elevación/depresión, protracción/retracción, rotación superior/inferior. Relevancia en hombro.',
    'texto', jsonb_build_object(
      'contenido', 'La escápula se mueve sobre la caja torácica y participa en la función del hombro.

Sus movimientos principales son:
- Elevación y depresión.
- Protracción y retracción.
- Rotación superior e inferior.

Estos movimientos son importantes en elevaciones de brazos, remos, empujes y ejercicios por encima de la cabeza. No se debe enseñar que la escápula permanece rígida en todos los ejercicios: su movimiento debe corresponder a la tarea y a la articulación implicada.',
      'objetivos', '["Describir movimientos escapulares", "Aplicar a ejercicios"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 4;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Agonistas, antagonistas y estabilizadores',
    'Roles musculares en curl, press, sentadilla, remo, elevación lateral.',
    'texto', jsonb_build_object(
      'contenido', 'El agonista contribuye de manera principal al movimiento; el antagonista produce una acción opuesta; los sinergistas ayudan a ejecutar la tarea y los estabilizadores controlan segmentos corporales.

Por ejemplo, en un curl de bíceps, los flexores del codo participan en el movimiento y otros músculos estabilizan el hombro y el tronco.

Práctica presencial: identificar los grupos musculares involucrados en sentadilla, press de banca, remo, curl de bíceps y elevación lateral.',
      'objetivos', '["Diferenciar roles musculares", "Aplicar a ejercicios básicos"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 5;

  -- Autoevaluación Módulo 2
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 2: Anatomía', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 2
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿En qué plano ocurre la flexión de codo en un curl?', 'opcion_multiple', 1, 1, 'El plano sagital divide el cuerpo en derecha-izquierda y los movimientos son flexión/extensión.'),
  (v_eval_id, 'El braquial es un supinador potente del antebrazo.', 'verdadero_falso', 1, 2, 'Falso. El braquial es flexor puro del codo; el bíceps supina.'),
  (v_eval_id, 'En un remo, ¿qué músculos realizan retracción escapular?', 'respuesta_corta', 2, 3, 'Romboides y trapecio medio/inferior realizan la retracción escapular.');

END $$;
-- ============================================
-- MÓDULOS 3-4: FISIOLOGÍA Y BIOMECÁNICA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 3: FISIOLOGÍA DEL EJERCICIO
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 3, 'Fisiología del ejercicio',
    'Explicar cómo el organismo produce fuerza, utiliza energía y se adapta al entrenamiento.',
    '["Describir contracción muscular y unión neuromuscular", "Explicar los tres sistemas energéticos", "Comprender hipertrofia y mecanotransducción", "Diferenciar fatiga y recuperación"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Contracción muscular', 'Unión neuromuscular, Ca²⁺, puentes cruzados, ATP', '["Describir secuencia de contracción"]', 90),
  (v_modulo_id, 2, 'Sistemas energéticos', 'Fosfágenos, glucólisis, oxidativo (simultáneos)', '["Explicar predominio según intensidad/duración"]', 90),
  (v_modulo_id, 3, 'Hipertrofia y mecanotransducción', 'mTORC1, tensión mecánica, síntesis vs degradación', '["Explicar mecanotransducción y mTORC1"]', 90),
  (v_modulo_id, 4, 'Fatiga y recuperación', 'Fatiga periférica/central, agujetas, fallo, recuperación', '["Diferenciar fatiga y recuperación"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Contracción muscular',
    'Secuencia: neurona → acetilcolina → Ca²⁺ → puentes cruzados actina-miosina + ATP.',
    'texto', jsonb_build_object(
      'contenido', 'La contracción comienza con una señal del sistema nervioso que llega a la unión neuromuscular. La liberación de acetilcolina desencadena una señal eléctrica en la fibra muscular. Esta señal promueve la liberación de calcio, que permite la interacción entre actina y miosina.

La interacción de estas proteínas, utilizando energía procedente del ATP, produce fuerza muscular.

Una unidad motora es una neurona y las fibras que inerva; más unidades reclutadas, más fuerza.',
      'objetivos', '["Describir secuencia de contracción"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 3) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Sistemas energéticos',
    'Fosfágenos (esfuerzos <10s), glucólisis (10s-2min), oxidativo (prolongado). Funcionan simultáneamente.',
    'texto', jsonb_build_object(
      'contenido', 'El organismo utiliza diferentes vías para regenerar ATP:
- Sistema de fosfágenos: proporciona energía rápidamente para esfuerzos intensos y breves.
- Glucólisis: utiliza glucosa o glucógeno para regenerar ATP a través de varias reacciones.
- Metabolismo oxidativo: utiliza oxígeno y puede aprovechar carbohidratos y grasas, especialmente en esfuerzos prolongados y en la recuperación entre series.

Los tres sistemas actúan simultáneamente, aunque su contribución cambia según la intensidad, la duración y el descanso.',
      'objetivos', '["Explicar predominio según intensidad/duración"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 3) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Hipertrofia y mecanotransducción',
    'Vía mTORC1, tensión mecánica, síntesis vs degradación, picos hormonales no predicen hipertrofia.',
    'texto', jsonb_build_object(
      'contenido', 'La hipertrofia es el aumento del tamaño de las fibras musculares. El entrenamiento de fuerza genera estímulos mecánicos y respuestas celulares que, junto con la disponibilidad de nutrientes y la recuperación, pueden producir adaptación.

El estímulo mecánico se convierte en señales celulares (mecanotransducción), incluida la vía mTORC1.

La hipertrofia resulta del balance entre síntesis y degradación proteica y de la remodelación muscular.

Los cambios agudos de síntesis proteica en las primeras semanas no se corresponden bien con la hipertrofia posterior (Damas et al., 2015).

Hormonas: los picos agudos tras entrenar no predicen por sí solos la hipertrofia; es una cuestión con evidencia limitada.

Fatiga y recuperación: el entrenamiento genera fatiga; la adaptación ocurre con descanso adecuado.',
      'objetivos', '["Explicar mecanotransducción y mTORC1"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 3) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Fatiga y recuperación',
    'Fatiga periférica vs central, agujetas no son requisito, fallo no obligatorio.',
    'texto', jsonb_build_object(
      'contenido', 'La fatiga es una reducción temporal de la capacidad para producir fuerza o mantener el rendimiento. Puede estar relacionada con factores musculares, nerviosos, energéticos y psicológicos.

Las agujetas no son un requisito para crecer. Entrenar al fallo tampoco es obligatorio en todas las series. El entrenador debe observar el rendimiento, la técnica, la recuperación y la evolución del atleta.

Fatiga periférica = fallos distal a la placa motora (acumulación Pi, H⁺, ADP, depleción Ca²⁺). Fatiga central = reducción de la salida neural (frecuencia disparo, reclutamiento UMs altas).',
      'objetivos', '["Diferenciar fatiga y recuperación"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 3) AND t.orden = 4;

  -- Autoevaluación Módulo 3
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 3: Fisiología', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 3
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué ion es el disparador directo de la interacción actina-miosina?', 'opcion_multiple', 1, 1, 'Calcio (Ca²⁺)'),
  (v_eval_id, 'Los tres sistemas energéticos funcionan de forma simultánea con distinto predominio.', 'verdadero_falso', 1, 2, 'Verdadero. Cambia el predominio según intensidad/duración.'),
  (v_eval_id, '¿Por qué los picos agudos de testosterona post-entrenamiento no predicen hipertrofia?', 'respuesta_corta', 2, 3, 'Evidencia limitada; hipertrofia resulta de tensión mecánica → mecanotransducción → síntesis proteica neta sostenida + recuperación.');

END $$;
-- ============================================
-- MÓDULO 4: BIOMECÁNICA Y TÉCNICA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 4, 'Biomecánica y técnica de los ejercicios',
    'Analizar los movimientos, enseñar técnica y ajustar ejercicios a las capacidades del atleta.',
    '["Calcular y aplicar torque en ejercicios", "Enseñar técnica de 5 ejercicios básicos", "Aplicar rango de movimiento según evidencia", "Identificar y corregir errores técnicos"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Fuerza, resistencia y torque', 'Fuerza, torque = fuerza × brazo de momento, perfil de torque en curl', '["Calcular torque", "Explicar perfil de torque"]', 90),
  (v_modulo_id, 2, 'Técnica de los 5 ejercicios básicos', 'Sentadilla, PMR, press banca, remo, jalón', '["Enseñar técnica de 5 ejercicios"]', 120),
  (v_modulo_id, 3, 'Rango de movimiento', 'Evidencia ROM completo vs parcial, posición alargada', '["Aplicar ROM según evidencia"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Torque y palancas en el ejercicio',
    'Torque = Fuerza × Brazo de momento. En curl, torque máx en antebrazo horizontal (90°).',
    'texto', jsonb_build_object(
      'contenido', 'La fuerza es una interacción capaz de modificar el movimiento o deformar un cuerpo. El torque es el efecto rotacional de una fuerza respecto a un eje articular.

Torque = Fuerza × Brazo de momento

El brazo de momento es la distancia perpendicular entre la línea de acción de la fuerza y el eje de rotación. Por eso, la dificultad de un ejercicio cambia a lo largo del recorrido.

En el curl con mancuerna, el torque externo es máximo cuando el antebrazo está horizontal (90° de flexión); al estar casi extendido o muy flexionado, el brazo de momento es pequeño.',
      'objetivos', '["Calcular torque", "Explicar perfil de torque"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Técnica: Sentadilla',
    'Apoyo pies, trayectoria, control tronco, rodillas, profundidad según proporciones.',
    'texto', jsonb_build_object(
      'contenido', 'Sentadilla: evaluar apoyo de los pies, trayectoria, control del tronco, movimiento de rodillas y profundidad tolerada. La técnica exacta depende de las proporciones corporales y del objetivo.',
      'objetivos', '["Enseñar técnica de sentadilla"]'
    ),
    TRUE, 30
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 2, 'Técnica: Peso muerto rumano',
    'Bisagra de cadera, barra cerca del cuerpo, control descenso, amplitud según control.',
    'texto', jsonb_build_object(
      'contenido', 'Peso muerto rumano: enseñar la bisagra de cadera, mantener la carga próxima al cuerpo y controlar el descenso. La amplitud debe permitir conservar el control y no debe forzarse a costa de la posición.',
      'objetivos', '["Enseñar técnica de PMR"]'
    ),
    TRUE, 30
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 3, 'Técnica: Press de banca',
    'Apoyo pies, estabilidad, agarre, trayectoria barra, control descenso, ancho agarre.',
    'texto', jsonb_build_object(
      'contenido', 'Press de banca: revisar apoyo de pies, estabilidad, agarre, trayectoria de la barra y control del descenso. El ancho del agarre y la posición del brazo deben adaptarse al atleta.',
      'objetivos', '["Enseñar técnica de press banca"]'
    ),
    TRUE, 30
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 4, 'Técnica: Remo y Jalón',
    'Remo: evitar impulso tronco, trayectoria codo. Jalón: controlar tronco, evitar tirones, movimiento escapular.',
    'texto', jsonb_build_object(
      'contenido', 'Remo: evitar que el movimiento se convierta involuntariamente en un impulso excesivo del tronco. La trayectoria del codo modifica el énfasis relativo sobre diferentes músculos.

Jalón al pecho: controlar el tronco, evitar tirones y permitir el movimiento escapular. No es necesario llevar la barra detrás de la cabeza para obtener un entrenamiento eficaz.',
      'objetivos', '["Enseñar técnica de remo y jalón"]'
    ),
    TRUE, 30
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Rango de movimiento: evidencia y aplicación',
    'Meta-análisis PMID 34170576: rangos amplios ≥ parciales. Posición alargada (stretch) es clave.',
    'texto', jsonb_build_object(
      'contenido', 'El rango de movimiento debe ser suficiente para entrenar el músculo objetivo con control y tolerancia. No existe una amplitud universalmente perfecta para todas las personas y todos los ejercicios.

Según el meta-análisis (PMID 34170576), rangos amplios suelen ser iguales o mejores que rangos parciales, según el ejercicio. La posición alargada (stretch) puede ser especialmente efectiva para la hipertrofia.

Se debe diferenciar entre una adaptación técnica intencional y una compensación causada por falta de control, carga excesiva o limitación de movilidad.',
      'objetivos', '["Aplicar ROM según evidencia"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 3;

  -- Autoevaluación Módulo 4
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 4: Biomecánica', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 4
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, 'En el curl con mancuerna, el torque externo es MÁXIMO cuando:', 'opcion_multiple', 1, 1, 'Con el antebrazo horizontal (90°) el brazo de momento de la carga es máximo.'),
  (v_eval_id, 'El rango de movimiento parcial en posición acortada es superior al completo.', 'verdadero_falso', 1, 2, 'Falso. Rangos amplios ≥ parciales; posición alargada (stretch) es clave.'),
  (v_eval_id, 'En press de banca, ¿cómo afecta el ancho de agarre al torque sobre el hombro?', 'respuesta_corta', 2, 3, 'Agarre ancho → mayor abducción → mayor brazo de momento → torque hombro ↑, tríceps ↓. Agarre estrecho → torque hombro ↓, tríceps ↑.');

END $$;
-- ============================================
-- MÓDULOS 5-6: HIPERTROFÍA, PROGRAMACIÓN
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 5: HIPERTROFÍA, FUERZA Y VARIABLES
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES ((SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026'), 5, 'Hipertrofia, fuerza y variables del entrenamiento',
    'Comprender cómo se manipulan las variables del entrenamiento para desarrollar masa muscular y fuerza.',
    '["Aplicar volumen semanal según Schoenfeld 2017", "Usar RIR/Proximidad al fallo según Refalo 2023", "Seleccionar rango de repeticiones según objetivo", "Diseñar progresión sin fallo obligatorio"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Carga y repeticiones', 'Evidencia: 5-30 reps efectivas si esfuerzo suficiente. Cargas altas para fuerza máxima.', '["Seleccionar rango reps según objetivo"]', 60),
  (v_modulo_id, 2, 'Series y volumen', 'Schoenfeld 2017: 10-20 series/sem/grupo. Rendimientos decrecientes, respuesta individual.', '["Aplicar volumen con rendimientos decrecientes"]', 60),
  (v_modulo_id, 3, 'Proximidad al fallo (RIR)', 'Refalo 2023: RIR 1-3 = RIR 0. No obligatorio fallo. Menos fatiga sistémica.', '["Usar RIR para controlar esfuerzo"]', 60),
  (v_modulo_id, 4, 'Descanso y frecuencia', 'Descanso según ejercicio. Frecuencia 2x/sem mín. Distribución volumen.', '["Programar descanso y frecuencia"]', 60),
  (v_modulo_id, 5, 'Progresión y periodización', 'Progresión: carga/reps/RIR. Lineal, ondulada, bloques. Ajuste 1 variable.', '["Diseñar progresión y periodización"]', 90);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Carga y repeticiones: evidencia',
    '5-30 reps efectivas si RIR adecuado. Cargas altas (1-5) para fuerza. Rango híbrido 6-12 clásico.',
    'texto', jsonb_build_object(
      'contenido', 'La carga externa no determina por sí sola el estímulo. Se puede producir hipertrofia con distintas cargas si el esfuerzo, el volumen y la ejecución son adecuados. Las cargas altas suelen ser especialmente útiles para desarrollar fuerza máxima específica.

El rango de repeticiones debe elegirse según el objetivo, el ejercicio, la experiencia y la tolerancia del atleta. Rangos de 5-30 repeticiones pueden ser efectivos si el esfuerzo es suficiente.',
      'objetivos', '["Seleccionar rango reps según objetivo"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Volumen semanal: Schoenfeld 2017',
    'Meta-análisis: 10-20 series/sem/grupo. Rendimientos decrecientes. Respuesta individual.',
    'texto', jsonb_build_object(
      'contenido', 'Según el meta-análisis de Schoenfeld et al. (2017, PMID 27433992), la relación dosis-respuesta entre volumen semanal e hipertrofia muestra rendimientos decrecientes y respuesta individual.

Rango práctico: ~10-20 series/semana/grupo muscular para mayoría.

Rendimientos decrecientes: cada serie extra aporta menos hipertrofia marginal; punto de saturación.

Respuesta individual: algunos crecen con 10 series, otros necesitan 20; genética, recuperación, nutrición.

Implicación: empezar conservador (10-12), subir si progresa y recupera; no copiar "20 series" ciegamente.',
      'objetivos', '["Aplicar volumen con rendimientos decrecientes"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Proximidad al fallo: Refalo 2023',
    'RIR 1-3 = RIR 0 en hipertrofia. Fallo genera más fatiga. No obligatorio.',
    'texto', jsonb_build_object(
      'contenido', 'Según Refalo et al. (2023, PMID 36334240), entrenar al fallo (RIR 0) no es obligatorio; entrenar cerca del fallo (RIR 1-3) es igualmente efectivo con menos fatiga sistémica.

Implicación: programar RIR 1-3 en mayoría de series → mejor recuperación, más volumen tolerable, misma hipertrofia.

Fallo (RIR 0) puede usarse puntualmente (última serie, ejercicios seguros, mesociclo de intensificación).

En naturales, recuperación es limitante → evitar fallo crónico permite más volumen efectivo/semana.',
      'objetivos', '["Usar RIR para controlar esfuerzo"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Descanso, frecuencia y progresión',
    'Descanso según ejercicio (compuestos > aislamiento). Frecuencia 2x/sem mín. Progresión: carga/reps/RIR.',
    'texto', jsonb_build_object(
      'contenido', 'Los descansos deben permitir mantener la calidad del trabajo. Los ejercicios compuestos y las series exigentes pueden requerir descansos más largos que los ejercicios de aislamiento.

La frecuencia indica cuántas veces se entrena un grupo muscular en un periodo determinado. Frecuencia mínima 2x/semana por grupo muscular para hipertrofia en naturales.

La progresión no siempre consiste en añadir peso. Puede incluir mejor control, mayor amplitud tolerada o más repeticiones con la misma carga.

Regla: solo sube carga si completas series objetivo con RIR objetivo; una variable por semana.',
      'objetivos', '["Programar descanso y frecuencia"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 4;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Periodización y caso práctico estancamiento',
    'Lineal, ondulada, bloques. Caso: 4 meses mismo plan → diagnóstico → ajuste 1 variable.',
    'texto', jsonb_build_object(
      'contenido', 'La periodización organiza el entrenamiento a lo largo del tiempo. Puede estructurarse por sesiones, semanas y bloques de varias semanas.

No todos los atletas necesitan una periodización compleja. El plan debe modificarse según el progreso y la respuesta individual.

Caso práctico: atleta 4 meses mismo plan, sin progreso.
Diagnóstico: 1) Registro progresión real 2) Sueño/estrés/energía 3) Proteína 4) Técnica/ROM 5) Volumen/RIR → cambiar 1 variable a la vez.

Error: cambiar todas las variables a la vez impide saber qué funcionó.',
      'objetivos', '["Diseñar progresión y periodización"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 5;

  -- Autoevaluación Módulo 5
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 5: Hipertrofia', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 5
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, 'Según Schoenfeld 2017, la relación volumen-hipertrofia muestra:', 'opcion_multiple', 1, 1, 'Rendimientos decrecientes y respuesta individual'),
  (v_eval_id, 'Según Refalo 2023, entrenar al fallo (RIR 0) es obligatorio para hipertrofia.', 'verdadero_falso', 1, 2, 'Falso. No es obligatorio; RIR 1-3 igualmente efectivo.'),
  (v_eval_id, 'Atleta 25 series/sem pectoral sin crecer → reduces a 14 y crece. Explica con rendimientos decrecientes.', 'respuesta_corta', 2, 3, '25 series > punto saturación → fatiga > estímulo. Al bajar a 14 (rango óptimo), fatiga ↓ → recuperación ↑ → hipertrofia.');

END $$;
-- ============================================
-- MÓDULO 6: DISEÑO DE PROGRAMAS Y PERIODIZACIÓN
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 6, 'Diseño de programas y periodización',
    'Convertir una evaluación inicial en un plan de entrenamiento progresivo y medible.',
    '["Realizar entrevista inicial completa", "Estructurar planificación con objetivos y progresión", "Aplicar progresión sin fallo obligatorio", "Ajustar plan según respuesta individual"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Entrevista inicial', 'Experiencia, objetivos, disponibilidad, equipamiento, historial, preferencias', '["Realizar entrevista completa"]', 60),
  (v_modulo_id, 2, 'Estructura de planificación', 'Objetivos, ejercicios, series, reps, esfuerzo, descansos, criterios progresión', '["Estructurar planificación completa"]', 90),
  (v_modulo_id, 3, 'Progresión sin fallo', 'Progresar: carga/reps/RIR. No siempre añadir peso.', '["Aplicar progresión sin fallo"]', 60),
  (v_modulo_id, 4, 'Periodización y ajustes', 'Lineal, ondulada, bloques. Modificar según progreso, no por calendario.', '["Aplicar periodización y ajustes"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Entrevista inicial completa',
    'Experiencia, objetivos, disponibilidad, equipamiento, historial, preferencias, calidad recuperación.',
    'texto', jsonb_build_object(
      'contenido', 'Antes de planificar, el entrenador debe conocer:
- Experiencia de entrenamiento y objetivos.
- Disponibilidad semanal y duración de las sesiones.
- Equipamiento disponible.
- Historial de lesiones o molestias relevantes comunicadas por el atleta.
- Preferencias, barreras de adherencia y calidad de recuperación.
- En caso de competición, fecha, categoría y reglamento aplicable.

La entrevista no sustituye una valoración médica ni autoriza al entrenador a diagnosticar.',
      'objetivos', '["Realizar entrevista completa"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 6) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Estructura de planificación',
    'Objetivos, ejercicios, series, reps, esfuerzo, descansos, criterios progresión. Ejemplo principiante 3 días.',
    'texto', jsonb_build_object(
      'contenido', 'Una planificación debe incluir objetivos, ejercicios, series, repeticiones, esfuerzo, descansos y criterios de progresión.

Ejemplo educativo para un principiante:
Día	Enfoque
Lunes	Cuerpo completo A
Miércoles	Cuerpo completo B
Viernes	Cuerpo completo A

En las semanas siguientes se alternan las sesiones para distribuir el trabajo. Las cargas iniciales deben permitir aprender la técnica y terminar las series con esfuerzo controlado.',
      'objetivos', '["Estructurar planificación completa"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 6) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Progresión sin fallo obligatorio',
    'Progresar cuando completa reps con buena técnica y RIR objetivo. Carga, reps, técnica, rango, frecuencia.',
    'texto', jsonb_build_object(
      'contenido', 'Se puede progresar cuando el atleta completa las repeticiones previstas con buena técnica y el esfuerzo deseado. Por ejemplo, si el rango establecido es de 8 a 12 repeticiones, se aumenta gradualmente el peso cuando el atleta alcanza el límite superior de forma consistente.

La progresión no siempre consiste en añadir peso. Puede incluir mejor control, mayor amplitud tolerada o más repeticiones con la misma carga.',
      'objetivos', '["Aplicar progresión sin fallo"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 6) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Periodización y ajustes según respuesta',
    'Lineal, ondulada, bloques. Modificar según progreso, no por calendario.',
    'texto', jsonb_build_object(
      'contenido', 'La periodización organiza el entrenamiento a lo largo del tiempo. Puede estructurarse por sesiones, semanas y bloques de varias semanas.

Lineal: volumen ↓ / intensidad ↑ progresivo (mesociclos largos)
Ondulada: variación frecuente (semanal/diaria) de volumen/intensidad
Bloques: mesociclos especializados (acumulación → intensificación → realización)

No todos los atletas necesitan una periodización compleja. El plan debe modificarse según el progreso y la respuesta individual, no únicamente porque cambie la semana del calendario.',
      'objetivos', '["Aplicar periodización y ajustes"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 6) AND t.orden = 4;

  -- Autoevaluación Módulo 6
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 6: Programación', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 6
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué componentes debe incluir una planificación completa?', 'respuesta_corta', 2, 1, 'Objetivos, ejercicios, series, reps, esfuerzo, descansos, criterios progresión.'),
  (v_eval_id, 'La periodización lineal se caracteriza por volumen que disminuye e intensidad que aumenta progresivamente.', 'verdadero_falso', 1, 2, 'Verdadero. Mesociclos largos con progresión lineal.'),
  (v_eval_id, 'Diseña una progresión de 4 semanas para press banca usando RIR. Semana 1 a 4.', 'respuesta_corta', 2, 3, 'Ej: Sem 1: 3x8 RIR 2 → Sem 2: 3x9 RIR 2 → Sem 3: 3x10 RIR 1 → Sem 4: 3x8 RIR 1 (+2.5kg). Solo sube si completa objetivo.');

END $$;
-- ============================================
-- MÓDULOS 7-8: EVALUACIÓN FÍSICA Y NUTRICIÓN
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 7: EVALUACIÓN FÍSICA Y SEGUIMIENTO
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES ((SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026'), 7, 'Evaluación física y seguimiento del atleta',
    'Registrar datos relevantes y utilizarlos para tomar decisiones informadas.',
    '["Realizar anamnesis y evaluación inicial completa", "Seleccionar y aplicar tests de composición/movilidad/fuerza", "Implementar seguimiento semanal estructurado", "Identificar banderas rojas y derivar"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Evaluación inicial', 'Anamnesis, composición corporal (DEXA/pliegues/BIA), fotos, tests fuerza/movilidad', '["Realizar evaluación inicial completa"]', 90),
  (v_modulo_id, 2, 'Seguimiento semanal', 'Peso, cargas, cumplimiento, sueño, molestias, observaciones. Tendencias vs datos aislados', '["Implementar seguimiento estructurado"]', 60),
  (v_modulo_id, 3, 'Indicadores de alerta', 'Caída rendimiento, fatiga, dolor, mareos. Derivación médica.', '["Identificar banderas rojas y derivar"]', 45);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Evaluación inicial completa',
    'Anamnesis, DEXA/pliegues/BIA, perímetros, fotos estandarizadas, tests fuerza/movilidad, consentimiento.',
    'texto', jsonb_build_object(
      'contenido', 'La evaluación debe ser consistente, segura y relevante para el objetivo. Puede incluir experiencia, peso corporal, medidas seleccionadas, fotografías autorizadas, rendimiento en ejercicios y observaciones técnicas.

Las mediciones de composición corporal tienen margen de error. Los resultados dependen del método, la hidratación y las condiciones de medición.

DEXA = gold standard. Pliegues ISA K = barato, buen seguimiento si evaluador estandarizado (error 3-5%). BIA = rápido, sensible a hidratación.

Protocolo fotos: misma hora, luz, fondo, distancia, poses fijas (frente, lateral, espalda, abdominales).',
      'objetivos', '["Realizar evaluación inicial completa"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 7) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Tests de movilidad y fuerza',
    'Overhead squat, Thomas, knee-to-wall, apprehension. Tests fuerza: 1RM estimado / RM submáximos.',
    'texto', jsonb_build_object(
      'contenido', 'Tests de movilidad:
- Overhead squat: movilidad tobillo, cadera, torácica, hombro
- Test de Thomas: longitud psoas-ilíaco y recto femoral
- Knee-to-wall: dorsiflexión tobillo (objetivo ≥10cm)
- Test de apprehension: inestabilidad hombro

Tests fuerza: 1RM directo (riesgo) vs tests submáximos (5-10 RM) + ecuaciones predicción.

Test 1RM NO obligatorio en primera sesión de principiante.',
      'objetivos', '["Seleccionar y aplicar tests"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 7) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Seguimiento semanal y banderas rojas',
    'Peso, cargas, cumplimiento, sueño, molestias. Tendencias vs datos aislados. Banderas rojas → derivar.',
    'texto', jsonb_build_object(
      'contenido', 'Un registro semanal puede incluir:
- Peso corporal y tendencia
- Cargas, repeticiones, esfuerzo (RIR)
- Cumplimiento del programa
- Sueño y percepción de recuperación
- Molestias y cambios relevantes
- Observaciones del entrenador y del atleta

Las decisiones no deben tomarse por un solo dato aislado. Es preferible observar tendencias y comparar mediciones en condiciones similares.

Banderas rojas (derivación médica):
- Dolor agudo / inestabilidad / bloqueos
- Síntomas cardiovasculares (dolor torácico, disnea reposo, síncope, HTA no controlada)
- Trastornos alimentarios / dismorfia / uso sustancias

El entrenador no debe atribuir automáticamente estos síntomas a falta de disciplina.',
      'objetivos', '["Implementar seguimiento", "Identificar banderas rojas"]'
    ),
    TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 7) AND t.orden = 3;

  -- Autoevaluación Módulo 7
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 7: Evaluación', 'Práctica sin calificar', 'cuestionario', 0, 20, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 7
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué método es gold standard para composición corporal?', 'opcion_multiple', 1, 1, 'DEXA (absorciometría de rayos X de doble energía)'),
  (v_eval_id, 'Un objetivo "quiero ponerme fuerte" es una meta SMART.', 'verdadero_falso', 1, 2, 'Falso. No es específico, medible, ni temporal.'),
  (v_eval_id, 'Cliente 35 años, oficinista, overhead squat con talones levantados a 45°. ¿Qué evalúa, qué limita y 2 correctivos?', 'respuesta_corta', 2, 3, 'Evalúa dorsiflexión tobillo (knee-to-wall confirmaría). Límite: sóleo/gastrocnemio. Correctivos: elevaciones talones sentado (sóleo) + de pie (gastrocnemio) + estiramientos.');

END $$;
-- ============================================
-- MÓDULO 8: NUTRICIÓN DEPORTIVA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 8, 'Fundamentos de nutrición deportiva',
    'Entender los principios nutricionales relacionados con el entrenamiento y reconocer los límites del rol del entrenador.',
    '["Explicar balance energético y LEA", "Aplicar recomendaciones de macronutrientes", "Identificar suplementos con evidencia y riesgo antidopaje", "Saber cuándo derivar a nutricionista"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Balance energético', 'Superávit/déficit, disponibilidad energética baja (LEA <30 kcal/kg FFM/d)', '["Explicar balance y LEA"]', 60),
  (v_modulo_id, 2, 'Macronutrientes', 'Proteína 1.6 g/kg/d (Morton 2018), CHO 3-7 g/kg/d, Grasas ≥0.8-1 g/kg/d', '["Aplicar recomendaciones macro"]', 90),
  (v_modulo_id, 3, 'Hidratación y sueño', '35-45 ml/kg/d + pérdidas. Sueño 7-9h. No manipular agua/sodio para competir.', '["Aplicar hidratación y sueño"]', 45),
  (v_modulo_id, 4, 'Suplementos y antidopaje', 'Creatina (Grado A), cafeína, beta-alanina. Checklist: etiqueta, certificación, WADA, necesidad real. Scope: derivar nutricionista.', '["Evaluar suplementos", "Aplicar checklist antidopaje"]', 90),
  (v_modulo_id, 5, 'Alimentación y preparación competitiva', 'Planificación, seguimiento, ajustes. Restricciones severas/deshidratación = riesgo. Derivar nutricionista.', '["Saber cuándo derivar"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Balance energético y disponibilidad energética',
    'Superávit para masa, déficit para grasa. LEA <30 kcal/kg FFM/d → hormonal, óseo, psicológico.',
    'texto', jsonb_build_object(
      'contenido', 'El balance energético describe la relación entre energía consumida y energía gastada. Un superávit sostenido puede favorecer el aumento de peso; un déficit sostenido puede reducirlo.

Para desarrollar masa muscular, la alimentación debe respaldar el entrenamiento y la recuperación. Para perder grasa, el déficit debe ser compatible con salud, rendimiento y adherencia.

Baja Disponibilidad Energética (LEA): (Ingesta - Gasto ejercicio) / kg masa magra < 30 kcal/kg FFM/d.
Consecuencias: endocrino (eje HPTA ↓, T3 ↓, cortisol ↑), óseo (densidad ↓), psicológico (irritabilidad, TCA riesgo). En hombres también ocurre.

Entrenador detecta: fatiga crónica, estancamiento, lesiones recurrentes, irritabilidad, pérdida menstrual (mujeres), libido baja → derivar nutricionista/médico.',
      'objetivos', '["Explicar balance y LEA"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Macronutrientes: proteína, carbohidratos, grasas',
    'Proteína 1.6 g/kg/d (Morton 2018 saturación). CHO 3-7 g/kg/d. Grasas ≥0.8-1 g/kg/d. Distribución 0.4-0.55 g/kg/comida x 4-5.',
    'texto', jsonb_build_object(
      'contenido', 'Proteína: Morton et al. 2018 (PMID 28698222) - beneficio se estabiliza ~1.6 g/kg/d. En déficit agresivo / atletas muy magros / mayores 60a → 2-2.5 g/kg/d. Distribución: 0.4-0.55 g/kg/comida × 4-5 comidas.

Carbohidratos: combustible principal series intensas. 3-5 g/kg/d (moderado) a 5-7 g/kg/d (alto volumen).

Grasas: función celular, absorción vitaminas liposolubles, hormonas. ≥0.8-1 g/kg/d.

Fuentes: variedad animal + vegetal → perfil aminoácidos completo.',
      'objetivos', '["Aplicar recomendaciones macro"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Hidratación, sueño y suplementos con evidencia',
    'Hidratación 35-45 ml/kg/d + pérdidas. Sueño 7-9h. Creatina 3-5g/d (Grado A). Cafeína, beta-alanina, citrulina.',
    'texto', jsonb_build_object(
      'contenido', 'Hidratación: 35-45 ml/kg/d + pérdidas por sudor. Deshidratación 2% → ↓ fuerza, potencia, capacidad trabajo.

Sueño: 7-9h. <6h → mayor pérdida masa magra y mayor retención grasa en déficit. Higiene sueño, magnesio, rutina.

Suplementos con evidencia (Grado A/B):
- Creatina monohidrato 3-5 g/d: fosfocreatina → resíntesis ATP rápida. Fuerza, potencia, hipertrofia, recuperación, cognitivo. Segura en sanos.
- Cafeína 3-6 mg/kg: potencia, resistencia, enfoque.
- Beta-alanina 3.2-6.4 g/d crónica: buffer H+ en esfuerzos 1-4 min.
- Citrulina malato 6-8 g: flujo sanguíneo, fatiga.

Mitos creatina: "ciclar", "retención subcutánea" (es intracelular), "solo hombres".',
      'objetivos', '["Aplicar hidratación y sueño", "Identificar suplementos con evidencia"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Suplementación responsable: checklist y antidopaje',
    'Checklist: 1) etiqueta completa 2) certificación Informed Sport/NSF 3) vs lista WADA 4) necesidad real. Scope: derivar nutricionista.',
    'texto', jsonb_build_object(
      'contenido', 'Antes de recomendar un suplemento, el entrenador debe preguntarse:
1. ¿Existe evidencia fiable de que sea útil para ese objetivo?
2. ¿Hay riesgos, contraindicaciones o interacciones?
3. ¿El producto cuenta con certificación de un tercero independiente (Informed Sport / NSF Certified for Sport / Cologne List)?
4. ¿He revisado los ingredientes frente a la lista de WADA y las reglas de la federación?
5. ¿Existe una necesidad real que la alimentación no cubre?

La etiqueta no garantiza que un producto esté libre de contaminantes o sustancias no declaradas. "Natural" en etiqueta NO garantiza seguridad.

Rol del entrenador: identificar problemas obvios (poca energía, poca proteína, poco sueño) y remitir a nutricionista para planes individuales. No sustituye al nutricionista.',
      'objetivos', '["Evaluar suplementos", "Aplicar checklist antidopaje"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 4;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Alimentación en preparación competitiva y scope',
    'Planificación, seguimiento, ajustes. Restricciones severas/deshidratación = riesgo. Derivar nutricionista colegiado.',
    'texto', jsonb_build_object(
      'contenido', 'Una preparación requiere planificación, seguimiento y ajustes. Las restricciones severas, el uso de métodos de deshidratación y las dietas extremas pueden perjudicar la salud y el rendimiento.

El entrenador debe trabajar dentro de su competencia y coordinar con un nutricionista-dietista cualificado cuando se necesite una intervención nutricional individualizada, especialmente en presencia de enfermedad, síntomas o necesidades clínicas.

Scope of practice: entrenador = hábitos, educación, adherencia, detección flags; nutricionista = planes dietéticos individualizados, patologías, cálculo preciso.

Situaciones que requieren derivación obligatoria:
1. TCA / dismorfia / historia dietas extremas
2. Patologías: diabetes, tiroides, renal, cardiovascular, GI
3. Déficit agresivo competición / peak week / manipulación agua/sodio',
      'objetivos', '["Saber cuándo derivar"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 5;

  -- Autoevaluación Módulo 8
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 8: Nutrición', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 8
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, 'Según Morton 2018, la ingesta proteica donde el beneficio se estabiliza es:', 'opcion_multiple', 1, 1, '1.6 g/kg/d'),
  (v_eval_id, 'Un suplemento "natural" en la etiqueta garantiza que está libre de sustancias prohibidas.', 'verdadero_falso', 1, 2, 'Falso. "Natural" no está regulado; contaminación cruzada es real.'),
  (v_eval_id, 'Cliente en déficit: sueño 5h, libido 0, irritable, fuerza bajando, 2 resfriados/mes. Diagnóstico y 3 acciones.', 'respuesta_corta', 2, 3, 'Diagnóstico: Baja Disponibilidad Energética (LEA). Acciones: 1) Subir calorías 300-500 kcal/d (diet break 1-2 sem) 2) Sueño ≥7.5h 3) Proteína ≥2 g/kg/d. Derivar nutricionista/médico; reducir volumen 30% 2 sem.');

END $$;
-- ============================================
-- MÓDULOS 9-10: RECUPERACIÓN Y POSING/COMPETENCIA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 9: RECUPERACIÓN, SUEÑO Y MANEJO DE CARGA
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 9, 'Recuperación, sueño y manejo de la carga',
    'Integrar la recuperación en el programa de entrenamiento.',
    '["Explicar papel del sueño en recuperación", "Identificar estrés y carga total", "Ajustar entrenamiento ante señales de alerta"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Sueño y recuperación', '7-9h, horarios regulares, higiene sueño. Recuperación física, cognitiva, hormonal.', '["Explicar papel del sueño"]', 60),
  (v_modulo_id, 2, 'Estrés y carga total', 'Trabajo, estudio, estrés, viajes influyen. Programa adaptable a carga total vida.', '["Identificar carga total"]', 45),
  (v_modulo_id, 3, 'Señales para ajustar', 'Rendimiento ↓, sueño mala calidad, fatiga no mejora, motivación ↓, dificultad cargas habituales. Revisar programa, derivar si persiste.', '["Identificar señales y ajustar"]', 45);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Sueño: pilar de la recuperación',
    '7-9h, horarios regulares, higiene sueño. Recuperación física, cognitiva, hormonal.',
    'texto', jsonb_build_object(
      'contenido', 'El sueño participa en la recuperación física, la función cognitiva y la regulación de procesos fisiológicos. La necesidad individual varía, pero los adultos suelen beneficiarse de mantener horarios regulares y disponer de suficiente tiempo de descanso.

Higiene del sueño: horario fijo, oscuridad, temperatura fresca, sin pantallas 1h antes, cafeína solo mañana, rutina relajación.

Sueño <6h se asocia a mayor pérdida de masa magra y mayor retención de grasa en déficit (Nedeltcheva et al. 2010).',
      'objetivos', '["Explicar papel del sueño"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 9) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Estrés y carga total de la vida',
    'Trabajo, estudio, estrés, viajes, responsabilidades también consumen capacidad de recuperación.',
    'texto', jsonb_build_object(
      'contenido', 'La capacidad de recuperación no depende solo del gimnasio. Trabajo, estudio, estrés, viajes y responsabilidades personales también influyen.

Un programa adecuado debe adaptarse cuando cambia la carga total de la vida del atleta.

Estrés crónico → cortisol ↑ → catabolismo, recuperación alterada, sueño fragmentado, inmunidad ↓.

Herramienta: diario de carga (entreno + trabajo + estrés percibido 1-10) → ajustar volumen/intensidad semanal.',
      'objetivos', '["Identificar carga total"]'
    ),
    TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 9) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Señales para ajustar el entrenamiento',
    'Rendimiento ↓, sueño mala calidad, fatiga no mejora, motivación ↓, dificultad cargas habituales. Revisar programa, derivar si persiste.',
    'texto', jsonb_build_object(
      'contenido', 'Señales relevantes incluyen una caída persistente del rendimiento, mala calidad de sueño, sensación de fatiga que no mejora, pérdida de motivación o dificultad para completar cargas habituales.

Estas señales no permiten diagnosticar por sí solas un síndrome clínico. Sirven para revisar el programa y, si persisten o son preocupantes, considerar evaluación profesional.

Ajustes: reducir volumen 20-30%, subir RIR a 2-3, deload 1 semana, priorizar sueño/nutrición, revisar estrés externo.

Si persisten >2 semanas tras ajustes → derivar médico/fisio/psicólogo.',
      'objetivos', '["Identificar señales y ajustar"]'
    ),
    TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 9) AND t.orden = 3;

  -- Autoevaluación Módulo 9
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 9: Recuperación', 'Práctica sin calificar', 'cuestionario', 0, 20, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 9
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué efecto tiene el sueño <6h en composición corporal durante déficit?', 'opcion_multiple', 1, 1, 'Mayor pérdida de masa magra y mayor retención de grasa'),
  (v_eval_id, 'La capacidad de recuperación depende solo del entrenamiento en el gimnasio.', 'verdadero_falso', 1, 2, 'Falso. Trabajo, estrés, viajes, responsabilidades también influyen.'),
  (v_eval_id, 'Atleta con caída rendimiento 3 semanas, sueño 5h, irritable. 3 ajustes priorizados.', 'respuesta_corta', 2, 3, '1) Sueño ≥7.5h innegociable 2) Reducir volumen 20-30% / RIR 2-3 / deload 1 sem 3) Subir calorías 300-500 kcal + proteína ≥1.8g/kg/d. Reevaluar en 2 sem.');

END $$;
-- ============================================
-- MÓDULO 10: SUPLEMENTACIÓN, ANTIDOPAJE, INTEGRIDAD
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 10, 'Suplementación, antidopaje e integridad deportiva',
    'Promover decisiones informadas sobre suplementos y el cumplimiento de las normas deportivas.',
    '["Evaluar suplementos con checklist crítico", "Conocer normas antidopaje WADA/INBA", "Aplicar integridad deportiva y ética"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Qué es un suplemento', 'No sustituyen alimentación/entrenamiento. Etiqueta no garantiza pureza.', '["Definir suplemento y límites"]', 45),
  (v_modulo_id, 2, 'Evaluación crítica', '5 preguntas: evidencia, riesgos, certificación, WADA, necesidad real. Creatina Grado A.', '["Evaluar suplementos críticamente"]', 60),
  (v_modulo_id, 3, 'Normas antidopaje', 'Lista WADA vigente + reglas federación. Certificación reduce riesgo, no garantiza.', '["Conocer normas antidopaje"]', 60),
  (v_modulo_id, 4, 'Integridad deportiva', 'Rechazar sustancias prohibidas, no facilitar ocultación, no prometer seguridad sin fundamento.', '["Aplicar integridad deportiva"]', 45);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Qué es un suplemento y sus límites',
    'No sustituyen alimentación/entrenamiento. Etiqueta no garantiza pureza ni ausencia contaminantes.',
    'texto', jsonb_build_object(
      'contenido', 'Los suplementos pueden aportar nutrientes u otras sustancias, pero no sustituyen una alimentación adecuada ni un programa bien diseñado. La utilidad depende de la sustancia, la dosis, la evidencia, el contexto y la calidad del producto.

La etiqueta no garantiza que un producto esté libre de contaminantes o sustancias no declaradas. "Blend patentado" = no sabes dosis de cada ingrediente.',
      'objetivos', '["Definir suplemento y límites"]'
    ),
    TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Evaluación crítica: 5 preguntas + Creatina',
    '1) Evidencia 2) Riesgos 3) Certificación (Informed Sport/NSF) 4) WADA 5) Necesidad real. Creatina 3-5g/d Grado A.',
    'texto', jsonb_build_object(
      'contenido', 'Antes de recomendar un suplemento, el entrenador debe preguntarse:
1. ¿Existe evidencia fiable de que sea útil para ese objetivo?
2. ¿Hay riesgos, contraindicaciones o interacciones?
3. ¿El producto cuenta con certificación de un tercero independiente (Informed Sport / NSF Certified for Sport / Cologne List)?
4. ¿He revisado los ingredientes frente a la lista de WADA y las reglas de la federación?
5. ¿Existe una necesidad real que la alimentación no cubre?

Creatina monohidrato: 3-5 g/d crónica (carga opcional). Mecanismo: fosfocreatina → resíntesis ATP rápida. Beneficios: fuerza, potencia, hipertrofia, recuperación, cognitivo. Segura en sanos (renal hepática normal). Mitos: "ciclar", "retención subcutánea" (es intracelular), "solo hombres".',
      'objetivos', '["Evaluar suplementos críticamente"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Normas antidopaje: WADA y federaciones',
    'Lista WADA vigente + reglas federación. Certificación reduce riesgo, no garantiza. Responsabilidad estricta (strict liability).',
    'texto', jsonb_build_object(
      'contenido', 'Las sustancias y métodos prohibidos pueden cambiar con el tiempo. Los atletas y entrenadores deben consultar la lista vigente de la autoridad antidopaje pertinente y las reglas de la organización en la que competirán.

La certificación de calidad de un suplemento puede reducir determinados riesgos, pero no garantiza automáticamente que el producto esté permitido en todos los reglamentos.

Responsabilidad estricta (strict liability): el atleta es responsable de toda sustancia que entre en su cuerpo, sin necesidad de probar intención o negligencia. Contaminación de suplemento no exime de sanción.',
      'objetivos', '["Conocer normas antidopaje"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Integridad deportiva y rol del entrenador',
    'Rechazar sustancias prohibidas, no facilitar ocultación, no prometer seguridad sin fundamento. Derivar médico.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador debe rechazar el uso de sustancias prohibidas, no facilitar métodos de ocultación y no prometer que un producto es seguro o legal sin fundamento.

Si un cliente usa sustancias: no facilitar, no normalizar, explicar riesgos salud y sanciones, no entrenar para competición mientras use, derivar a médico para monitorización.

Si cliente pide "algo para crecer más rápido" sin etiquetas claras: no recomendar productos no verificables, explicar riesgo antidopaje, derivar a federación y profesional de salud.',
      'objetivos', '["Aplicar integridad deportiva"]'
    ),
    TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 4;

  -- Autoevaluación Módulo 10
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 10: Suplementación/Antidopaje', 'Práctica sin calificar', 'cuestionario', 0, 20, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 10
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué certificación reduce riesgo de contaminación en suplementos?', 'opcion_multiple', 1, 1, 'Informed Sport / NSF Certified for Sport / Cologne List'),
  (v_eval_id, 'La certificación de un suplemento garantiza que está permitido en todos los reglamentos.', 'verdadero_falso', 1, 2, 'Falso. Reduce riesgo, no garantiza.'),
  (v_eval_id, 'Cliente pide "algo para crecer más rápido" con frasco sin etiqueta completa. Checklist y veredicto.', 'respuesta_corta', 2, 3, 'Etiqueta incompleta (blend) → NO recomendar. Sin certificación → riesgo WADA. Ingredientes no revisados vs WADA. No necesidad real (proteína/creatina/alimento cubren). Veredicto: NO recomendar. Riesgo salud y sanción.');

END $$;
-- ============================================
-- MÓDULO 11: POSING, CATEGORÍAS, PREPARACIÓN COMPETITIVA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 11, 'Posing, categorías y preparación competitiva',
    'Enseñar los principios de presentación escénica y planificación de una competición.',
    '["Identificar 7 poses obligatorias y grupos musculares", "Enseñar transiciones y expresión facial", "Planificar preparación: off-season, pre-contest, peak week", "Gestionar peak week y reverse diet"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Evaluación de categorías', 'Criterios: muscularidad, proporción, condición, presentación. Leer reglamento oficial.', '["Leer y aplicar reglamento categorías"]', 60),
  (v_modulo_id, 2, 'Posing: poses obligatorias y transiciones', '7 poses: Front DB, Front Lat, Side Chest, Side Tri, Rear DB, Rear Lat, Abs/Thighs. Transiciones fluidas.', '["Enseñar 7 poses y transiciones"]', 90),
  (v_modulo_id, 3, 'Preparación para competir', 'Fases: off-season, pre-contest (0.5-1%/sem), peak week (CHO/agua/sodio), reverse diet.', '["Planificar preparación completa"]', 90),
  (v_modulo_id, 4, 'Semana de competición y riesgos', 'Logística, bronceado, práctica escénica. Riesgos: diuréticos, corte agua agresivo, sodio 0 días antes.', '["Gestionar peak week y riesgos"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Evaluación de categorías y reglamento',
    'Criterios: muscularidad, proporción, condición, presentación. Leer reglamento oficial antes de orientar.',
    'texto', jsonb_build_object(
      'contenido', 'Las categorías pueden diferir en los criterios de muscularidad, proporción, condición física y presentación. El estudiante debe aprender a leer el reglamento oficial de cada evento antes de orientar al atleta.

No debe asumir que todas las federaciones emplean las mismas categorías o los mismos criterios.',
      'objetivos', '["Leer y aplicar reglamento categorías"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 11) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Posing: 7 poses obligatorias',
    'Front DB, Front Lat, Side Chest, Side Tri, Rear DB, Rear Lat, Abs/Thighs. Control postural, transiciones, respiración.',
    'texto', jsonb_build_object(
      'contenido', 'El posing consiste en presentar el físico mediante posturas, transiciones, control corporal y expresión escénica.

7 poses obligatorias masculinas (orden típico):
1. Front Double Biceps → bíceps, frontal deltoides, pectoral, abdominales
2. Front Lat Spread → dorsal, serrato, pectoral, abdominales
3. Side Chest → pectoral lateral, cuádriceps, gemelos, bíceps
4. Side Triceps → tríceps, dorsal, deltoides lateral, cuádriceps
5. Rear Double Biceps → dorsal, trapecio, romboides, rear delts, bíceps, glúteos, isquios, gemelos
6. Rear Lat Spread → dorsal, trapecio, romboides, glúteos, isquios, gemelos
7. Abdominals & Thighs → abdominales, cuádriceps, serrato, intercostales

Transiciones: fluidas, controladas, mantener tensión muscular, no "apagarse" entre poses.
Expresión facial: confianza, disfrute, control (no sufrimiento).
Rutina libre: 60-90s, música, coreografía, puntos fuertes.',
      'objetivos', '["Enseñar 7 poses y transiciones"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 11) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 2, 'Transiciones y correcciones frecuentes',
    'Front Lat → Side Chest → Side Tri → Rear DB → Rear Lat → Abs. Errores: hombros elevados, escápulas protraídas, lumbar arqueada.',
    'texto', jsonb_build_object(
      'contenido', 'Transición Side Chest → Side Triceps (lado derecho): desde Side Chest → suelta mano dcha → gira torso frontal manteniendo pierna dcha flexionada → extiende brazo dcha lateral/tríceps → gira torso der.

Errores frecuentes y correcciones:
- Rear Double Biceps: hombros elevados → depresión escapular (trap inferior, dorsal). Escápulas protraídas → retracción (romboides, trap medio). Lumbar arqueada → core/glúteos activos, pelvis neutra.
- Front Lat Spread: elevar hombros (trap sup) → cierra "V". Corrección: "empuja manos afuera y abajo", "omóplatos a bolsillos".',
      'objetivos', '["Enseñar transiciones y corregir errores"]'
    ),
    TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 11) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Preparación competitiva: 3 fases macro',
    'Off-season (4-12+ meses), Pre-contest (12-20 sem, 0.5-1%/sem), Peak week (7 días manipulación fluidos/glucógeno).',
    'texto', jsonb_build_object(
      'contenido', 'Fases macro de una preparación:
1. Off-season (4-12+ meses): superávit moderado, ganar masa, corregir puntos débiles, salud hormonal.
2. Pre-contest (12-20 sem): déficit 0.5-1%/sem, retención fuerza/masa, cardio progresivo, checkpoints.
3. Peak week (7 días): manipulación glucógeno/agua/sodio, NO perder grasa, ensayo posing, logística.

Transiciones suaves entre fases; no saltar fases.

Tasa pérdida: 0.5-1% peso corporal/semana para maximizar retención muscular.
Hombre natural en escena típico: 5-8% grasa (temporal, no sostenible).',
      'objetivos', '["Planificar preparación completa"]'
    ),
    TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 11) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 2, 'Peak week: manipulación CHO, agua, sodio',
    'Depletion→Load (CHO), Water loading→cut, Sodium loading→cut. Riesgos: diuréticos, corte agua >3%, sodio 0 días antes.',
    'texto', jsonb_build_object(
      'contenido', 'Peak week clásico:
- Water loading (2-3L→4-6L/d 3-4d) → suprime aldosterona y ADH → riñón en modo excreción
- Sodium loading (3-5g/d → 500-1000mg 24h antes) → suprime aldosterona → riñón excreta Na+ y agua
- Carb depletion → load: agotar glucógeno → supercompensación
- Corte simultáneo agua + sodio → riñón sigue excretando (inercia hormonal) → pérdida agua extracelular

Riesgos "broscience" con riesgo real:
1. Diuréticos (furosemida, espironolactona) → hipovolemia, hipopotasemia, arritmia, muerte; prohibido WADA
2. Corte agua >3% peso en 24h sin loading → hipovolemia, calambres, plano
3. Eliminar sodio 5-7 días antes → upregulación aldosterona → rebote retención masivo día show
4. Carbo-load excesivo (1000g+) sin test previo → distensión, hinchazón

"Testear todo en off-season / mini-cuts; nada nuevo en peak week"',
      'objetivos', '["Gestionar peak week y riesgos"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 11) AND t.orden = 4;

  -- Autoevaluación Módulo 11
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 11: Posing/Competencia', 'Práctica sin calificar', 'cuestionario', 0, 20, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 11
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Cuál NO es una pose obligatoria masculina clásica?', 'opcion_multiple', 1, 1, 'Back Double Calves'),
  (v_eval_id, 'En peak week se pierde la mayor cantidad de grasa.', 'verdadero_falso', 1, 2, 'Falso. Peak week es manipulación fluidos/glucógeno; grasa se pierde en las 12-20 sem previas.'),
  (v_eval_id, 'Atleta 16 sem, 85kg, 15% grasa. Viable? Peso objetivo, tasa semanal, hitos.', 'respuesta_corta', 2, 3, 'Magra ≈72kg. Objetivo 5-7% → ~76-77kg. Pérdida 8-9kg/16sem = 0.5-0.6kg/sem (OK). Hitos: sem4 -2-3kg, sem8 -4-5kg, sem12 -6-7kg, sem16 -8-9kg + check fuerza.');

END $$;
-- ============================================
-- MÓDULO 12: COMUNICACIÓN, ÉTICA, GESTIÓN PROFESIONAL
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 12, 'Comunicación, ética y gestión profesional del entrenador',
    'Formar entrenadores capaces de trabajar de forma profesional, respetuosa y organizada.',
    '["Comunicar objetivos, retroalimentación y ajustes", "Aplicar ética profesional y límites", "Gestionar servicio: contrato, datos, pagos", "Compromiso con formación continua"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Comunicación con el atleta', 'Objetivos claros, escuchar, instrucciones concretas, explicar ajustes. Sin humillaciones/promesas falsas.', '["Comunicar profesionalmente"]', 60),
  (v_modulo_id, 2, 'Ética y límites profesionales', 'Privacidad, consentimiento fotos, conflictos interés, derivación médica/nutrición/fisio. No diagnosticar.', '["Aplicar ética y límites"]', 60),
  (v_modulo_id, 3, 'Registro y gestión del servicio', 'Contrato, objetivos, planificación, seguimiento, cambios, comunicaciones. Pagos, cancelación, datos personales.', '["Gestionar servicio profesional"]', 60),
  (v_modulo_id, 4, 'Formación continua y código conducta', 'Revisar bibliografía, evaluar fuentes, distinguir evidencia/experiencia/publicidad. Código personal conducta.', '["Compromiso formación continua"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Comunicación efectiva con el atleta',
    'Objetivos claros, escuchar, instrucciones concretas, explicar ajustes. Sin humillaciones/promesas falsas.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador debe establecer objetivos claros, escuchar las dificultades, dar instrucciones concretas y explicar por qué se realizan los ajustes.

La comunicación debe evitar humillaciones, amenazas, comentarios discriminatorios y promesas de resultados garantizados.

Feedback efectivo: método sándwich (Positivo específico → Correctivo específico/accionable → Positivo refuerzo).
Ejemplo: "Buen agarre y tensión inicial en dorsales. En la subida, tu lumbar se redondea al pasar la rodilla; aprieta ombligo a columna, empuja suelo con pies, lleva pecho arriba antes de extender cadera. El camino de barra está limpio; con ese ajuste la próxima será sólida."',
      'objetivos', '["Comunicar profesionalmente"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Ética y límites profesionales',
    'Privacidad, consentimiento fotos, conflictos interés, derivación médica/nutrición/fisio. No diagnosticar/prescribir.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador debe proteger la privacidad del atleta, solicitar autorización para usar fotografías, evitar conflictos de interés y reconocer cuándo una situación excede su preparación profesional.

No debe diagnosticar patologías, modificar medicación ni sustituir el trabajo de médicos, fisioterapeutas o nutricionistas cualificados.

Conflictos de interés: vender/recomendar suplementos con comisión sin declararlo.
Menores de edad: consentimiento padres, médica, supervisión presencial, prioridad salud > resultado.
Sustancias prohibidas: no facilitar, no normalizar, explicar riesgos, no entrenar para competir mientras use, derivar médico.

Código conducta INBA: antidopaje, trato respetuoso, integridad, confidencialidad, límites competencia, derivaciones, conflicto interés.',
      'objetivos', '["Aplicar ética y límites"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Registro y gestión profesional del servicio',
    'Contrato, objetivos, planificación, seguimiento, cambios, comunicaciones. Pagos, cancelación, protección datos.',
    'texto', jsonb_build_object(
      'contenido', 'Un servicio profesional debe documentar:
- Acuerdo con el atleta (contrato/consentimiento informado)
- Objetivos y planificación
- Seguimiento, cambios y comunicaciones relevantes
- Condiciones de pago, cancelación, disponibilidad
- Protección de datos personales (fotos, historial, comunicaciones)

Consentimiento informado debe incluir: descripción programa, riesgos, beneficios, alternativas, confidencialidad, derecho a retirar consentimiento, datos contacto.',
      'objetivos', '["Gestionar servicio profesional"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Formación continua y código de conducta personal',
    'Revisar bibliografía, evaluar fuentes, distinguir evidencia/experiencia/publicidad. Código personal conducta + protocolo derivación.',
    'texto', jsonb_build_object(
      'contenido', 'La ciencia del entrenamiento evoluciona. El entrenador debe revisar bibliografía, evaluar la calidad de las fuentes y distinguir entre evidencia, experiencia personal y publicidad.

Código personal de conducta (ejemplo):
1. Priorizar salud y seguridad del atleta sobre resultados.
2. No recomendar sustancias prohibidas ni métodos no verificados.
3. Respetar privacidad y confidencialidad absoluta.
4. Derivar a profesionales cualificados cuando exceda mi competencia.
5. Comunicar con honestidad: no prometer resultados garantizados.
6. Actualizar conocimientos mínimo 20h/año (cursos, papers, congresos).
7. Transparencia en conflictos de interés (comisiones, patrocinios).
8. Trato respetuoso e inclusivo: cero tolerancia a discriminación/acoso.

Protocolo derivación: identificar flag → expresar preocupación empática → derivar a profesional cualificado → documentar → seguir caso si procede.

Actividad: resolver caso - atleta pide estrategia extrema perder peso rápido. Respuesta: "Me preocupa tu salud. Esa estrategia implica riesgos (LEA, TCA, rebote). Propongo: diet break 1 sem, subir calorías 300kcal, mantener proteína, reducir cardio. Derivar a nutricionista TCA si persiste. Salud > resultado."',
      'objetivos', '["Compromiso formación continua"]'
    ),
    TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 4;

  -- Práctica supervisada (Módulo 12 incluye práctica)
  INSERT INTO practicas_sesiones (curso_id, modulo_id, titulo, descripcion, fecha_inicio, fecha_fin, sede, direccion, docente_id, cupo_maximo, estado)
  SELECT c.id, m.id, 'Práctica integradora: Análisis de casos y evaluación técnica',
    'Análisis de casos reales (estancamiento, dolor, adherencia). Evaluación técnica: sentadilla, PMR, press, jalón, curl. Feedback con rúbrica.',
    CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days' + INTERVAL '4 hours',
    'Sede INBA Quito', 'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
    (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1),
    20, 'programada'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 12;

  -- Autoevaluación Módulo 12
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 12: Ética/Gestión', 'Práctica sin calificar', 'cuestionario', 0, 20, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 12
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué 5 componentes debe tener un consentimiento informado?', 'respuesta_corta', 2, 1, '1) Descripción programa/riesgos 2) Beneficios 3) Alternativas 4) Confidencialidad/datos 5) Derecho a retirar consentimiento + datos contacto'),
  (v_eval_id, 'El entrenador puede diagnosticar una rotura de menisco basándose en palpación.', 'verdadero_falso', 1, 2, 'Falso. Fuera de scope; derivar médico/fisio para diagnóstico por imagen.'),
  (v_eval_id, 'Cliente 17 años quiere competir. Padres firman consentimiento. 4 salvaguardas adicionales.', 'respuesta_corta', 2, 3, '1) Médica previa obligatoria 2) Supervisión presencial TODAS sesiones 3) Programa conservador: volumen moderado, RIR 2-3, sin fallo, sin peak week agresivo 4) Comunicación trimestral con padres + revisión médica semestral + nutricionista pediátrico.');

END $$;
-- ============================================
-- CONFIGURACIÓN DE CERTIFICADOS Y TIPOS AFILIACIÓN
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- Configuración certificado para el curso principal
  INSERT INTO certificado_config (curso_id, requiere_todos_modulos, requiere_examen_final, requiere_practicas, nota_minima_modulos, nota_minima_final, plantilla_pdf)
  VALUES (v_curso_id, TRUE, TRUE, TRUE, 70, 70, 'certificado-plantilla-inba.html')
  ON CONFLICT (curso_id) DO UPDATE SET
    requiere_todos_modulos = EXCLUDED.requiere_todos_modulos,
    requiere_examen_final = EXCLUDED.requiere_examen_final,
    requiere_practicas = EXCLUDED.requiere_practicas,
    nota_minima_modulos = EXCLUDED.nota_minima_modulos,
    nota_minima_final = EXCLUDED.nota_minima_final,
    plantilla_pdf = EXCLUDED.plantilla_pdf,
    updated_at = NOW();

  -- Tipos de afiliación configurables
  INSERT INTO afiliacion_tipos (nombre, descripcion, requisitos_json, duracion_meses, costo_referencial, activo) VALUES
  ('Estudiante', 'Para estudiantes activos de la certificación', '{"requisitos": ["Estar matriculado en certificación activa", "Presentar certificado de estudios"]}', 12, 0, TRUE),
  ('Entrenador Certificado', 'Para entrenadores que completaron la certificación INBA', '{"requisitos": ["Certificado INBA vigente", "Comprobante de certificación"]}', 12, 50.00, TRUE),
  ('Atleta Competidor', 'Para atletas que compiten en eventos INBA', '{"requisitos": ["Inscripción en evento INBA vigente", "Certificado médico apto"]}', 12, 30.00, TRUE),
  ('Afiliado Institucional', 'Gimnasios, box, centros de entrenamiento', '{"requisitos": ["RUC/Registro negocio", "Responsable técnico certificado"]}', 12, 200.00, TRUE),
  ('Honorífico', 'Reconocimiento a trayectoria en culturismo natural', '{"requisitos": ["Trayectoria comprobada >10 años", "Aval de 2 miembros activos"]}', 12, 0, TRUE)
  ON CONFLICT DO NOTHING;

END $$;
-- CMS CONTENT: PÁGINAS INSTITUCIONALES (Parte 1)
-- NOTA: Este archivo es muy grande, se divide en partes

-- Home
INSERT INTO paginas_contenido (slug, titulo, contenido_json, seo_json, estado, version, created_by, published_at)
VALUES
('inicio', 'Inicio', jsonb_build_object(
  'hero', jsonb_build_object(
    'titulo', 'Federación Ecuatoriana de Culturismo Natural',
    'subtitulo', 'Formamos entrenadores con base científica, promovemos el juego limpio y organizamos competencias de alto nivel.',
    'cta_principal', jsonb_build_object('texto', 'Explorar Certificación', 'href', '/formacion/certificacion'),
    'cta_secundario', jsonb_build_object('texto', 'Próximas Competencias', 'href', '/competencias')
  ),
  'stats', jsonb_build_array(
    jsonb_build_object('valor', '15+', 'etiqueta', 'Años de experiencia'),
    jsonb_build_object('valor', '500+', 'etiqueta', 'Atletas certificados'),
    jsonb_build_object('valor', '12', 'etiqueta', 'Competencias anuales'),
    jsonb_build_object('valor', '50+', 'etiqueta', 'Entrenadores formados')
  )
), jsonb_build_object(
  'title', 'INBA Ecuador - Federación de Culturismo Natural',
  'description', 'Federación Ecuatoriana de Culturismo Natural - Formación de entrenadores, competencias, afiliaciones y certificaciones oficiales.'
), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW())
ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  contenido_json = EXCLUDED.contenido_json,
  seo_json = EXCLUDED.seo_json,
  estado = EXCLUDED.estado,
  version = paginas_contenido.version + 1,
  updated_at = NOW();
-- CMS CONTENT: PÁGINAS INSTITUCIONALES (Parte 2)

INSERT INTO paginas_contenido (slug, titulo, contenido_json, seo_json, estado, version, created_by, published_at)
VALUES
('asociacion/historia', 'Historia de INBA Ecuador', jsonb_build_object(
  'secciones', jsonb_build_array(
    jsonb_build_object('titulo', 'Nuestros Inicios', 'contenido', 'INBA Ecuador nace como respuesta a la necesidad de una federación que promueva el culturismo natural con rigor científico y ética profesional en Ecuador.'),
    jsonb_build_object('titulo', 'Hitos Importantes', 'contenido', 'Primer campeonato nacional 2010. Primera certificación de entrenadores 2012. Afiliación internacional 2015.')
  )
), jsonb_build_object('title', 'Historia - INBA Ecuador', 'description', 'Historia de la Federación Ecuatoriana de Culturismo Natural'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/mision-vision', 'Misión y Visión', jsonb_build_object(
  'mision', 'Promover, regular y desarrollar el culturismo natural en Ecuador mediante la formación científica de entrenadores, la organización de competencias transparentes y la defensa del juego limpio.',
  'vision', 'Ser la federación de referencia en Latinoamérica por la excelencia en formación, la integridad competitiva y la promoción de la salud a través del culturismo natural.',
  'valores', jsonb_build_array(
    jsonb_build_object('nombre', 'Integridad', 'descripcion', 'Cero tolerancia al dopaje y la corrupción.'),
    jsonb_build_object('nombre', 'Ciencia', 'descripcion', 'Decisiones basadas en evidencia, no en modas.'),
    jsonb_build_object('nombre', 'Ética', 'descripcion', 'Respeto a la dignidad del atleta y transparencia total.'),
    jsonb_build_object('nombre', 'Excelencia', 'descripcion', 'Búsqueda continua de la mejora en formación y competencias.')
  )
), jsonb_build_object('title', 'Misión y Visión - INBA Ecuador', 'description', 'Misión, visión y valores de INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/equipo', 'Equipo Directivo', jsonb_build_object(
  'miembros', jsonb_build_array(
    jsonb_build_object('nombre', 'Dr. Juan Pérez', 'cargo', 'Presidente', 'bio', 'Médico deportivo con 20 años de experiencia.', 'foto_url', '/images/equipo/juan-perez.jpg'),
    jsonb_build_object('nombre', 'Lic. María González', 'cargo', 'Vicepresidenta Académica', 'bio', 'Licenciada en Ciencias del Deporte, MSc en Fisiología del Ejercicio.', 'foto_url', '/images/equipo/maria-gonzalez.jpg'),
    jsonb_build_object('nombre', 'Ing. Carlos Rodríguez', 'cargo', 'Director Técnico', 'bio', 'Entrenador certificado INBA, 15 años experiencia.', 'foto_url', '/images/equipo/carlos-rodriguez.jpg'),
    jsonb_build_object('nombre', 'Dra. Ana Martínez', 'cargo', 'Directora Médica', 'bio', 'Médica deportiva, especialista en antidopaje.', 'foto_url', '/images/equipo/ana-martinez.jpg')
  )
), jsonb_build_object('title', 'Equipo Directivo - INBA Ecuador', 'description', 'Conoce al equipo directivo de INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/reglamentos', 'Reglamentos y Documentos', jsonb_build_object(
  'documentos', jsonb_build_array(
    jsonb_build_object('titulo', 'Estatutos INBA Ecuador', 'descripcion', 'Estatutos oficiales de la federación.', 'archivo_url', '/documentos/estatutos-inba.pdf', 'categoria', 'estatutos'),
    jsonb_build_object('titulo', 'Reglamento Competencias', 'descripcion', 'Reglas oficiales para competencias INBA Ecuador.', 'archivo_url', '/documentos/reglamento-competencias.pdf', 'categoria', 'competencias'),
    jsonb_build_object('titulo', 'Reglamento Afiliación', 'descripcion', 'Normas para afiliación de entrenadores, atletas e instituciones.', 'archivo_url', '/documentos/reglamento-afiliacion.pdf', 'categoria', 'afiliacion'),
    jsonb_build_object('titulo', 'Código Ética', 'descripcion', 'Código de conducta para entrenadores, atletas y jueces.', 'archivo_url', '/documentos/codigo-etica.pdf', 'categoria', 'etica'),
    jsonb_build_object('titulo', 'Reglamento Antidopaje', 'descripcion', 'Adaptación código WADA para INBA Ecuador.', 'archivo_url', '/documentos/reglamento-antidopaje.pdf', 'categoria', 'antidopaje')
  )
), jsonb_build_object('title', 'Reglamentos - INBA Ecuador', 'description', 'Reglamentos y documentos oficiales de INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/politicas', 'Políticas Culturismo Natural', jsonb_build_object(
  'politicas', jsonb_build_array(
    jsonb_build_object('titulo', 'Política Antidopaje', 'contenido', 'Cumplimiento estricto del Código Mundial Antidopaje (WADA). Controles en y fuera de competición. Sanciones según código INBA/WADA.'),
    jsonb_build_object('titulo', 'Política Protección Menores', 'contenido', 'Supervisión obligatoria en entrenamientos. Consentimiento padres/tutores. Evaluación médica previa obligatoria. Programa conservador sin peak week agresivo.'),
    jsonb_build_object('titulo', 'Política Igualdad e Inclusión', 'contenido', 'Cero tolerancia a discriminación por género, orientación, etnia, discapacidad. Categorías inclusivas según reglamento.'),
    jsonb_build_object('titulo', 'Política Protección Datos', 'contenido', 'Cumplimiento LOPD Ecuador. Consentimiento para fotos/datos. Derecho a rectificación/olvido. Seguridad técnica y organizativa.'),
    jsonb_build_object('titulo', 'Política Conflictos Interés', 'contenido', 'Declaración obligatoria comisiones/patrocinios. Prohibido recomendar productos con comisión no declarada. Transparencia en patrocinios.')
  )
), jsonb_build_object('title', 'Políticas - INBA Ecuador', 'description', 'Políticas oficiales de culturismo natural en INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW())
ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  contenido_json = EXCLUDED.contenido_json,
  seo_json = EXCLUDED.seo_json,
  estado = EXCLUDED.estado,
  version = paginas_contenido.version + 1,
  updated_at = NOW();
-- CMS CONTENT: PÁGINAS INSTITUCIONALES (Parte 3)

INSERT INTO paginas_contenido (slug, titulo, contenido_json, seo_json, estado, version, created_by, published_at)
VALUES
('competencias/calendario', 'Calendario de Competencias', jsonb_build_object(
  'eventos_proximos', jsonb_build_array(
    jsonb_build_object('nombre', 'Campeonato Nacional INBA 2026', 'fecha_inicio', '2026-11-15', 'fecha_fin', '2026-11-16', 'sede', 'Quito', 'estado', 'inscripciones_abiertas', 'categoria', 'nacional'),
    jsonb_build_object('nombre', 'Copa Andes Natural', 'fecha_inicio', '2026-09-20', 'fecha_fin', '2026-09-20', 'sede', 'Guayaquil', 'estado', 'proximamente', 'categoria', 'regional'),
    jsonb_build_object('nombre', 'Sudamericano Natural 2026', 'fecha_inicio', '2026-12-05', 'fecha_fin', '2026-12-07', 'sede', 'Cuenca', 'estado', 'planificacion', 'categoria', 'internacional')
  )
), jsonb_build_object('title', 'Calendario Competencias - INBA Ecuador', 'description', 'Calendario oficial de competencias INBA Ecuador 2026'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('formacion/programas', 'Programas de Formación', jsonb_build_object(
  'programas', jsonb_build_array(
    jsonb_build_object('titulo', 'Certificación Entrenadores Culturismo Natural', 'descripcion', 'Programa insignia 72h, 12 módulos, modalidad híbrida, prácticas supervisadas, certificación oficial.', 'duracion', '6 meses', 'modalidad', 'Híbrida', 'href', '/formacion/certificacion'),
    jsonb_build_object('titulo', 'Especialización Nutrición Deportiva', 'descripcion', 'Complemento avanzado para entrenadores certificados. Evidencia nutricional, planificación, suplementación.', 'duracion', '3 meses', 'modalidad', 'Virtual', 'href', '/formacion/nutricion-avanzada'),
    jsonb_build_object('titulo', 'Curso Jueces INBA', 'descripcion', 'Formación para jueces de competencias. Criterios, poses, reglamento, ética judicial.', 'duracion', '1 mes', 'modalidad', 'Presencial', 'href', '/formacion/jueces')
  )
), jsonb_build_object('title', 'Programas Formación - INBA Ecuador', 'description', 'Programas de formación profesional INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('afiliacion/tipos', 'Tipos de Afiliación', jsonb_build_object(
  'tipos', jsonb_build_array(
    jsonb_build_object('nombre', 'Estudiante', 'descripcion', 'Para estudiantes activos de la certificación', 'duracion_meses', 12, 'costo', 0, 'beneficios', jsonb_build_array('Acceso a materiales académicos', 'Descuento en eventos', 'Red de contactos')),
    jsonb_build_object('nombre', 'Entrenador Certificado', 'descripcion', 'Para entrenadores con certificación INBA vigente', 'duracion_meses', 12, 'costo', 50.00, 'beneficios', jsonb_build_array('Directorio público entrenadores', 'Acceso a eventos exclusivos', 'Actualizaciones científicas', 'Descuento recertificación')),
    jsonb_build_object('nombre', 'Atleta Competidor', 'descripcion', 'Para atletas en eventos INBA', 'duracion_meses', 12, 'costo', 30.00, 'beneficios', jsonb_build_array('Inscripción prioritaria eventos', 'Seguro deportivo básico', 'Asesoría técnica')),
    jsonb_build_object('nombre', 'Afiliado Institucional', 'descripcion', 'Gimnasios, box, centros de entrenamiento', 'duracion_meses', 12, 'costo', 200.00, 'beneficios', jsonb_build_array('Directorio público gimnasios', 'Material promocional INBA', 'Capacitación staff incluido', 'Visibilidad web INBA'))
  )
), jsonb_build_object('title', 'Tipos Afiliación - INBA Ecuador', 'description', 'Tipos de afiliación disponibles en INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('contacto', 'Contacto', jsonb_build_object(
  'info_contacto', jsonb_build_object(
    'direccion', 'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
    'ciudad', 'Quito, Ecuador',
    'telefono', '+593 2 123 4567',
    'email', 'info@inbaecuador.org',
    'horario', 'Lunes a Viernes 08:00 - 17:00'
  ),
  'redes_sociales', jsonb_build_array(
    jsonb_build_object('nombre', 'Facebook', 'url', 'https://facebook.com/inbaecuador', 'icono', 'facebook'),
    jsonb_build_object('nombre', 'Instagram', 'url', 'https://instagram.com/inbaecuador', 'icono', 'instagram'),
    jsonb_build_object('nombre', 'YouTube', 'url', 'https://youtube.com/@inbaecuador', 'icono', 'youtube'),
    jsonb_build_object('nombre', 'Twitter', 'url', 'https://twitter.com/inbaecuador', 'icono', 'twitter')
  )
), jsonb_build_object('title', 'Contacto - INBA Ecuador', 'description', 'Contacta con INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW())
ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  contenido_json = EXCLUDED.contenido_json,
  seo_json = EXCLUDED.seo_json,
  estado = EXCLUDED.estado,
  version = paginas_contenido.version + 1,
  updated_at = NOW();

-- ============================================
-- 002 — POLITICAS RLS FALTANTES
-- ============================================
-- Contexto: 001_schema.sql habilita RLS en 33 tablas pero solo define
-- politicas para 14. En PostgreSQL, una tabla con RLS activo y sin
-- politicas devuelve CERO filas a cualquier rol no propietario.
-- Consecuencia real: un estudiante autenticado no podia leer
-- modulos, temas, lecciones, preguntas, progreso ni practicas.
--
-- Este archivo agrega las politicas faltantes con privilegio minimo:
--   * contenido academico  -> lectura para authenticated, gestion para staff
--   * datos personales     -> cada usuario ve solo lo suyo
--   * administracion       -> admin_general / admin_academico
--
-- Es idempotente: usa DROP POLICY IF EXISTS antes de cada CREATE.

-- Helper: evita repetir la subconsulta de roles en 20 politicas.
-- SECURITY DEFINER para no disparar RLS de user_roles dentro de una politica.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin_general', 'admin_academico')
  )
$$;

CREATE OR REPLACE FUNCTION is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name IN ('admin_general', 'admin_academico', 'docente')
  )
$$;

-- ============================================
-- CONTENIDO ACADEMICO: lectura authenticated, gestion staff
-- ============================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'modulos', 'temas', 'lecciones', 'recursos',
    'preguntas', 'opciones_respuesta', 'rubricas',
    'certificado_config', 'afiliacion_tipos', 'documentos_institucionales'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Auth read ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT TO authenticated USING (true)',
      'Auth read ' || t, t
    );
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', 'Staff manage ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff())',
      'Staff manage ' || t, t
    );
  END LOOP;
END $$;

-- Eventos: publicados visibles para authenticated, staff ve y gestiona todo
DROP POLICY IF EXISTS "Auth read eventos" ON eventos;
CREATE POLICY "Auth read eventos" ON eventos
  FOR SELECT TO authenticated USING (estado = 'publicado' OR is_staff());
DROP POLICY IF EXISTS "Staff manage eventos" ON eventos;
CREATE POLICY "Staff manage eventos" ON eventos
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Auth read evento_resultados" ON evento_resultados;
CREATE POLICY "Auth read evento_resultados" ON evento_resultados
  FOR SELECT TO authenticated USING (publicado = TRUE OR is_staff());
DROP POLICY IF EXISTS "Staff manage evento_resultados" ON evento_resultados;
CREATE POLICY "Staff manage evento_resultados" ON evento_resultados
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- ============================================
-- PROGRESO: el estudiante solo ve y escribe su propio avance
-- ============================================
DROP POLICY IF EXISTS "Students read own progress" ON progreso_lecciones;
CREATE POLICY "Students read own progress" ON progreso_lecciones
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = progreso_lecciones.matricula_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Students insert own progress" ON progreso_lecciones;
CREATE POLICY "Students insert own progress" ON progreso_lecciones
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = progreso_lecciones.matricula_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Students update own progress" ON progreso_lecciones;
CREATE POLICY "Students update own progress" ON progreso_lecciones
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = progreso_lecciones.matricula_id AND m.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = progreso_lecciones.matricula_id AND m.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Staff manage progress" ON progreso_lecciones;
CREATE POLICY "Staff manage progress" ON progreso_lecciones
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- ============================================
-- PRACTICAS PRESENCIALES
-- ============================================
DROP POLICY IF EXISTS "Auth read practicas_sesiones" ON practicas_sesiones;
CREATE POLICY "Auth read practicas_sesiones" ON practicas_sesiones
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Staff manage practicas_sesiones" ON practicas_sesiones;
CREATE POLICY "Staff manage practicas_sesiones" ON practicas_sesiones
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Students read own practice enrollment" ON practicas_inscripciones;
CREATE POLICY "Students read own practice enrollment" ON practicas_inscripciones
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = practicas_inscripciones.matricula_id AND m.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Students enroll in practice" ON practicas_inscripciones;
CREATE POLICY "Students enroll in practice" ON practicas_inscripciones
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = practicas_inscripciones.matricula_id AND m.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Staff manage practicas_inscripciones" ON practicas_inscripciones;
CREATE POLICY "Staff manage practicas_inscripciones" ON practicas_inscripciones
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Students read own attendance" ON asistencias;
CREATE POLICY "Students read own attendance" ON asistencias
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = asistencias.matricula_id AND m.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Staff manage asistencias" ON asistencias;
CREATE POLICY "Staff manage asistencias" ON asistencias
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Students read own practice grades" ON calificaciones_practica;
CREATE POLICY "Students read own practice grades" ON calificaciones_practica
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM matriculas m
    WHERE m.id = calificaciones_practica.matricula_id AND m.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Staff manage calificaciones_practica" ON calificaciones_practica;
CREATE POLICY "Staff manage calificaciones_practica" ON calificaciones_practica
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

-- ============================================
-- AFILIACIONES (solicitudes) Y EVENTOS (inscripciones)
-- ============================================
DROP POLICY IF EXISTS "Users read own affiliation requests" ON afiliacion_solicitudes;
CREATE POLICY "Users read own affiliation requests" ON afiliacion_solicitudes
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users create own affiliation request" ON afiliacion_solicitudes;
CREATE POLICY "Users create own affiliation request" ON afiliacion_solicitudes
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage affiliation requests" ON afiliacion_solicitudes;
CREATE POLICY "Admins manage affiliation requests" ON afiliacion_solicitudes
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Users read own event registrations" ON evento_inscripciones;
CREATE POLICY "Users read own event registrations" ON evento_inscripciones
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Users create own event registration" ON evento_inscripciones;
CREATE POLICY "Users create own event registration" ON evento_inscripciones
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage event registrations" ON evento_inscripciones;
CREATE POLICY "Admins manage event registrations" ON evento_inscripciones
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- ============================================
-- 003 — ALTA AUTOMATICA DE PERFIL Y ROL
-- ============================================
-- Problema: src/app/register/page.tsx solo llama a auth.signUp(). No existia
-- ningun trigger que creara la fila en public.profiles ni que asignara el rol
-- por defecto, asi que todo usuario nuevo quedaba sin perfil y sin rol
-- (useAuth hacia .from('profiles').single() y recibia null).
--
-- Solucion: trigger AFTER INSERT en auth.users, SECURITY DEFINER para poder
-- escribir en profiles/user_roles aunque el usuario aun no tenga sesion.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, dni)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'dni', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Rol por defecto: estudiante. Los ascensos los hace un administrador.
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, r.id
  FROM public.roles r
  WHERE r.name = 'estudiante'
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Respaldo: si el trigger no existe en algun entorno, el propio usuario puede
-- crear su perfil inmediatamente despues del registro.
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
