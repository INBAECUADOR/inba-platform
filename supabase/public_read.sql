-- ============================================
-- LECTURA PUBLICA DEL CATALOGO
-- ============================================
-- Las politicas originales solo permitian a usuarios autenticados leer
-- modulos, temas, lecciones y eventos. El sitio publico (sin sesion) mostraba
-- cero cursos/modulos/eventos. Estas politicas abren SOLO contenido publicado
-- y nunca exponen preguntas, opciones ni datos de estudiantes.

DROP POLICY IF EXISTS "Anon read published modules" ON modulos;
CREATE POLICY "Anon read published modules"
  ON modulos FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM cursos c
      WHERE c.id = modulos.curso_id AND c.estado = 'publicado'
    )
  );

DROP POLICY IF EXISTS "Anon read temas of published courses" ON temas;
CREATE POLICY "Anon read temas of published courses"
  ON temas FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM modulos m
      JOIN cursos c ON c.id = m.curso_id
      WHERE m.id = temas.modulo_id AND c.estado = 'publicado'
    )
  );

DROP POLICY IF EXISTS "Anon read lecciones of published courses" ON lecciones;
CREATE POLICY "Anon read lecciones of published courses"
  ON lecciones FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM temas t
      JOIN modulos m ON m.id = t.modulo_id
      JOIN cursos c ON c.id = m.curso_id
      WHERE t.id = lecciones.tema_id AND c.estado = 'publicado'
    )
  );

DROP POLICY IF EXISTS "Anon read published events" ON eventos;
CREATE POLICY "Anon read published events"
  ON eventos FOR SELECT TO anon
  USING (estado = 'publicado');

DROP POLICY IF EXISTS "Anon read published evaluations" ON evaluaciones;
CREATE POLICY "Anon read published evaluations"
  ON evaluaciones FOR SELECT TO anon
  USING (estado = 'publicado');

DROP POLICY IF EXISTS "Anon read public affiliations types" ON afiliacion_tipos;
CREATE POLICY "Anon read public affiliations types"
  ON afiliacion_tipos FOR SELECT TO anon
  USING (true);
