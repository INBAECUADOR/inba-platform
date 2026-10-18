-- ============================================
-- CURSO PRINCIPAL: CERTIFICACIÓN ENTRENADORES INBA ECUADOR
-- ============================================

INSERT INTO cursos (codigo, nombre, descripcion, objetivos, requisitos, duracion_horas, modalidad, estado, version, created_by, published_at)
VALUES (
  'CERT-ENT-2026',
  'Certificación de Entrenadores de Culturismo Natural INBA Ecuador',
  'Programa integral de formación para entrenadores de culturismo natural basado en evidencia científica. 12 módulos que cubren anatomía, biomecánica, fisiología, programación, nutrición, evaluación, ética y prácticas supervisadas.',
  '["Comprender los fundamentos científicos del culturismo natural", "Dominar anatomía funcional, biomecánica y fisiología aplicada al entrenamiento", "Diseñar programas de hipertrofia y fuerza basados en evidencia", "Evaluar atletas y diseñar planes individualizados", "Aplicar principios nutricionales dentro del alcance profesional", "Promover la ética deportiva y el cumplimiento antidopaje", "Desarrollar competencias de comunicación, ética y gestión profesional"]',
  '["Ser mayor de 18 años", "Tener conocimientos básicos de entrenamiento (recomendado)", "Compromiso con el culturismo natural y el juego limpio", "Disponibilidad para clases híbridas y prácticas presenciales"]',
  72,
  'hibrido',
  'publicado',
  1,
  (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1),
  NOW()
) ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  objetivos = EXCLUDED.objetivos,
  requisitos = EXCLUDED.requisitos,
  duracion_horas = EXCLUDED.duracion_horas,
  modalidad = EXCLUDED.modalidad,
  estado = EXCLUDED.estado,
  version = EXCLUDED.version,
  updated_at = NOW();

-- Obtener ID del curso para usar en módulos
DO $$
DECLARE
  v_curso_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 1: INDUCCIÓN Y FUNDAMENTOS DEL CULTURISMO NATURAL
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 1, 'Inducción y fundamentos del culturismo natural',
    'Comprender qué es el culturismo natural, cuáles son sus principios y qué responsabilidades asume un entrenador.',
    '["Definir culturismo natural y diferenciarlo de otras preparaciones", "Explicar los principios básicos del entrenamiento", "Identificar el rol y límites del entrenador"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  -- Temas Módulo 1
  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, '¿Qué es el culturismo natural?',
    'Definición, criterios de juicio y diferencia con preparación estética.',
    '["Definir culturismo natural", "Explicar criterios de juicio", "Diferenciar natural vs asistido"]', 90),
  (v_modulo_id, 2, 'Principios del entrenamiento',
    'Sobrecarga progresiva, especificidad, individualización, consistencia, recuperación, adherencia.',
    '["Explicar cada principio", "Aplicar a casos prácticos"]', 90),
  (v_modulo_id, 3, 'El papel del entrenador',
    'Evaluar, planificar, enseñar, adaptar. Límites: no diagnosticar, no prescribir medicamentos.',
    '["Definir rol del entrenador", "Identificar límites profesionales"]', 60);

  -- Lecciones Módulo 1
  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, '¿Qué es el culturismo natural?',
    'Definición, criterios de juicio (muscularidad, proporción, simetría, definición), diferencia con preparación estética. La condición natural se define por reglas y controles, no por apariencia.',
    'texto', jsonb_build_object(
      'contenido', 'El culturismo es una disciplina deportiva que busca desarrollar la musculatura y presentar el físico mediante criterios como muscularidad, proporción, simetría, condición física y presentación escénica, según la categoría y el reglamento de cada competición.

El culturismo natural comparte estos objetivos, pero incorpora el compromiso con el deporte libre de sustancias prohibidas. La condición de atleta natural no se determina únicamente por su apariencia física: depende de los criterios de elegibilidad, controles y normas de la organización deportiva correspondiente.',
      'objetivos', '["Definir culturismo natural", "Identificar criterios de juicio", "Diferenciar natural vs asistido"]'
    ),
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = v_modulo_id AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Principios del entrenamiento',
    'Sobrecarga progresiva, especificidad, individualización, consistencia, recuperación, adherencia.',
    'texto', jsonb_build_object(
      'contenido', 'Principios fundamentales del entrenamiento:

1. **Sobrecarga progresiva**: aumentar gradualmente el estímulo mediante más repeticiones, carga, mejor ejecución o mayor trabajo tolerable.

2. **Especificidad**: el entrenamiento debe corresponder al objetivo. Desarrollar fuerza, ganar masa muscular y preparar una presentación escénica son objetivos relacionados, pero diferentes.

3. **Individualización**: la respuesta depende de experiencia, edad, técnica, recuperación, disponibilidad y características personales.

4. **Consistencia**: los resultados se construyen mediante meses de trabajo, no con sesiones aisladas.

5. **Recuperación**: el entrenamiento genera un estímulo; la adaptación requiere tiempo, alimentación y descanso.

6. **Adherencia**: un programa eficaz debe ser viable y sostenible para la persona.',
      'objetivos', '["Explicar cada principio", "Aplicar a casos prácticos"]'
    ),
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = v_modulo_id AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'El papel del entrenador',
    'Evaluar, planificar, enseñar técnica, registrar resultados, adaptar. Límites: no diagnosticar, no prescribir medicamentos.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador evalúa, planifica, enseña técnica, registra resultados y adapta el proceso. No debe diagnosticar enfermedades, prescribir medicamentos ni sustituir a profesionales sanitarios.

Debe comunicar con claridad, respetar la privacidad del atleta, evitar promesas irreales y documentar sus decisiones.

**Actividad**: el estudiante explica con sus propias palabras qué diferencia al culturismo natural de una preparación enfocada exclusivamente en la apariencia.',
      'objetivos', '["Definir rol del entrenador", "Identificar límites profesionales"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = v_modulo_id AND t.orden = 3;

  -- Recursos Módulo 1
  INSERT INTO recursos (leccion_id, tipo, titulo, url, orden, es_descargable)
  SELECT l.id, 'pdf', 'Criterios de juicio INBA', '/recursos/criterios-juicio-inba.pdf', 1, TRUE
  FROM lecciones l JOIN temas t ON l.tema_id = t.id WHERE t.modulo_id = v_modulo_id AND l.orden = 1 LIMIT 1;

  INSERT INTO recursos (leccion_id, tipo, titulo, url, orden, es_descargable)
  SELECT l.id, 'pdf', 'Tabla principios vs mitos', '/recursos/principios-vs-mitos.pdf', 2, TRUE
  FROM lecciones l JOIN temas t ON l.tema_id = t.id WHERE t.modulo_id = v_modulo_id AND l.orden = 1 LIMIT 1;

  -- Autoevaluación Módulo 1
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  VALUES (v_curso_id, v_modulo_id, 'Autoevaluación Módulo 1: Fundamentos', 'Práctica sin calificar para repasar conceptos clave', 'cuestionario', 0, 20, 3, 'publicado')
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué significa sobrecarga progresiva?', 'respuesta_corta', 2, 1, 'Aumentar gradualmente el estímulo mediante más repeticiones, carga, mejor ejecución o mayor trabajo tolerable.'),
  (v_eval_id, '¿Por qué no todos los atletas deben seguir la misma rutina?', 'respuesta_corta', 2, 2, 'La planificación debe adaptarse al individuo: experiencia, edad, técnica, recuperación, disponibilidad.'),
  (v_eval_id, 'La apariencia física demuestra que una persona compite sin sustancias prohibidas. ¿Verdadero o Falso?', 'verdadero_falso', 1, 3, 'Falso. La apariencia no acredita el cumplimiento antidopaje; la condición natural se define por reglas y controles.');

END $$;