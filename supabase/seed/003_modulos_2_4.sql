-- ============================================
-- MÓDULOS 2-4: ANATOMÍA, FISIOLOGÍA, BIOMECÁNICA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- ============================================
  -- MÓDULO 2: ANATOMÍA APLICADA AL ENTRENAMIENTO
  -- ============================================
  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES ((SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026'), 2, 'Anatomía aplicada al entrenamiento',
    'Identificar las principales estructuras musculoesqueléticas y relacionarlas con los ejercicios de gimnasio.',
    '["Identificar estructuras musculoesqueléticas clave", "Relacionar músculos con ejercicios de gimnasio", "Comprender planos, ejes y movimientos articulares", "Diferenciar agonistas, antagonistas, sinergistas y estabilizadores"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  -- Temas Módulo 2
  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Sistema musculoesquelético', 'Huesos, articulaciones, músculos, tendones, ligamentos y SN', '["Describir componentes del sistema musculoesquelético"]', 60),
  (v_modulo_id, 2, 'Principales grupos musculares', 'Pecho/espalda/hombros, piernas/glúteos, brazos', '["Identificar músculos principales y sus acciones"]', 120),
  (v_modulo_id, 3, 'Planos y ejes anatómicos', 'Sagital, frontal, transversal y sus ejes', '["Identificar planos y ejes", "Relacionar con movimientos"]', 60),
  (v_modulo_id, 4, 'La escápula', 'Movimientos escapulares y su relevancia en hombro', '["Describir movimientos escapulares", "Aplicar a ejercicios"]', 60),
  (v_modulo_id, 5, 'Agonistas, antagonistas y estabilizadores', 'Roles musculares en ejercicios básicos', '["Diferenciar roles musculares", "Aplicar a ejercicios básicos"]', 60);

  -- Lecciones Módulo 2
  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Sistema musculoesquelético',
    'Huesos, articulaciones, músculos, tendones, ligamentos y SN. Función de cada componente.',
    'texto', jsonb_build_object(
      'contenido', 'El sistema musculoesquelético está compuesto por huesos, articulaciones, músculos, tendones y otros tejidos conectivos.

Los huesos proporcionan soporte y puntos de inserción. Las articulaciones permiten movimiento. Los músculos producen fuerza y los tendones transmiten esa fuerza hacia los huesos.

El entrenador debe conocer la anatomía necesaria para seleccionar ejercicios, comprender movimientos y reconocer cuándo una molestia requiere evaluación profesional.',
      'objetivos', '["Describir componentes del sistema musculoesquelético"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Principales grupos musculares - Pecho, espalda, hombros',
    'Pectoral mayor, dorsal ancho, trapecio, romboides, deltoides: acciones y ejercicios.',
    'texto', jsonb_build_object(
      'contenido', 'Pecho, espalda y hombros:
- Pectoral mayor: participa en la aducción horizontal y movimientos de empuje.
- Dorsal ancho: contribuye a la extensión y aducción del hombro.
- Trapecio y romboides: intervienen en los movimientos y el control escapular.
- Deltoides: contribuye a la elevación del brazo en diferentes direcciones.',
      'objetivos', '["Identificar músculos y sus acciones"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 2, 'Principales grupos musculares - Piernas, glúteos, brazos',
    'Cuádriceps, isquiotibiales, glúteo mayor, gastrocnemio, sóleo, bíceps, tríceps, antebrazo.',
    'texto', jsonb_build_object(
      'contenido', 'Piernas y glúteos:
- Cuádriceps: extiende la rodilla.
- Isquiotibiales: flexionan la rodilla y participan en la extensión de cadera.
- Glúteo mayor: contribuye a la extensión de cadera.
- Gastrocnemio y sóleo: participan en la flexión plantar del tobillo.

Brazos:
- Bíceps braquial: flexiona el codo y participa en la supinación del antebrazo.
- Tríceps braquial: extiende el codo.
- Músculos del antebrazo: intervienen en el agarre y los movimientos de muñeca y dedos.',
      'objetivos', '["Identificar músculos y sus acciones"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Planos y ejes anatómicos',
    'Plano sagital (flexión/extensión), frontal (abducción/aducción), transversal (rotaciones).',
    'texto', jsonb_build_object(
      'contenido', 'Planos y ejes anatómicos:
- Plano sagital: divide el cuerpo en derecha e izquierda. Se relaciona con movimientos como flexión y extensión.
- Plano frontal: divide el cuerpo en anterior y posterior. Se relaciona con abducción y aducción.
- Plano transversal: divide el cuerpo en superior e inferior. Se relaciona con rotaciones.

Los ejes son líneas imaginarias alrededor de las cuales se produce el movimiento. En términos generales, el movimiento en el plano sagital ocurre alrededor de un eje mediolateral; en el frontal, alrededor de uno anteroposterior; y en el transversal, alrededor de uno longitudinal.',
      'objetivos', '["Identificar planos y ejes", "Relacionar con movimientos"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'La escápula y sus movimientos',
    'Elevación/depresión, protracción/retracción, rotación superior/inferior. Relevancia en hombro.',
    'texto', jsonb_build_object(
      'contenido', 'La escápula se mueve sobre la caja torácica y participa en la función del hombro.

Sus movimientos principales son:
- Elevación y depresión.
- Protracción y retracción.
- Rotación superior e inferior.

Estos movimientos son importantes en elevaciones de brazos, remos, empujes y ejercicios por encima de la cabeza. No se debe enseñar que la escápula permanece rígida en todos los ejercicios: su movimiento debe corresponder a la tarea y a la articulación implicada.',
      'objetivos', '["Describir movimientos escapulares", "Aplicar a ejercicios"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 4;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Agonistas, antagonistas y estabilizadores',
    'Roles musculares en curl, press, sentadilla, remo, elevación lateral.',
    'texto', jsonb_build_object(
      'contenido', 'El agonista contribuye de manera principal al movimiento; el antagonista produce una acción opuesta; los sinergistas ayudan a ejecutar la tarea y los estabilizadores controlan segmentos corporales.

Por ejemplo, en un curl de bíceps, los flexores del codo participan en el movimiento y otros músculos estabilizan el hombro y el tronco.

Práctica presencial: identificar los grupos musculares involucrados en sentadilla, press de banca, remo, curl de bíceps y elevación lateral.',
      'objetivos', '["Diferenciar roles musculares", "Aplicar a ejercicios básicos"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 2) AND t.orden = 5;

  -- Autoevaluación Módulo 2
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT id, m.id, 'Autoevaluación Módulo 2: Anatomía', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 2
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿En qué plano ocurre la flexión de codo en un curl?', 'opcion_multiple', 1, 1, 'El plano sagital divide el cuerpo en derecha-izquierda y los movimientos son flexión/extensión.'),
  (v_eval_id, 'El braquial es un supinador potente del antebrazo.', 'verdadero_falso', 1, 2, 'Falso. El braquial es flexor puro del codo; el bíceps supina.'),
  (v_eval_id, 'En un remo, ¿qué músculos realizan retracción escapular?', 'respuesta_corta', 2, 3, 'Romboides y trapecio medio/inferior realizan la retracción escapular.');

END $$;