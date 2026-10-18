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
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, curso_id) WHERE estado IN ('pendiente', 'activa')
);

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
  docente_id UUID NOT NULL REFERENCES profiles(id),
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (matricula_id) WHERE estado = 'vigente'
);

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
)

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

-- User roles: solo admins gestionan
CREATE POLICY "Admins manage user_roles" ON user_roles
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'admin_general'
  ));

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

-- Certificados: público verifica por UUID, usuario ve los suyos, admins gestionan
CREATE POLICY "Public verify certificates" ON certificados
  FOR SELECT USING (
    uuid_publico IS NOT NULL
  );

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
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, accion, entidad, entidad_id, datos_nuevos_json, ip, user_agent)
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW), inet_client_addr(), current_setting('request.headers')::json->>'user-agent');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, accion, entidad, entidad_id, datos_anteriores_json, datos_nuevos_json, ip, user_agent)
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW), inet_client_addr(), current_setting('request.headers')::json->>'user-agent');
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, accion, entidad, entidad_id, datos_anteriores_json, ip, user_agent)
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD), inet_client_addr(), current_setting('request.headers')::json->>'user-agent');
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