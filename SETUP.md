# INBA Ecuador — Base de datos y despliegue

Estado verificado el **2026-11-18**.

---

## 1. Archivo único de base de datos

`supabase/complete_deployment.sql` contiene, en orden y ya validado:

1. Esquema completo (34 tablas, 53 índices, 27 triggers, 5 funciones).
2. Helper de autorización `is_admin()` / `is_staff()` (SECURITY DEFINER).
3. Políticas RLS (70) para **todas** las tablas con RLS activo.
4. RPC `verificar_certificado(uuid)` para verificación pública.
5. Semillas del curso, 12 módulos, 52 lecciones, 12 evaluaciones y CMS.

Los archivos `supabase/seed/*.sql` y `supabase/migrations/001_schema.sql` quedaron
**obsoletos**: contienen errores que ya están corregidos en el archivo único
(falta `;` en `noticias`, `'texto'` duplicado en `lecciones`, recursión infinita
en la política de `user_roles`, tema duplicado en el Módulo 5, `docente_id`
obligatorio sin docente sembrado).

### Aplicar

**Opción A — automática (recomendada)**

```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_..."   # https://supabase.com/dashboard/account/tokens
node supabase/apply.mjs --create          # crea proyecto si no existe, aplica SQL y configura Vercel
```

**Opción B — manual**

Supabase Dashboard → SQL Editor → pegar el contenido completo de
`supabase/complete_deployment.sql` → Run. Debe terminar sin errores.

### Validación local (sin red)

```powershell
node scripts/validate-sql.mjs      # ejecuta el SQL en PostgreSQL (WASM)
node scripts/test-rls.mjs          # 17 pruebas de aislamiento por rol
```

---

## 2. Roles y usuarios

Roles sembrados: `admin_general`, `admin_academico`, `docente`, `estudiante`, `afiliado`.

Después de crear los usuarios en **Authentication → Users**, asignar roles:

```sql
-- ADMIN
INSERT INTO profiles (id, email, full_name)
SELECT id, email, 'Administrador INBA' FROM auth.users WHERE email = 'admin@inbaecuador.org'
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u, roles r
WHERE u.email = 'admin@inbaecuador.org' AND r.name = 'admin_general'
ON CONFLICT DO NOTHING;

-- ESTUDIANTE
INSERT INTO profiles (id, email, full_name)
SELECT id, email, 'Estudiante Demo' FROM auth.users WHERE email = 'estudiante@test.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u, roles r
WHERE u.email = 'estudiante@test.com' AND r.name = 'estudiante'
ON CONFLICT DO NOTHING;

INSERT INTO matriculas (user_id, curso_id, estado, fecha_inicio)
SELECT u.id, c.id, 'activa', CURRENT_DATE
FROM auth.users u, cursos c
WHERE u.email = 'estudiante@test.com' AND c.codigo = 'CERT-ENT-2026'
ON CONFLICT DO NOTHING;
```

> No usar contraseñas de ejemplo en producción. Generar contraseñas aleatorias
> y entregarlas por canal privado.

---

## 3. Variables de entorno

| Variable | Dónde | Visible en cliente |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + `.env.local` | Sí |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + `.env.local` | Sí (publishable) |
| `SUPABASE_SERVICE_ROLE_KEY` | **solo Vercel (servidor)** | **No** |
| `NEXT_PUBLIC_APP_URL` | Vercel | Sí |

`SUPABASE_SERVICE_ROLE_KEY` nunca debe llevar prefijo `NEXT_PUBLIC_`.

---

## 4. Verificación

```powershell
curl https://inba-platform.vercel.app/api/health
```

Respuesta esperada:

```json
{ "ok": true, "supabase_host": "<ref>.supabase.co", "cursos": 1, "roles": ["admin_general", "..."] }
```

`ok: false` indica exactamente qué falla (`missing_env`, `db_error`, `unreachable`).

Rutas a comprobar:

- `/login` → inicio de sesión.
- `/app/admin` → solo `admin_general` (si no, muestra “Acceso denegado”).
- `/app/estudiante` → panel del estudiante.
- `/app/estudiante/cursos` → curso matriculado y 12 módulos.
- `/app/estudiante/evaluaciones` → evaluaciones publicadas.
- `/verificar-certificado/<uuid>` → verificación pública por RPC.
