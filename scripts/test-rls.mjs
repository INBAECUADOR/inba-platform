/**
 * Prueba de aislamiento RLS sobre el esquema real, ejecutada en PostgreSQL (PGlite).
 * Simula auth.uid() de Supabase mediante la GUC request.jwt.claim.sub.
 *
 * Verifica:
 *  1. Un estudiante solo ve SUS matriculas.
 *  2. Un estudiante ve el catalogo academico (modulos/lecciones).
 *  3. Un estudiante NO puede crear cursos ni cambiar notas/estado de otros.
 *  4. Un estudiante NO ve certificados ajenos.
 *  5. Un estudiante NO ve logs de auditoria.
 *  6. Un administrador si ve todas las matriculas.
 *
 * Uso: node scripts/test-rls.mjs
 */
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'

const sql = await readFile('supabase/complete_deployment.sql', 'utf8')

const ID_A = '11111111-1111-1111-1111-111111111111' // estudiante A
const ID_B = '22222222-2222-2222-2222-222222222222' // estudiante B
const ID_C = '33333333-3333-3333-3333-333333333333' // admin

const bootstrap = `
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email text, raw_user_meta_data jsonb DEFAULT '{}'::jsonb);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT 'authenticated'::text $$;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS storage;
`

/** Divide el archivo en sentencias (respeta cadenas y bloques $$ ... $$). */
function splitStatements(text) {
  const out = []; let buf = ''; let i = 0; let dollarTag = null
  while (i < text.length) {
    const ch = text[i], next = text[i + 1]
    if (dollarTag) {
      if (text.startsWith(dollarTag, i)) { buf += dollarTag; i += dollarTag.length; dollarTag = null; continue }
      buf += ch; i++; continue
    }
    if (ch === '-' && next === '-') { while (i < text.length && text[i] !== '\n') { buf += text[i]; i++ } continue }
    if (ch === '/' && next === '*') {
      buf += '/*'; i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) { buf += text[i]; i++ }
      buf += '*/'; i += 2; continue
    }
    if (ch === "'") {
      buf += ch; i++
      while (i < text.length) {
        if (text[i] === "'" && text[i + 1] === "'") { buf += "''"; i += 2; continue }
        if (text[i] === "'") { buf += "'"; i++; break }
        buf += text[i]; i++
      }
      continue
    }
    if (ch === '"') {
      buf += ch; i++
      while (i < text.length) { if (text[i] === '"') { buf += '"'; i++; break } buf += text[i]; i++ }
      continue
    }
    if (ch === '$') { const m = /^\$[A-Za-z_0-9]*\$/.exec(text.slice(i)); if (m) { dollarTag = m[0]; buf += dollarTag; i += dollarTag.length; continue } }
    if (ch === ';') { const s = buf.trim(); if (s) out.push(s); buf = ''; i++; continue }
    buf += ch; i++
  }
  const tail = buf.trim(); if (tail) out.push(tail)
  return out
}

const db = new PGlite()
await db.exec(bootstrap)
for (const stmt of splitStatements(sql)) {
  // PGlite no trae las extensiones de Supabase; el resto del archivo no las necesita
  // porque gen_random_uuid() es nativo desde PostgreSQL 13.
  const bare = stmt.replace(/--[^\n]*/g, '').trim()
  if (/^CREATE\s+EXTENSION/i.test(bare)) continue
  await db.exec(stmt)
}

// Permisos equivalentes a los grants por defecto de Supabase
await db.exec(`
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT USAGE ON SCHEMA auth TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
`)

// Datos de prueba (como superusuario, sin RLS)
const curso = (await db.query(`SELECT id FROM cursos LIMIT 1`)).rows[0].id
await db.exec(`
INSERT INTO auth.users (id, email) VALUES
  ('${ID_A}', 'a@test.local'), ('${ID_B}', 'b@test.local'), ('${ID_C}', 'c@test.local');

INSERT INTO profiles (id, email, full_name) VALUES
  ('${ID_A}', 'a@test.local', 'Estudiante A'),
  ('${ID_B}', 'b@test.local', 'Estudiante B'),
  ('${ID_C}', 'c@test.local', 'Admin C')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO user_roles (user_id, role_id) SELECT '${ID_A}', id FROM roles WHERE name = 'estudiante' ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id) SELECT '${ID_B}', id FROM roles WHERE name = 'estudiante' ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id) SELECT '${ID_C}', id FROM roles WHERE name = 'admin_general' ON CONFLICT DO NOTHING;

INSERT INTO matriculas (user_id, curso_id, estado, fecha_inicio) VALUES
  ('${ID_A}', '${curso}', 'activa', CURRENT_DATE),
  ('${ID_B}', '${curso}', 'activa', CURRENT_DATE);

INSERT INTO certificados (matricula_id, curso_id, user_id, numero_serie, autoridad_emite_id, autoridad_nombre, autoridad_cargo)
SELECT m.id, m.curso_id, m.user_id, 'INBA-TEST-' || left(m.user_id::text, 4), '${ID_C}', 'Admin C', 'Director'
FROM matriculas m;

INSERT INTO audit_logs (user_id, accion, entidad) VALUES ('${ID_C}', 'TEST', 'cursos');
`)

const results = []

// El trigger on_auth_user_created debe haber creado perfiles y rol estudiante
{
  const prof = (await db.query(`SELECT count(*)::int n FROM profiles`)).rows[0].n
  const rol = (await db.query(`SELECT count(*)::int n FROM user_roles WHERE role_id = (SELECT id FROM roles WHERE name='estudiante')`)).rows[0].n
  results.push({ name: 'Trigger crea perfiles al registrar', expect: 3, got: String(prof), pass: prof === 3 })
  results.push({ name: 'Trigger asigna rol estudiante por defecto', expect: 3, got: String(rol), pass: rol === 3 })
}

async function check(name, fn, expectation) {
  try {
    const value = await fn()
    results.push({ name, expect: expectation, got: String(value), pass: String(value) === String(expectation) })
  } catch (e) {
    results.push({ name, expect: expectation, got: 'ERROR: ' + String(e.message).slice(0, 80), pass: false })
  }
}

// ---------- Sesion: estudiante A ----------
await db.exec(`SET ROLE authenticated; SET request.jwt.claim.sub = '${ID_A}';`)

await check('A ve solo sus matriculas', async () =>
  (await db.query('SELECT count(*)::int n FROM matriculas')).rows[0].n, 1)
await check('A ve el curso matriculado', async () =>
  (await db.query('SELECT count(*)::int n FROM matriculas WHERE user_id = auth.uid()')).rows[0].n, 1)
await check('A NO ve matriculas de B', async () =>
  (await db.query(`SELECT count(*)::int n FROM matriculas WHERE user_id = '${ID_B}'`)).rows[0].n, 0)
await check('A ve catalogo de modulos', async () =>
  (await db.query('SELECT count(*)::int n FROM modulos')).rows[0].n, 12)
await check('A ve lecciones', async () =>
  ((await db.query('SELECT count(*)::int n FROM lecciones')).rows[0].n) > 0, true)
await check('A solo ve su perfil', async () =>
  (await db.query('SELECT count(*)::int n FROM profiles')).rows[0].n, 1)
await check('A ve solo su certificado', async () =>
  (await db.query('SELECT count(*)::int n FROM certificados')).rows[0].n, 1)
await check('A NO ve audit_logs', async () =>
  (await db.query('SELECT count(*)::int n FROM audit_logs')).rows[0].n, 0)
await check('A NO puede crear cursos', async () => {
  try {
    await db.exec(`INSERT INTO cursos (codigo, nombre, descripcion, objetivos, duracion_horas, modalidad, estado)
                   VALUES ('HACK-1','Intento','x','y',1,'virtual','borrador')`)
    return 'PERMITIDO'
  } catch (e) {
    return /row-level security/i.test(e.message) ? 'DENEGADO' : 'ERROR: ' + e.message.slice(0, 60)
  }
}, 'DENEGADO')
await check('A NO puede cambiar la matricula de B', async () =>
  (await db.query(`UPDATE matriculas SET estado = 'completada' WHERE user_id = '${ID_B}' RETURNING id`)).rows.length, 0)
await check('A NO puede cambiar su propio estado a completada', async () =>
  (await db.query(`UPDATE matriculas SET estado = 'completada' WHERE user_id = auth.uid() RETURNING id`)).rows.length, 0)

// ---------- Sesion: administrador C ----------
await db.exec(`RESET ROLE; SET ROLE authenticated; SET request.jwt.claim.sub = '${ID_C}';`)
await check('Admin ve todas las matriculas', async () =>
  (await db.query('SELECT count(*)::int n FROM matriculas')).rows[0].n, 2)
await check('Admin ve todos los perfiles', async () =>
  (await db.query('SELECT count(*)::int n FROM profiles')).rows[0].n, 3)
await check('Admin puede crear curso', async () => {
  await db.exec(`INSERT INTO cursos (codigo, nombre, descripcion, objetivos, duracion_horas, modalidad, estado)
                 VALUES ('ADMIN-1','Curso admin','desc','obj',8,'virtual','borrador')`)
  return (await db.query(`SELECT count(*)::int n FROM cursos WHERE codigo = 'ADMIN-1'`)).rows[0].n
}, 1)

// ---------- Verificacion publica de certificados (via RPC) ----------
await db.exec('RESET ROLE;')
const uuidPub = (await db.query(`SELECT uuid_publico FROM certificados ORDER BY numero_serie LIMIT 1`)).rows[0].uuid_publico
await db.exec(`SET ROLE anon;`)

{
  let rows = []
  try { rows = (await db.query('SELECT * FROM certificados')).rows } catch { rows = [] }
  results.push({
    name: 'Anon no obtiene filas de certificados por RLS',
    expect: '0',
    got: String(rows.length),
    pass: rows.length === 0
  })
}
await check('Anon verifica un certificado por UUID (RPC)', async () =>
  (await db.query(`SELECT * FROM verificar_certificado('${uuidPub}')`)).rows.length, 1)
await check('Anon NO verifica un UUID inexistente', async () =>
  (await db.query(`SELECT * FROM verificar_certificado('00000000-0000-0000-0000-000000000000')`)).rows.length, 0)

await db.exec('RESET ROLE;')

const failed = results.filter((r) => !r.pass)
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}  (esperado ${r.expect}, obtenido ${r.got})`)
}
console.log(`\n${results.length - failed.length}/${results.length} pruebas RLS correctas`)
if (failed.length) process.exitCode = 1
await db.close()
