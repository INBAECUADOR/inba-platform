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
    'texto', TRUE, 90
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
    'texto', TRUE, 90
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
    'texto', TRUE, 90
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
    'texto', TRUE, 60
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