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
