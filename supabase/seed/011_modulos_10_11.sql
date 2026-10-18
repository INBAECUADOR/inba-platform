-- ============================================
-- MÓDULO 10: SUPLEMENTACIÓN, ANTIDOPAJE, INTEGRIDAD
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 10, 'Suplementación, antidopaje e integridad deportiva',
    'Promover decisiones informadas sobre suplementos y el cumplimiento de las normas deportivas.',
    '["Evaluar suplementos con checklist crítico", "Conocer normas antidopaje WADA/INBA", "Aplicar integridad deportiva y ética"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Qué es un suplemento', 'No sustituyen alimentación/entrenamiento. Etiqueta no garantiza pureza.', '["Definir suplemento y límites"]', 45),
  (v_modulo_id, 2, 'Evaluación crítica', '5 preguntas: evidencia, riesgos, certificación, WADA, necesidad real. Creatina Grado A.', '["Evaluar suplementos críticamente"]', 60),
  (v_modulo_id, 3, 'Normas antidopaje', 'Lista WADA vigente + reglas federación. Certificación reduce riesgo, no garantiza.', '["Conocer normas antidopaje"]', 60),
  (v_modulo_id, 4, 'Integridad deportiva', 'Rechazar sustancias prohibidas, no facilitar ocultación, no prometer seguridad sin fundamento.', '["Aplicar integridad deportiva"]', 45);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Qué es un suplemento y sus límites',
    'No sustituyen alimentación/entrenamiento. Etiqueta no garantiza pureza ni ausencia contaminantes.',
    'texto', jsonb_build_object(
      'contenido', 'Los suplementos pueden aportar nutrientes u otras sustancias, pero no sustituyen una alimentación adecuada ni un programa bien diseñado. La utilidad depende de la sustancia, la dosis, la evidencia, el contexto y la calidad del producto.

La etiqueta no garantiza que un producto esté libre de contaminantes o sustancias no declaradas. "Blend patentado" = no sabes dosis de cada ingrediente.',
      'objetivos', '["Definir suplemento y límites"]'
    ),
    'texto', TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Evaluación crítica: 5 preguntas + Creatina',
    '1) Evidencia 2) Riesgos 3) Certificación (Informed Sport/NSF) 4) WADA 5) Necesidad real. Creatina 3-5g/d Grado A.',
    'texto', jsonb_build_object(
      'contenido', 'Antes de recomendar un suplemento, el entrenador debe preguntarse:
1. ¿Existe evidencia fiable de que sea útil para ese objetivo?
2. ¿Hay riesgos, contraindicaciones o interacciones?
3. ¿El producto cuenta con certificación de un tercero independiente (Informed Sport / NSF Certified for Sport / Cologne List)?
4. ¿He revisado los ingredientes frente a la lista de WADA y las reglas de la federación?
5. ¿Existe una necesidad real que la alimentación no cubre?

Creatina monohidrato: 3-5 g/d crónica (carga opcional). Mecanismo: fosfocreatina → resíntesis ATP rápida. Beneficios: fuerza, potencia, hipertrofia, recuperación, cognitivo. Segura en sanos (renal hepática normal). Mitos: "ciclar", "retención subcutánea" (es intracelular), "solo hombres".',
      'objetivos', '["Evaluar suplementos críticamente"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Normas antidopaje: WADA y federaciones',
    'Lista WADA vigente + reglas federación. Certificación reduce riesgo, no garantiza. Responsabilidad estricta (strict liability).',
    'texto', jsonb_build_object(
      'contenido', 'Las sustancias y métodos prohibidos pueden cambiar con el tiempo. Los atletas y entrenadores deben consultar la lista vigente de la autoridad antidopaje pertinente y las reglas de la organización en la que competirán.

La certificación de calidad de un suplemento puede reducir determinados riesgos, pero no garantiza automáticamente que el producto esté permitido en todos los reglamentos.

Responsabilidad estricta (strict liability): el atleta es responsable de toda sustancia que entre en su cuerpo, sin necesidad de probar intención o negligencia. Contaminación de suplemento no exime de sanción.',
      'objetivos', '["Conocer normas antidopaje"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Integridad deportiva y rol del entrenador',
    'Rechazar sustancias prohibidas, no facilitar ocultación, no prometer seguridad sin fundamento. Derivar médico.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador debe rechazar el uso de sustancias prohibidas, no facilitar métodos de ocultación y no prometer que un producto es seguro o legal sin fundamento.

Si un cliente usa sustancias: no facilitar, no normalizar, explicar riesgos salud y sanciones, no entrenar para competición mientras use, derivar a médico para monitorización.

Si cliente pide "algo para crecer más rápido" sin etiquetas claras: no recomendar productos no verificables, explicar riesgo antidopaje, derivar a federación y profesional de salud.',
      'objetivos', '["Aplicar integridad deportiva"]'
    ),
    'texto', TRUE, 45
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 10) AND t.orden = 4;

  -- Autoevaluación Módulo 10
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 10: Suplementación/Antidopaje', 'Práctica sin calificar', 'cuestionario', 0, 20, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 10
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué certificación reduce riesgo de contaminación en suplementos?', 'opcion_multiple', 1, 1, 'Informed Sport / NSF Certified for Sport / Cologne List'),
  (v_eval_id, 'La certificación de un suplemento garantiza que está permitido en todos los reglamentos.', 'verdadero_falso', 1, 2, 'Falso. Reduce riesgo, no garantiza.'),
  (v_eval_id, 'Cliente pide "algo para crecer más rápido" con frasco sin etiqueta completa. Checklist y veredicto.', 'respuesta_corta', 2, 3, 'Etiqueta incompleta (blend) → NO recomendar. Sin certificación → riesgo WADA. Ingredientes no revisados vs WADA. No necesidad real (proteína/creatina/alimento cubren). Veredicto: NO recomendar. Riesgo salud y sanción.');

END $$;