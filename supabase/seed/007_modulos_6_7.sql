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
    'texto', TRUE, 60
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
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 6) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Progresión sin fallo obligatorio',
    'Progresar cuando completa reps con buena técnica y RIR objetivo. Carga, reps, técnica, rango, frecuencia.',
    'texto', jsonb_build_object(
      'contenido', 'Se puede progresar cuando el atleta completa las repeticiones previstas con buena técnica y el esfuerzo deseado. Por ejemplo, si el rango establecido es de 8 a 12 repeticiones, se aumenta gradualmente el peso cuando el atleta alcanza el límite superior de forma consistente.

La progresión no siempre consiste en añadir peso. Puede incluir mejor control, mayor amplitud tolerada o más repeticiones con la misma carga.',
      'objetivos', '["Aplicar progresión sin fallo"]'
    ),
    'texto', TRUE, 60
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
    'texto', TRUE, 60
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