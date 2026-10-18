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
    'texto', TRUE, 90
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
    'texto', TRUE, 60
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
    'texto', TRUE, 45
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