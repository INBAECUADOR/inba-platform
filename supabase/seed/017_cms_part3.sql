-- CMS CONTENT: PÁGINAS INSTITUCIONALES (Parte 3)

INSERT INTO paginas_contenido (slug, titulo, contenido_json, seo_json, estado, version, created_by, published_at)
VALUES
('competencias/calendario', 'Calendario de Competencias', jsonb_build_object(
  'eventos_proximos', jsonb_build_array(
    jsonb_build_object('nombre', 'Campeonato Nacional INBA 2026', 'fecha_inicio', '2026-11-15', 'fecha_fin', '2026-11-16', 'sede', 'Quito', 'estado', 'inscripciones_abiertas', 'categoria', 'nacional'),
    jsonb_build_object('nombre', 'Copa Andes Natural', 'fecha_inicio', '2026-09-20', 'fecha_fin', '2026-09-20', 'sede', 'Guayaquil', 'estado', 'proximamente', 'categoria', 'regional'),
    jsonb_build_object('nombre', 'Sudamericano Natural 2026', 'fecha_inicio', '2026-12-05', 'fecha_fin', '2026-12-07', 'sede', 'Cuenca', 'estado', 'planificacion', 'categoria', 'internacional')
  )
), jsonb_build_object('title', 'Calendario Competencias - INBA Ecuador', 'description', 'Calendario oficial de competencias INBA Ecuador 2026'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('formacion/programas', 'Programas de Formación', jsonb_build_object(
  'programas', jsonb_build_array(
    jsonb_build_object('titulo', 'Certificación Entrenadores Culturismo Natural', 'descripcion', 'Programa insignia 72h, 12 módulos, modalidad híbrida, prácticas supervisadas, certificación oficial.', 'duracion', '6 meses', 'modalidad', 'Híbrida', 'href', '/formacion/certificacion'),
    jsonb_build_object('titulo', 'Especialización Nutrición Deportiva', 'descripcion', 'Complemento avanzado para entrenadores certificados. Evidencia nutricional, planificación, suplementación.', 'duracion', '3 meses', 'modalidad', 'Virtual', 'href', '/formacion/nutricion-avanzada'),
    jsonb_build_object('titulo', 'Curso Jueces INBA', 'descripcion', 'Formación para jueces de competencias. Criterios, poses, reglamento, ética judicial.', 'duracion', '1 mes', 'modalidad', 'Presencial', 'href', '/formacion/jueces')
  )
), jsonb_build_object('title', 'Programas Formación - INBA Ecuador', 'description', 'Programas de formación profesional INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('afiliacion/tipos', 'Tipos de Afiliación', jsonb_build_object(
  'tipos', jsonb_build_array(
    jsonb_build_object('nombre', 'Estudiante', 'descripcion', 'Para estudiantes activos de la certificación', 'duracion_meses', 12, 'costo', 0, 'beneficios', jsonb_build_array('Acceso a materiales académicos', 'Descuento en eventos', 'Red de contactos')),
    jsonb_build_object('nombre', 'Entrenador Certificado', 'descripcion', 'Para entrenadores con certificación INBA vigente', 'duracion_meses', 12, 'costo', 50.00, 'beneficios', jsonb_build_array('Directorio público entrenadores', 'Acceso a eventos exclusivos', 'Actualizaciones científicas', 'Descuento recertificación')),
    jsonb_build_object('nombre', 'Atleta Competidor', 'descripcion', 'Para atletas en eventos INBA', 'duracion_meses', 12, 'costo', 30.00, 'beneficios', jsonb_build_array('Inscripción prioritaria eventos', 'Seguro deportivo básico', 'Asesoría técnica')),
    jsonb_build_object('nombre', 'Afiliado Institucional', 'descripcion', 'Gimnasios, box, centros de entrenamiento', 'duracion_meses', 12, 'costo', 200.00, 'beneficios', jsonb_build_array('Directorio público gimnasios', 'Material promocional INBA', 'Capacitación staff incluido', 'Visibilidad web INBA'))
  )
), jsonb_build_object('title', 'Tipos Afiliación - INBA Ecuador', 'description', 'Tipos de afiliación disponibles en INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW()),

('contacto', 'Contacto', jsonb_build_object(
  'info_contacto', jsonb_build_object(
    'direccion', 'Av. 10 de Agosto y Colón, Edificio INBA, Piso 3',
    'ciudad', 'Quito, Ecuador',
    'telefono', '+593 2 123 4567',
    'email', 'info@inbaecuador.org',
    'horario', 'Lunes a Viernes 08:00 - 17:00'
  ),
  'redes_sociales', jsonb_build_array(
    jsonb_build_object('nombre', 'Facebook', 'url', 'https://facebook.com/inbaecuador', 'icono', 'facebook'),
    jsonb_build_object('nombre', 'Instagram', 'url', 'https://instagram.com/inbaecuador', 'icono', 'instagram'),
    jsonb_build_object('nombre', 'YouTube', 'url', 'https://youtube.com/@inbaecuador', 'icono', 'youtube'),
    jsonb_build_object('nombre', 'Twitter', 'url', 'https://twitter.com/inbaecuador', 'icono', 'twitter')
  )
), jsonb_build_object('title', 'Contacto - INBA Ecuador', 'description', 'Contacta con INBA Ecuador'), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW())
ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  contenido_json = EXCLUDED.contenido_json,
  seo_json = EXCLUDED.seo_json,
  estado = EXCLUDED.estado,
  version = paginas_contenido.version + 1,
  updated_at = NOW();