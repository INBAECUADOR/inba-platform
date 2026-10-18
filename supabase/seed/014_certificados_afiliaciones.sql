-- ============================================
-- CONFIGURACIÓN DE CERTIFICADOS Y TIPOS AFILIACIÓN
-- ============================================

DO $$
DECLARE
  v_curso_id UUID;
BEGIN
  SELECT id INTO v_curso_id FROM cursos WHERE codigo = 'CERT-ENT-2026';

  -- Configuración certificado para el curso principal
  INSERT INTO certificado_config (curso_id, requiere_todos_modulos, requiere_examen_final, requiere_practicas, nota_minima_modulos, nota_minima_final, plantilla_pdf)
  VALUES (v_curso_id, TRUE, TRUE, TRUE, 70, 70, 'certificado-plantilla-inba.html')
  ON CONFLICT (curso_id) DO UPDATE SET
    requiere_todos_modulos = EXCLUDED.requiere_todos_modulos,
    requiere_examen_final = EXCLUDED.requiere_examen_final,
    requiere_practicas = EXCLUDED.requiere_practicas,
    nota_minima_modulos = EXCLUDED.nota_minima_modulos,
    nota_minima_final = EXCLUDED.nota_minima_final,
    plantilla_pdf = EXCLUDED.plantilla_pdf,
    updated_at = NOW();

  -- Tipos de afiliación configurables
  INSERT INTO afiliacion_tipos (nombre, descripcion, requisitos_json, duracion_meses, costo_referencial, activo) VALUES
  ('Estudiante', 'Para estudiantes activos de la certificación', '{"requisitos": ["Estar matriculado en certificación activa", "Presentar certificado de estudios"]}', 12, 0, TRUE),
  ('Entrenador Certificado', 'Para entrenadores que completaron la certificación INBA', '{"requisitos": ["Certificado INBA vigente", "Comprobante de certificación"]}', 12, 50.00, TRUE),
  ('Atleta Competidor', 'Para atletas que compiten en eventos INBA', '{"requisitos": ["Inscripción en evento INBA vigente", "Certificado médico apto"]}', 12, 30.00, TRUE),
  ('Afiliado Institucional', 'Gimnasios, box, centros de entrenamiento', '{"requisitos": ["RUC/Registro negocio", "Responsable técnico certificado"]}', 12, 200.00, TRUE),
  ('Honorífico', 'Reconocimiento a trayectoria en culturismo natural', '{"requisitos": ["Trayectoria comprobada >10 años", "Aval de 2 miembros activos"]}', 12, 0, TRUE)
  ON CONFLICT DO NOTHING;

END $$;