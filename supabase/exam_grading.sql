-- ============================================
-- CALIFICACION AUTOMATICA DE RESPUESTAS ABIERTAS
-- ============================================
-- Las autoevaluaciones incluyen preguntas de respuesta corta. Para que el
-- estudiante reciba una nota al entregar (en vez de quedar todo pendiente),
-- se califica por cobertura de conceptos clave contra la respuesta esperada
-- guardada en opciones_respuesta (es_correcta = true).
--
-- Las preguntas sin respuesta esperada configurada quedan en revision docente.

CREATE OR REPLACE FUNCTION public.normalizar_texto(p_texto text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT translate(
    lower(coalesce(p_texto, '')),
    'áéíóúüñàèìòùâêîôûäëïöü',
    'aeiouunaeiouaeiouaeiou'
  )
$$;

CREATE OR REPLACE FUNCTION public.cobertura_conceptos(p_respuesta text, p_esperado text)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_resp text := public.normalizar_texto(p_respuesta);
  v_palabras text[];
  v_token text;
  v_total integer := 0;
  v_match integer := 0;
BEGIN
  IF btrim(v_resp) = '' THEN
    RETURN 0;
  END IF;

  v_palabras := regexp_split_to_array(public.normalizar_texto(p_esperado), '[^a-z0-9]+');

  FOREACH v_token IN ARRAY v_palabras LOOP
    IF length(v_token) >= 4
       AND v_token NOT IN (
         'para','como','este','esta','estos','estas','desde','entre','sobre','segun',
         'donde','cuando','porque','tambien','debe','deben','puede','pueden','todo',
         'toda','todos','todas','otro','otra','mas','menos','solo','cada','ante',
         'bajo','contra','hacia','hasta','mediante','durante','sino','ellos','ellas'
       ) THEN
      v_total := v_total + 1;
      IF position(v_token in v_resp) > 0 THEN
        v_match := v_match + 1;
      END IF;
    END IF;
  END LOOP;

  IF v_total = 0 THEN
    RETURN CASE WHEN v_resp = public.normalizar_texto(btrim(p_esperado)) THEN 1 ELSE 0 END;
  END IF;

  RETURN round(v_match::numeric / v_total, 3);
END;
$$;

CREATE OR REPLACE FUNCTION public.entregar_intento(p_intento_id uuid, p_respuestas jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_eval uuid;
  v_estado text;
  v_total numeric := 0;
  v_obtenido numeric := 0;
  v_pendientes integer := 0;
  v_correctas integer := 0;
  v_respondidas integer := 0;
  v_pregunta record;
  v_valor text;
  v_esperado text;
  v_puntaje numeric;
  v_nota numeric;
  v_total_preguntas integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;

  SELECT i.evaluacion_id, i.estado
    INTO v_eval, v_estado
  FROM intentos_evaluacion i
  JOIN matriculas m ON m.id = i.matricula_id
  WHERE i.id = p_intento_id AND m.user_id = v_uid;

  IF v_eval IS NULL THEN
    RAISE EXCEPTION 'Intento no encontrado';
  END IF;

  IF v_estado <> 'en_curso' THEN
    RAISE EXCEPTION 'Este intento ya fue entregado';
  END IF;

  DELETE FROM respuestas WHERE intento_id = p_intento_id;

  FOR v_pregunta IN
    SELECT q.id, q.tipo, q.puntaje
    FROM preguntas q
    WHERE q.evaluacion_id = v_eval
    ORDER BY q.orden
  LOOP
    v_valor := NULLIF(btrim(COALESCE(p_respuestas ->> v_pregunta.id::text, '')), '');
    v_puntaje := NULL;
    v_esperado := NULL;

    IF v_valor IS NOT NULL THEN
      v_respondidas := v_respondidas + 1;

      IF v_pregunta.tipo IN ('opcion_multiple', 'verdadero_falso')
         AND v_valor ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT CASE WHEN o.es_correcta THEN v_pregunta.puntaje ELSE 0 END
          INTO v_puntaje
        FROM opciones_respuesta o
        WHERE o.id = v_valor::uuid AND o.pregunta_id = v_pregunta.id;
      ELSIF v_pregunta.tipo = 'respuesta_corta' THEN
        SELECT o.texto INTO v_esperado
        FROM opciones_respuesta o
        WHERE o.pregunta_id = v_pregunta.id AND o.es_correcta
        ORDER BY o.orden
        LIMIT 1;

        IF v_esperado IS NOT NULL THEN
          v_puntaje := CASE
            WHEN public.cobertura_conceptos(v_valor, v_esperado) >= 0.34 THEN v_pregunta.puntaje
            ELSE 0
          END;
        END IF;
      END IF;
    END IF;

    IF v_puntaje IS NULL THEN
      v_pendientes := v_pendientes + 1;
    ELSE
      v_obtenido := v_obtenido + v_puntaje;
      IF v_puntaje > 0 THEN
        v_correctas := v_correctas + 1;
      END IF;
    END IF;

    v_total := v_total + v_pregunta.puntaje;

    INSERT INTO respuestas (intento_id, pregunta_id, respuesta_json, puntaje_obtenido)
    VALUES (p_intento_id, v_pregunta.id, jsonb_build_object('valor', v_valor), v_puntaje);
  END LOOP;

  SELECT count(*) INTO v_total_preguntas FROM preguntas WHERE evaluacion_id = v_eval;

  IF v_pendientes > 0 OR v_respondidas = 0 THEN
    UPDATE intentos_evaluacion
      SET estado = 'entregado', entregado_at = NOW()
      WHERE id = p_intento_id;

    RETURN jsonb_build_object(
      'estado', 'entregado',
      'nota_final', NULL,
      'pendientes', v_pendientes,
      'total_preguntas', v_total_preguntas
    );
  END IF;

  v_nota := CASE WHEN v_total > 0 THEN round((v_obtenido / v_total) * 100, 2) ELSE 0 END;

  UPDATE intentos_evaluacion
    SET estado = 'calificado',
        entregado_at = NOW(),
        calificado_at = NOW(),
        nota_final = v_nota
    WHERE id = p_intento_id;

  RETURN jsonb_build_object(
    'estado', 'calificado',
    'nota_final', v_nota,
    'correctas', v_correctas,
    'total_preguntas', v_total_preguntas,
    'pendientes', 0
  );
END;
$$;

REVOKE ALL ON FUNCTION public.normalizar_texto(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cobertura_conceptos(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.entregar_intento(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.entregar_intento(uuid, jsonb) TO authenticated;
