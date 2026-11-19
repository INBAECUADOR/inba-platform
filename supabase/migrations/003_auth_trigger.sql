-- ============================================
-- 003 — ALTA AUTOMATICA DE PERFIL Y ROL
-- ============================================
-- Problema: src/app/register/page.tsx solo llama a auth.signUp(). No existia
-- ningun trigger que creara la fila en public.profiles ni que asignara el rol
-- por defecto, asi que todo usuario nuevo quedaba sin perfil y sin rol
-- (useAuth hacia .from('profiles').single() y recibia null).
--
-- Solucion: trigger AFTER INSERT en auth.users, SECURITY DEFINER para poder
-- escribir en profiles/user_roles aunque el usuario aun no tenga sesion.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, dni)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), split_part(NEW.email, '@', 1)),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'dni', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Rol por defecto: estudiante. Los ascensos los hace un administrador.
  INSERT INTO public.user_roles (user_id, role_id)
  SELECT NEW.id, r.id
  FROM public.roles r
  WHERE r.name = 'estudiante'
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Respaldo: si el trigger no existe en algun entorno, el propio usuario puede
-- crear su perfil inmediatamente despues del registro.
DROP POLICY IF EXISTS "Users insert own profile" ON profiles;
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
