-- ============================================
-- CONTENIDO PUBLICO: CALENDARIO OFICIAL
-- ============================================
-- Idempotente: no duplica eventos con el mismo titulo.

INSERT INTO eventos (titulo, descripcion, fecha_inicio, fecha_fin, sede, direccion, categorias_json, estado, requiere_inscripcion, cupo_maximo)
SELECT * FROM (VALUES
  (
    'Asamblea General Ordinaria INBA Ecuador 2026',
    'Sesión ordinaria de socios: informe de gestión 2026, aprobación del plan anual 2027, reformas reglamentarias y elección de comisiones técnicas.',
    '2026-12-10 18:00:00-05'::timestamptz,
    '2026-12-10 20:00:00-05'::timestamptz,
    'Sede INBA Quito',
    'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
    '["Institucional"]'::jsonb,
    'publicado',
    true,
    120
  ),
  (
    'Evaluación práctica: Certificación de Entrenadores',
    'Sesión presencial de evaluación técnica y análisis de casos para los participantes de la Certificación de Entrenadores de Culturismo Natural.',
    '2026-12-23 19:00:00-05'::timestamptz,
    '2026-12-23 23:00:00-05'::timestamptz,
    'Sede INBA Quito',
    'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
    '["Formación"]'::jsonb,
    'publicado',
    true,
    40
  ),
  (
    'Seminario: Nutrición deportiva basada en evidencia',
    'Jornada teórico-práctica sobre energía, proteína, hidratación y suplementación con criterios antidopaje, a cargo del equipo técnico de INBA Ecuador.',
    '2027-01-16 09:00:00-05'::timestamptz,
    '2027-01-16 17:00:00-05'::timestamptz,
    'Auditorio INBA Guayaquil',
    'Av. 9 de Octubre y Malecón, Guayaquil',
    '["Formación", "Seminario"]'::jsonb,
    'publicado',
    true,
    80
  ),
  (
    'Clínica de posing y presentación escénica',
    'Trabajo práctico de poses obligatorias, transiciones, expresión y criterios de juicio para las categorías de la temporada 2027.',
    '2027-01-30 10:00:00-05'::timestamptz,
    '2027-01-30 14:00:00-05'::timestamptz,
    'Gimnasio INBA Quito',
    'Av. 10 de Agosto y Colón, Edificio INBA, Piso 1',
    '["Clínica", "Competencia"]'::jsonb,
    'publicado',
    true,
    50
  ),
  (
    'Copa INBA Costa 2027',
    'Primera fecha del circuito nacional. Categorías debutante, novato y open en las divisiones de culturismo natural, mens physique y bikini fitness.',
    '2027-02-20 08:00:00-05'::timestamptz,
    '2027-02-20 22:00:00-05'::timestamptz,
    'Teatro Centro de Arte, Guayaquil',
    'Av. 9 de Octubre y Pedro Moncayo, Guayaquil',
    '["Debutante", "Novato", "Open"]'::jsonb,
    'publicado',
    true,
    150
  ),
  (
    'Campeonato Nacional INBA Ecuador 2027',
    'Fecha final del circuito nacional y clasificatorio a competencias internacionales. Pesaje, seminario técnico y competencia en escenario.',
    '2027-05-15 07:00:00-05'::timestamptz,
    '2027-05-16 22:00:00-05'::timestamptz,
    'Coliseo General Rumiñahui, Quito',
    'Av. Simón Bolívar, Quito',
    '["Debutante", "Novato", "Open", "Máster"]'::jsonb,
    'publicado',
    true,
    300
  )
) AS v(titulo, descripcion, fecha_inicio, fecha_fin, sede, direccion, categorias_json, estado, requiere_inscripcion, cupo_maximo)
WHERE NOT EXISTS (
  SELECT 1 FROM eventos e WHERE e.titulo = v.titulo
);
