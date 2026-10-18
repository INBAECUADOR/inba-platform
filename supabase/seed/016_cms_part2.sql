-- CMS CONTENT: PÁGINAS INSTITUCIONALES (Parte 2)

INSERT INTO paginas_contenido (slug, titulo, contenido_json, seo_json, estado, version, created_by, published_at)
VALUES
('asociacion/historia', 'Historia de INBA Ecuador', jsonb_build_object(
  'secciones', jsonb_build_array(
    jsonb_build_object('titulo', 'Nuestros Inicios', 'contenido', 'INBA Ecuador nace como respuesta a la necesidad de una federación que promueva el culturismo natural con rigor científico y ética profesional en Ecuador.'),
    jsonb_build_object('titulo', 'Hitos Importantes', 'contenido', 'Primer campeonato nacional 2010. Primera certificación de entrenadores 2012. Afiliación internacional 2015.')
  )
), jsonb_build_object('title', 'Historia - INBA Ecuador', 'description', 'Historia de la Federación Ecuatoriana de Culturismo Natural'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/mision-vision', 'Misión y Visión', jsonb_build_object(
  'mision', 'Promover, regular y desarrollar el culturismo natural en Ecuador mediante la formación científica de entrenadores, la organización de competencias transparentes y la defensa del juego limpio.',
  'vision', 'Ser la federación de referencia en Latinoamérica por la excelencia en formación, la integridad competitiva y la promoción de la salud a través del culturismo natural.',
  'valores', jsonb_build_array(
    jsonb_build_object('nombre', 'Integridad', 'descripcion', 'Cero tolerancia al dopaje y la corrupción.'),
    jsonb_build_object('nombre', 'Ciencia', 'descripcion', 'Decisiones basadas en evidencia, no en modas.'),
    jsonb_build_object('nombre', 'Ética', 'descripcion', 'Respeto a la dignidad del atleta y transparencia total.'),
    jsonb_build_object('nombre', 'Excelencia', 'descripcion', 'Búsqueda continua de la mejora en formación y competencias.')
  )
), jsonb_build_object('title', 'Misión y Visión - INBA Ecuador', 'description', 'Misión, visión y valores de INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/equipo', 'Equipo Directivo', jsonb_build_object(
  'miembros', jsonb_build_array(
    jsonb_build_object('nombre', 'Dr. Juan Pérez', 'cargo', 'Presidente', 'bio', 'Médico deportivo con 20 años de experiencia.', 'foto_url', '/images/equipo/juan-perez.jpg'),
    jsonb_build_object('nombre', 'Lic. María González', 'cargo', 'Vicepresidenta Académica', 'bio', 'Licenciada en Ciencias del Deporte, MSc en Fisiología del Ejercicio.', 'foto_url', '/images/equipo/maria-gonzalez.jpg'),
    jsonb_build_object('nombre', 'Ing. Carlos Rodríguez', 'cargo', 'Director Técnico', 'bio', 'Entrenador certificado INBA, 15 años experiencia.', 'foto_url', '/images/equipo/carlos-rodriguez.jpg'),
    jsonb_build_object('nombre', 'Dra. Ana Martínez', 'cargo', 'Directora Médica', 'bio', 'Médica deportiva, especialista en antidopaje.', 'foto_url', '/images/equipo/ana-martinez.jpg')
  )
), jsonb_build_object('title', 'Equipo Directivo - INBA Ecuador', 'description', 'Conoce al equipo directivo de INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/reglamentos', 'Reglamentos y Documentos', jsonb_build_object(
  'documentos', jsonb_build_array(
    jsonb_build_object('titulo', 'Estatutos INBA Ecuador', 'descripcion', 'Estatutos oficiales de la federación.', 'archivo_url', '/documentos/estatutos-inba.pdf', 'categoria', 'estatutos'),
    jsonb_build_object('titulo', 'Reglamento Competencias', 'descripcion', 'Reglas oficiales para competencias INBA Ecuador.', 'archivo_url', '/documentos/reglamento-competencias.pdf', 'categoria', 'competencias'),
    jsonb_build_object('titulo', 'Reglamento Afiliación', 'descripcion', 'Normas para afiliación de entrenadores, atletas e instituciones.', 'archivo_url', '/documentos/reglamento-afiliacion.pdf', 'categoria', 'afiliacion'),
    jsonb_build_object('titulo', 'Código Ética', 'descripcion', 'Código de conducta para entrenadores, atletas y jueces.', 'archivo_url', '/documentos/codigo-etica.pdf', 'categoria', 'etica'),
    jsonb_build_object('titulo', 'Reglamento Antidopaje', 'descripcion', 'Adaptación código WADA para INBA Ecuador.', 'archivo_url', '/documentos/reglamento-antidopaje.pdf', 'categoria', 'antidopaje')
  )
), jsonb_build_object('title', 'Reglamentos - INBA Ecuador', 'description', 'Reglamentos y documentos oficiales de INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('asociacion/politicas', 'Políticas Culturismo Natural', jsonb_build_object(
  'politicas', jsonb_build_array(
    jsonb_build_object('titulo', 'Política Antidopaje', 'contenido', 'Cumplimiento estricto del Código Mundial Antidopaje (WADA). Controles en y fuera de competición. Sanciones según código INBA/WADA.'),
    jsonb_build_object('titulo', 'Política Protección Menores', 'contenido', 'Supervisión obligatoria en entrenamientos. Consentimiento padres/tutores. Evaluación médica previa obligatoria. Programa conservador sin peak week agresivo.'),
    jsonb_build_object('titulo', 'Política Igualdad e Inclusión', 'contenido', 'Cero tolerancia a discriminación por género, orientación, etnia, discapacidad. Categorías inclusivas según reglamento.'),
    jsonb_build_object('titulo', 'Política Protección Datos', 'contenido', 'Cumplimiento LOPD Ecuador. Consentimiento para fotos/datos. Derecho a rectificación/olvido. Seguridad técnica y organizativa.'),
    jsonb_build_object('titulo', 'Política Conflictos Interés', 'contenido', 'Declaración obligatoria comisiones/patrocinios. Prohibido recomendar productos con comisión no declarada. Transparencia en patrocinios.')
  )
), jsonb_build_object('title', 'Políticas - INBA Ecuador', 'description', 'Políticas oficiales de culturismo natural en INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW())
ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  contenido_json = EXCLUDED.contenido_json,
  seo_json = EXCLUDED.seo_json,
  estado = EXCLUDED.estado,
  version = paginas_contenido.version + 1,
  updated_at = NOW();