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
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Técnica: Sentadilla',
    'Apoyo pies, trayectoria, control tronco, rodillas, profundidad según proporciones.',
    'texto', jsonb_build_object(
      'contenido', 'Sentadilla: evaluar apoyo de los pies, trayectoria, control del tronco, movimiento de rodillas y profundidad tolerada. La técnica exacta depende de las proporciones corporales y del objetivo.',
      'objetivos', '["Enseñar técnica de sentadilla"]'
    ),
    'texto', TRUE, 30
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 2, 'Técnica: Peso muerto rumano',
    'Bisagra de cadera, barra cerca del cuerpo, control descenso, amplitud según control.',
    'texto', jsonb_build_object(
      'contenido', 'Peso muerto rumano: enseñar la bisagra de cadera, mantener la carga próxima al cuerpo y controlar el descenso. La amplitud debe permitir conservar el control y no debe forzarse a costa de la posición.',
      'objetivos', '["Enseñar técnica de PMR"]'
    ),
    'texto', TRUE, 30
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 3, 'Técnica: Press de banca',
    'Apoyo pies, estabilidad, agarre, trayectoria barra, control descenso, ancho agarre.',
    'texto', jsonb_build_object(
      'contenido', 'Press de banca: revisar apoyo de pies, estabilidad, agarre, trayectoria de la barra y control del descenso. El ancho del agarre y la posición del brazo deben adaptarse al atleta.',
      'objetivos', '["Enseñar técnica de press banca"]'
    ),
    'texto', TRUE, 30
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 4) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 4, 'Técnica: Remo y Jalón',
    'Remo: evitar impulso tronco, trayectoria codo. Jalón: controlar tronco, evitar tirones, movimiento escapular.',
    'texto', jsonb_build_object(
      'contenido', 'Remo: evitar que el movimiento se convierta involuntariamente en un impulso excesivo del tronco. La trayectoria del codo modifica el énfasis relativo sobre diferentes músculos.

Jalón al pecho: controlar el tronco, evitar tirones y permitir el movimiento escapular. No es necesario llevar la barra detrás de la cabeza para obtener un entrenamiento eficaz.',
      'objetivos', '["Enseñar técnica de remo y jalón"]'
    ),
    'texto', TRUE, 30
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
    'texto', TRUE, 60
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