-- ============================================
-- FLUJO DE EVALUACIONES EN LINEA
-- ============================================
-- Las tablas de evaluaciones existian, pero no habia forma de que un
-- estudiante iniciara un intento ni de entregar respuestas: intentos_evaluacion
-- y respuestas solo tenian politicas de lectura. Ademas la politica
-- "Auth read opciones_respuesta" permitia a cualquier usuario autenticado leer
-- la columna es_correcta (las respuestas del examen).
--
-- Solucion: funciones SECURITY DEFINER que validan matricula y propiedad del
-- intento, nunca exponen es_correcta al cliente y califican en el servidor.
-- Los intentos con preguntas abiertas quedan en estado 'entregado' para
-- revision docente.

DROP POLICY IF EXISTS "Auth read opciones_respuesta" ON opciones_respuesta;

DROP POLICY IF EXISTS "Staff manage respuestas" ON respuestas;
CREATE POLICY "Staff manage respuestas" ON respuestas
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

DROP POLICY IF EXISTS "Staff manage attempts" ON intentos_evaluacion;
CREATE POLICY "Staff manage attempts" ON intentos_evaluacion
  FOR ALL TO authenticated USING (is_staff()) WITH CHECK (is_staff());

CREATE OR REPLACE FUNCTION public.iniciar_intento(p_evaluacion_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_curso uuid;
  v_permitidos smallint;
  v_matricula uuid;
  v_intento uuid;
  v_usados integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;

  SELECT curso_id, COALESCE(intentos_permitidos, 1)
    INTO v_curso, v_permitidos
  FROM evaluaciones
  WHERE id = p_evaluacion_id AND estado = 'publicado';

  IF v_curso IS NULL THEN
    RAISE EXCEPTION 'Evaluacion no disponible';
  END IF;

  SELECT id INTO v_matricula
  FROM matriculas
  WHERE user_id = v_uid AND curso_id = v_curso AND estado = 'activa'
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_matricula IS NULL THEN
    RAISE EXCEPTION 'No tienes matricula activa en este curso';
  END IF;

  SELECT id INTO v_intento
  FROM intentos_evaluacion
  WHERE evaluacion_id = p_evaluacion_id AND matricula_id = v_matricula AND estado = 'en_curso'
  ORDER BY iniciado_at DESC
  LIMIT 1;

  IF v_intento IS NOT NULL THEN
    RETURN v_intento;
  END IF;

  SELECT count(*) INTO v_usados
  FROM intentos_evaluacion
  WHERE evaluacion_id = p_evaluacion_id AND matricula_id = v_matricula;

  IF v_permitidos > 0 AND v_usados >= v_permitidos THEN
    RAISE EXCEPTION 'Ya usaste los intentos permitidos para esta evaluacion';
  END IF;

  INSERT INTO intentos_evaluacion (evaluacion_id, matricula_id, numero_intento, estado)
  VALUES (p_evaluacion_id, v_matricula, (v_usados + 1)::smallint, 'en_curso')
  RETURNING id INTO v_intento;

  RETURN v_intento;
END;
$$;

CREATE OR REPLACE FUNCTION public.obtener_preguntas_intento(p_intento_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_propietario boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM intentos_evaluacion i
    JOIN matriculas m ON m.id = i.matricula_id
    WHERE i.id = p_intento_id AND m.user_id = auth.uid()
  ) INTO v_propietario;

  IF NOT COALESCE(v_propietario, false) THEN
    RAISE EXCEPTION 'Intento no encontrado';
  END IF;

  RETURN COALESCE((
    SELECT jsonb_agg(pregunta_json ORDER BY orden)
    FROM (
      SELECT q.orden, jsonb_build_object(
        'id', q.id,
        'enunciado', q.enunciado,
        'tipo', q.tipo,
        'puntaje', q.puntaje,
        'opciones', CASE
          WHEN q.tipo IN ('opcion_multiple', 'verdadero_falso') THEN COALESCE((
            SELECT jsonb_agg(jsonb_build_object('id', o.id, 'texto', o.texto) ORDER BY o.orden)
            FROM opciones_respuesta o
            WHERE o.pregunta_id = q.id
          ), '[]'::jsonb)
          ELSE '[]'::jsonb
        END
      ) AS pregunta_json
      FROM preguntas q
      JOIN intentos_evaluacion i ON i.evaluacion_id = q.evaluacion_id
      WHERE i.id = p_intento_id
    ) sub
  ), '[]'::jsonb);
END;
$$;

-- ---------------------------------------------------------------------------
-- Calificacion de respuestas abiertas por cobertura de conceptos clave.
-- La respuesta esperada se guarda como opcion correcta de la pregunta.
-- ---------------------------------------------------------------------------
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

-- Detalle del intento para el estudiante: resuelve el texto de la opcion
-- elegida (el cliente nunca lee opciones_respuesta) y no expone es_correcta.
CREATE OR REPLACE FUNCTION public.obtener_resultado_intento(p_intento_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_eval uuid;
  v_nota numeric;
  v_estado text;
  v_mostrar boolean;
  v_detalle jsonb;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;

  SELECT i.evaluacion_id, i.nota_final, i.estado, COALESCE(e.mostrar_respuestas_despues, false)
    INTO v_eval, v_nota, v_estado, v_mostrar
  FROM intentos_evaluacion i
  JOIN matriculas m ON m.id = i.matricula_id
  JOIN evaluaciones e ON e.id = i.evaluacion_id
  WHERE i.id = p_intento_id AND m.user_id = v_uid;

  IF v_eval IS NULL THEN
    RAISE EXCEPTION 'Intento no encontrado';
  END IF;

  IF NOT v_mostrar THEN
    RETURN jsonb_build_object('nota', v_nota, 'estado', v_estado, 'respuestas', '[]'::jsonb);
  END IF;

  SELECT COALESCE(jsonb_agg(detalle ORDER BY orden), '[]'::jsonb)
    INTO v_detalle
  FROM (
    SELECT
      q.orden,
      jsonb_build_object(
        'pregunta', q.enunciado,
        'tipo', q.tipo,
        'puntaje', q.puntaje,
        'obtenido', r.puntaje_obtenido,
        'respuesta', CASE
          WHEN q.tipo IN ('opcion_multiple', 'verdadero_falso') THEN (
            SELECT o.texto FROM opciones_respuesta o
            WHERE o.id = (r.respuesta_json ->> 'valor')::uuid
          )
          ELSE r.respuesta_json ->> 'valor'
        END,
        'esperada', CASE
          WHEN q.tipo IN ('opcion_multiple', 'verdadero_falso') THEN (
            SELECT o.texto FROM opciones_respuesta o
            WHERE o.pregunta_id = q.id AND o.es_correcta
            ORDER BY o.orden LIMIT 1
          )
          ELSE CASE WHEN v_mostrar THEN q.explicacion END
        END
      ) AS detalle
    FROM respuestas r
    JOIN preguntas q ON q.id = r.pregunta_id
    WHERE r.intento_id = p_intento_id
  ) s;

  RETURN jsonb_build_object('nota', v_nota, 'estado', v_estado, 'respuestas', v_detalle);
END;
$$;

REVOKE ALL ON FUNCTION public.normalizar_texto(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cobertura_conceptos(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.obtener_resultado_intento(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.iniciar_intento(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.obtener_preguntas_intento(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.entregar_intento(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obtener_resultado_intento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.iniciar_intento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_preguntas_intento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.entregar_intento(uuid, jsonb) TO authenticated;
