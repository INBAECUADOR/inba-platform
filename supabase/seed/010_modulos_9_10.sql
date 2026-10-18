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
    'texto', TRUE, 60
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
    'texto', TRUE, 45
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
    'texto', TRUE, 45
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