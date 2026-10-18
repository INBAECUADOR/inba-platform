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
  (v_modulo_id, 2, 'Proximidad al fallo (RIR)', 'Refalo 2023: RIR 1-3 = RIR 0. No obligatorio fallo. Menos fatiga sistémica.', '["Usar RIR para controlar esfuerzo"]', 60),
  (v_modulo_id, 3, 'Descanso y frecuencia', 'Descanso según ejercicio. Frecuencia 2x/sem mín. Distribución volumen.', '["Programar descanso y frecuencia"]', 60),
  (v_modulo_id, 4, 'Progresión y periodización', 'Progresión: carga/reps/RIR. Lineal, ondulada, bloques. Ajuste 1 variable.', '["Diseñar progresión y periodización"]', 90);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Carga y repeticiones: evidencia',
    '5-30 reps efectivas si RIR adecuado. Cargas altas (1-5) para fuerza. Rango híbrido 6-12 clásico.',
    'texto', jsonb_build_object(
      'contenido', 'La carga externa no determina por sí sola el estímulo. Se puede producir hipertrofia con distintas cargas si el esfuerzo, el volumen y la ejecución son adecuados. Las cargas altas suelen ser especialmente útiles para desarrollar fuerza máxima específica.

El rango de repeticiones debe elegirse según el objetivo, el ejercicio, la experiencia y la tolerancia del atleta. Rangos de 5-30 repeticiones pueden ser efectivos si el esfuerzo es suficiente.',
      'objetivos', '["Seleccionar rango reps según objetivo"]'
    ),
    'texto', TRUE, 60
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
    'texto', TRUE, 60
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
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 2;

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
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 3;

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
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 5) AND t.orden = 4;

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