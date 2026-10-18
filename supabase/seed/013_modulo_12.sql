-- ============================================
-- MÓDULO 12: COMUNICACIÓN, ÉTICA, GESTIÓN PROFESIONAL
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 12, 'Comunicación, ética y gestión profesional del entrenador',
    'Formar entrenadores capaces de trabajar de forma profesional, respetuosa y organizada.',
    '["Comunicar objetivos, retroalimentación y ajustes", "Aplicar ética profesional y límites", "Gestionar servicio: contrato, datos, pagos", "Compromiso con formación continua"]', 6, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Comunicación con el atleta', 'Objetivos claros, escuchar, instrucciones concretas, explicar ajustes. Sin humillaciones/promesas falsas.', '["Comunicar profesionalmente"]', 60),
  (v_modulo_id, 2, 'Ética y límites profesionales', 'Privacidad, consentimiento fotos, conflictos interés, derivación médica/nutrición/fisio. No diagnosticar.', '["Aplicar ética y límites"]', 60),
  (v_modulo_id, 3, 'Registro y gestión del servicio', 'Contrato, objetivos, planificación, seguimiento, cambios, comunicaciones. Pagos, cancelación, datos personales.', '["Gestionar servicio profesional"]', 60),
  (v_modulo_id, 4, 'Formación continua y código conducta', 'Revisar bibliografía, evaluar fuentes, distinguir evidencia/experiencia/publicidad. Código personal conducta.', '["Compromiso formación continua"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Comunicación efectiva con el atleta',
    'Objetivos claros, escuchar, instrucciones concretas, explicar ajustes. Sin humillaciones/promesas falsas.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador debe establecer objetivos claros, escuchar las dificultades, dar instrucciones concretas y explicar por qué se realizan los ajustes.

La comunicación debe evitar humillaciones, amenazas, comentarios discriminatorios y promesas de resultados garantizados.

Feedback efectivo: método sándwich (Positivo específico → Correctivo específico/accionable → Positivo refuerzo).
Ejemplo: "Buen agarre y tensión inicial en dorsales. En la subida, tu lumbar se redondea al pasar la rodilla; aprieta ombligo a columna, empuja suelo con pies, lleva pecho arriba antes de extender cadera. El camino de barra está limpio; con ese ajuste la próxima será sólida."',
      'objetivos', '["Comunicar profesionalmente"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Ética y límites profesionales',
    'Privacidad, consentimiento fotos, conflictos interés, derivación médica/nutrición/fisio. No diagnosticar/prescribir.',
    'texto', jsonb_build_object(
      'contenido', 'El entrenador debe proteger la privacidad del atleta, solicitar autorización para usar fotografías, evitar conflictos de interés y reconocer cuándo una situación excede su preparación profesional.

No debe diagnosticar patologías, modificar medicación ni sustituir el trabajo de médicos, fisioterapeutas o nutricionistas cualificados.

Conflictos de interés: vender/recomendar suplementos con comisión sin declararlo.
Menores de edad: consentimiento padres, médica, supervisión presencial, prioridad salud > resultado.
Sustancias prohibidas: no facilitar, no normalizar, explicar riesgos, no entrenar para competir mientras use, derivar médico.

Código conducta INBA: antidopaje, trato respetuoso, integridad, confidencialidad, límites competencia, derivaciones, conflicto interés.',
      'objetivos', '["Aplicar ética y límites"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Registro y gestión profesional del servicio',
    'Contrato, objetivos, planificación, seguimiento, cambios, comunicaciones. Pagos, cancelación, protección datos.',
    'texto', jsonb_build_object(
      'contenido', 'Un servicio profesional debe documentar:
- Acuerdo con el atleta (contrato/consentimiento informado)
- Objetivos y planificación
- Seguimiento, cambios y comunicaciones relevantes
- Condiciones de pago, cancelación, disponibilidad
- Protección de datos personales (fotos, historial, comunicaciones)

Consentimiento informado debe incluir: descripción programa, riesgos, beneficios, alternativas, confidencialidad, derecho a retirar consentimiento, datos contacto.',
      'objetivos', '["Gestionar servicio profesional"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Formación continua y código de conducta personal',
    'Revisar bibliografía, evaluar fuentes, distinguir evidencia/experiencia/publicidad. Código personal conducta + protocolo derivación.',
    'texto', jsonb_build_object(
      'contenido', 'La ciencia del entrenamiento evoluciona. El entrenador debe revisar bibliografía, evaluar la calidad de las fuentes y distinguir entre evidencia, experiencia personal y publicidad.

Código personal de conducta (ejemplo):
1. Priorizar salud y seguridad del atleta sobre resultados.
2. No recomendar sustancias prohibidas ni métodos no verificados.
3. Respetar privacidad y confidencialidad absoluta.
4. Derivar a profesionales cualificados cuando exceda mi competencia.
5. Comunicar con honestidad: no prometer resultados garantizados.
6. Actualizar conocimientos mínimo 20h/año (cursos, papers, congresos).
7. Transparencia en conflictos de interés (comisiones, patrocinios).
8. Trato respetuoso e inclusivo: cero tolerancia a discriminación/acoso.

Protocolo derivación: identificar flag → expresar preocupación empática → derivar a profesional cualificado → documentar → seguir caso si procede.

Actividad: resolver caso - atleta pide estrategia extrema perder peso rápido. Respuesta: "Me preocupa tu salud. Esa estrategia implica riesgos (LEA, TCA, rebote). Propongo: diet break 1 sem, subir calorías 300kcal, mantener proteína, reducir cardio. Derivar a nutricionista TCA si persiste. Salud > resultado."',
      'objetivos', '["Compromiso formación continua"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 12) AND t.orden = 4;

  -- Práctica supervisada (Módulo 12 incluye práctica)
  INSERT INTO practicas_sesiones (curso_id, modulo_id, titulo, descripcion, fecha_inicio, fecha_fin, sede, direccion, docente_id, cupo_maximo, estado)
  SELECT c.id, m.id, 'Práctica integradora: Análisis de casos y evaluación técnica',
    'Análisis de casos reales (estancamiento, dolor, adherencia). Evaluación técnica: sentadilla, PMR, press, jalón, curl. Feedback con rúbrica.',
    CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '30 days' + INTERVAL '4 hours',
    'Sede INBA Quito', 'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
    (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1),
    20, 'programada'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 12;

  -- Autoevaluación Módulo 12
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 12: Ética/Gestión', 'Práctica sin calificar', 'cuestionario', 0, 20, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 12
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, '¿Qué 5 componentes debe tener un consentimiento informado?', 'respuesta_corta', 2, 1, '1) Descripción programa/riesgos 2) Beneficios 3) Alternativas 4) Confidencialidad/datos 5) Derecho a retirar consentimiento + datos contacto'),
  (v_eval_id, 'El entrenador puede diagnosticar una rotura de menisco basándose en palpación.', 'verdadero_falso', 1, 2, 'Falso. Fuera de scope; derivar médico/fisio para diagnóstico por imagen.'),
  (v_eval_id, 'Cliente 17 años quiere competir. Padres firman consentimiento. 4 salvaguardas adicionales.', 'respuesta_corta', 2, 3, '1) Médica previa obligatoria 2) Supervisión presencial TODAS sesiones 3) Programa conservador: volumen moderado, RIR 2-3, sin fallo, sin peak week agresivo 4) Comunicación trimestral con padres + revisión médica semestral + nutricionista pediátrico.');

END $$;