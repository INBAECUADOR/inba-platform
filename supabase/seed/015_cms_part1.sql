-- CMS CONTENT: PÁGINAS INSTITUCIONALES (Parte 1)
-- NOTA: Este archivo es muy grande, se divide en partes

-- Home
INSERT INTO paginas_contenido (slug, titulo, contenido_json, seo_json, estado, version, created_by, published_at)
VALUES
('inicio', 'Inicio', jsonb_build_object(
  'hero', jsonb_build_object(
    'titulo', 'Federación Ecuatoriana de Culturismo Natural',
    'subtitulo', 'Formamos entrenadores con base científica, promovemos el juego limpio y organizamos competencias de alto nivel.',
    'cta_principal', jsonb_build_object('texto', 'Explorar Certificación', 'href', '/formacion/certificacion'),
    'cta_secundario', jsonb_build_object('texto', 'Próximas Competencias', 'href', '/competencias')
  ),
  'stats', jsonb_build_array(
    jsonb_build_object('valor', '15+', 'etiqueta', 'Años de experiencia'),
    jsonb_build_object('valor', '500+', 'etiqueta', 'Atletas certificados'),
    jsonb_build_object('valor', '12', 'etiqueta', 'Competencias anuales'),
    jsonb_build_object('valor', '50+', 'etiqueta', 'Entrenadores formados')
  )
), jsonb_build_object(
  'title', 'INBA Ecuador - Federación de Culturismo Natural',
  'description', 'Federación Ecuatoriana de Culturismo Natural - Formación de entrenadores, competencias, afiliaciones y certificaciones oficiales.'
), 'publicado', 1, (SELECT id FROM profiles WHERE email = 'admin@inbaecuador.org' LIMIT 1), NOW())
ON CONFLICT (slug) DO UPDATE SET
  titulo = EXCLUDED.titulo,
  contenido_json = EXCLUDED.contenido_json,
  seo_json = EXCLUDED.seo_json,
  estado = EXCLUDED.estado,
  version = paginas_contenido.version + 1,
  updated_at = NOW();