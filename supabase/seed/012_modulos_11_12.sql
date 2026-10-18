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
    'texto', TRUE, 60
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
    'texto', TRUE, 90
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
    'texto', TRUE, 45
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
    'texto', TRUE, 90
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
    'texto', TRUE, 60
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