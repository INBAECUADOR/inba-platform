-- ============================================
-- MÓDULO 8: NUTRICIÓN DEPORTIVA
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
  v_modulo_id UUID;
  v_eval_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  INSERT INTO modulos (curso_id, orden, nombre, descripcion, objetivos, duracion_horas, es_obligatorio)
  VALUES (v_curso_id, 8, 'Fundamentos de nutrición deportiva',
    'Entender los principios nutricionales relacionados con el entrenamiento y reconocer los límites del rol del entrenador.',
    '["Explicar balance energético y LEA", "Aplicar recomendaciones de macronutrientes", "Identificar suplementos con evidencia y riesgo antidopaje", "Saber cuándo derivar a nutricionista"]', 8, TRUE)
  RETURNING id INTO v_modulo_id;

  INSERT INTO temas (modulo_id, orden, titulo, descripcion, objetivos, duracion_minutos) VALUES
  (v_modulo_id, 1, 'Balance energético', 'Superávit/déficit, disponibilidad energética baja (LEA <30 kcal/kg FFM/d)', '["Explicar balance y LEA"]', 60),
  (v_modulo_id, 2, 'Macronutrientes', 'Proteína 1.6 g/kg/d (Morton 2018), CHO 3-7 g/kg/d, Grasas ≥0.8-1 g/kg/d', '["Aplicar recomendaciones macro"]', 90),
  (v_modulo_id, 3, 'Hidratación y sueño', '35-45 ml/kg/d + pérdidas. Sueño 7-9h. No manipular agua/sodio para competir.', '["Aplicar hidratación y sueño"]', 45),
  (v_modulo_id, 4, 'Suplementos y antidopaje', 'Creatina (Grado A), cafeína, beta-alanina. Checklist: etiqueta, certificación, WADA, necesidad real. Scope: derivar nutricionista.', '["Evaluar suplementos", "Aplicar checklist antidopaje"]', 90),
  (v_modulo_id, 5, 'Alimentación y preparación competitiva', 'Planificación, seguimiento, ajustes. Restricciones severas/deshidratación = riesgo. Derivar nutricionista.', '["Saber cuándo derivar"]', 60);

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Balance energético y disponibilidad energética',
    'Superávit para masa, déficit para grasa. LEA <30 kcal/kg FFM/d → hormonal, óseo, psicológico.',
    'texto', jsonb_build_object(
      'contenido', 'El balance energético describe la relación entre energía consumida y energía gastada. Un superávit sostenido puede favorecer el aumento de peso; un déficit sostenido puede reducirlo.

Para desarrollar masa muscular, la alimentación debe respaldar el entrenamiento y la recuperación. Para perder grasa, el déficit debe ser compatible con salud, rendimiento y adherencia.

Baja Disponibilidad Energética (LEA): (Ingesta - Gasto ejercicio) / kg masa magra < 30 kcal/kg FFM/d.
Consecuencias: endocrino (eje HPTA ↓, T3 ↓, cortisol ↑), óseo (densidad ↓), psicológico (irritabilidad, TCA riesgo). En hombres también ocurre.

Entrenador detecta: fatiga crónica, estancamiento, lesiones recurrentes, irritabilidad, pérdida menstrual (mujeres), libido baja → derivar nutricionista/médico.',
      'objetivos', '["Explicar balance y LEA"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 1;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Macronutrientes: proteína, carbohidratos, grasas',
    'Proteína 1.6 g/kg/d (Morton 2018 saturación). CHO 3-7 g/kg/d. Grasas ≥0.8-1 g/kg/d. Distribución 0.4-0.55 g/kg/comida x 4-5.',
    'texto', jsonb_build_object(
      'contenido', 'Proteína: Morton et al. 2018 (PMID 28698222) - beneficio se estabiliza ~1.6 g/kg/d. En déficit agresivo / atletas muy magros / mayores 60a → 2-2.5 g/kg/d. Distribución: 0.4-0.55 g/kg/comida × 4-5 comidas.

Carbohidratos: combustible principal series intensas. 3-5 g/kg/d (moderado) a 5-7 g/kg/d (alto volumen).

Grasas: función celular, absorción vitaminas liposolubles, hormonas. ≥0.8-1 g/kg/d.

Fuentes: variedad animal + vegetal → perfil aminoácidos completo.',
      'objetivos', '["Aplicar recomendaciones macro"]'
    ),
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 2;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Hidratación, sueño y suplementos con evidencia',
    'Hidratación 35-45 ml/kg/d + pérdidas. Sueño 7-9h. Creatina 3-5g/d (Grado A). Cafeína, beta-alanina, citrulina.',
    'texto', jsonb_build_object(
      'contenido', 'Hidratación: 35-45 ml/kg/d + pérdidas por sudor. Deshidratación 2% → ↓ fuerza, potencia, capacidad trabajo.

Sueño: 7-9h. <6h → mayor pérdida masa magra y mayor retención grasa en déficit. Higiene sueño, magnesio, rutina.

Suplementos con evidencia (Grado A/B):
- Creatina monohidrato 3-5 g/d: fosfocreatina → resíntesis ATP rápida. Fuerza, potencia, hipertrofia, recuperación, cognitivo. Segura en sanos.
- Cafeína 3-6 mg/kg: potencia, resistencia, enfoque.
- Beta-alanina 3.2-6.4 g/d crónica: buffer H+ en esfuerzos 1-4 min.
- Citrulina malato 6-8 g: flujo sanguíneo, fatiga.

Mitos creatina: "ciclar", "retención subcutánea" (es intracelular), "solo hombres".',
      'objetivos', '["Aplicar hidratación y sueño", "Identificar suplementos con evidencia"]'
    ),
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 3;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Suplementación responsable: checklist y antidopaje',
    'Checklist: 1) etiqueta completa 2) certificación Informed Sport/NSF 3) vs lista WADA 4) necesidad real. Scope: derivar nutricionista.',
    'texto', jsonb_build_object(
      'contenido', 'Antes de recomendar un suplemento, el entrenador debe preguntarse:
1. ¿Existe evidencia fiable de que sea útil para ese objetivo?
2. ¿Hay riesgos, contraindicaciones o interacciones?
3. ¿El producto cuenta con certificación de un tercero independiente (Informed Sport / NSF Certified for Sport / Cologne List)?
4. ¿He revisado los ingredientes frente a la lista de WADA y las reglas de la federación?
5. ¿Existe una necesidad real que la alimentación no cubre?

La etiqueta no garantiza que un producto esté libre de contaminantes o sustancias no declaradas. "Natural" en etiqueta NO garantiza seguridad.

Rol del entrenador: identificar problemas obvios (poca energía, poca proteína, poco sueño) y remitir a nutricionista para planes individuales. No sustituye al nutricionista.',
      'objetivos', '["Evaluar suplementos", "Aplicar checklist antidopaje"]'
    ),
    'texto', TRUE, 90
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 4;

  INSERT INTO lecciones (tema_id, orden, titulo, descripcion, tipo, contenido_json, es_obligatoria, duracion_minutos)
  SELECT t.id, 1, 'Alimentación en preparación competitiva y scope',
    'Planificación, seguimiento, ajustes. Restricciones severas/deshidratación = riesgo. Derivar nutricionista colegiado.',
    'texto', jsonb_build_object(
      'contenido', 'Una preparación requiere planificación, seguimiento y ajustes. Las restricciones severas, el uso de métodos de deshidratación y las dietas extremas pueden perjudicar la salud y el rendimiento.

El entrenador debe trabajar dentro de su competencia y coordinar con un nutricionista-dietista cualificado cuando se necesite una intervención nutricional individualizada, especialmente en presencia de enfermedad, síntomas o necesidades clínicas.

Scope of practice: entrenador = hábitos, educación, adherencia, detección flags; nutricionista = planes dietéticos individualizados, patologías, cálculo preciso.

Situaciones que requieren derivación obligatoria:
1. TCA / dismorfia / historia dietas extremas
2. Patologías: diabetes, tiroides, renal, cardiovascular, GI
3. Déficit agresivo competición / peak week / manipulación agua/sodio',
      'objetivos', '["Saber cuándo derivar"]'
    ),
    'texto', TRUE, 60
  FROM temas t WHERE t.modulo_id = (SELECT id FROM modulos WHERE curso_id = (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026') AND orden = 8) AND t.orden = 5;

  -- Autoevaluación Módulo 8
  INSERT INTO evaluaciones (curso_id, modulo_id, titulo, descripcion, tipo, ponderacion, tiempo_limite_minutos, intentos_permitidos, estado)
  SELECT c.id, m.id, 'Autoevaluación Módulo 8: Nutrición', 'Práctica sin calificar', 'cuestionario', 0, 25, 3, 'publicado'
  FROM cursos c JOIN modulos m ON m.curso_id = c.id WHERE c.codigo = 'CERT-ENT-2026' AND m.orden = 8
  RETURNING id INTO v_eval_id;

  INSERT INTO preguntas (evaluacion_id, enunciado, tipo, puntaje, orden, explicacion)
  VALUES
  (v_eval_id, 'Según Morton 2018, la ingesta proteica donde el beneficio se estabiliza es:', 'opcion_multiple', 1, 1, '1.6 g/kg/d'),
  (v_eval_id, 'Un suplemento "natural" en la etiqueta garantiza que está libre de sustancias prohibidas.', 'verdadero_falso', 1, 2, 'Falso. "Natural" no está regulado; contaminación cruzada es real.'),
  (v_eval_id, 'Cliente en déficit: sueño 5h, libido 0, irritable, fuerza bajando, 2 resfriados/mes. Diagnóstico y 3 acciones.', 'respuesta_corta', 2, 3, 'Diagnóstico: Baja Disponibilidad Energética (LEA). Acciones: 1) Subir calorías 300-500 kcal/d (diet break 1-2 sem) 2) Sueño ≥7.5h 3) Proteína ≥2 g/kg/d. Derivar nutricionista/médico; reducir volumen 30% 2 sem.');

END $$;