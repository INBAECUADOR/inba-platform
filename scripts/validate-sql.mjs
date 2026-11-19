/**
 * Valida supabase/complete_deployment.sql contra un PostgreSQL real compilado a WASM (PGlite).
 * Simula los objetos que Supabase provee (auth.*, roles anon/authenticated/service_role, storage.*)
 * para detectar errores de sintaxis, dependencias, indices y politicas ANTES de tocar la nube.
 *
 * Uso: node scripts/validate-sql.mjs [archivo.sql]
 */
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const file = process.argv[2] ?? 'supabase/complete_deployment.sql'
const sql = await readFile(path.resolve(file), 'utf8')

/** Divide SQL en sentencias respetando '...', "...", $tag$...$tag$, -- y comentarios de bloque. */
function splitStatements(text) {
  const out = []
  let buf = ''
  let i = 0
  let line = 1
  let startLine = 1
  let dollarTag = null

  while (i < text.length) {
    const ch = text[i]
    const next = text[i + 1]

    if (dollarTag) {
      if (text.startsWith(dollarTag, i)) {
        buf += dollarTag
        i += dollarTag.length
        dollarTag = null
        continue
      }
      if (ch === '\n') line++
      buf += ch
      i++
      continue
    }

    if (ch === '-' && next === '-') {
      while (i < text.length && text[i] !== '\n') { buf += text[i]; i++ }
      continue
    }

    if (ch === '/' && next === '*') {
      buf += '/*'
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) {
        if (text[i] === '\n') line++
        buf += text[i]
        i++
      }
      buf += '*/'
      i += 2
      continue
    }

    if (ch === "'") {
      buf += ch
      i++
      while (i < text.length) {
        if (text[i] === "'" && text[i + 1] === "'") { buf += "''"; i += 2; continue }
        if (text[i] === "'") { buf += "'"; i++; break }
        if (text[i] === '\n') line++
        buf += text[i]
        i++
      }
      continue
    }

    if (ch === '"') {
      buf += ch
      i++
      while (i < text.length) {
        if (text[i] === '"') { buf += '"'; i++; break }
        if (text[i] === '\n') line++
        buf += text[i]
        i++
      }
      continue
    }

    if (ch === '$') {
      const m = /^\$[A-Za-z_0-9]*\$/.exec(text.slice(i))
      if (m) {
        dollarTag = m[0]
        buf += dollarTag
        i += dollarTag.length
        continue
      }
    }

    if (ch === ';') {
      const stmt = buf.trim()
      if (stmt && stripComments(stmt).trim()) {
        out.push({ sql: stmt, line: startLine })
      }
      buf = ''
      i++
      startLine = line
      continue
    }

    if (ch === '\n') line++
    buf += ch
    i++
  }

  const tail = buf.trim()
  if (tail && stripComments(tail).trim()) out.push({ sql: tail, line: startLine })
  return out
}

function stripComments(s) {
  return s.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')
}

const bootstrap = `
CREATE SCHEMA IF NOT EXISTS auth;
CREATE TABLE IF NOT EXISTS auth.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text,
  raw_user_meta_data jsonb DEFAULT '{}'::jsonb
);
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT 'anon'::text $$;
CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
END $$;
CREATE SCHEMA IF NOT EXISTS storage;
CREATE TABLE IF NOT EXISTS storage.buckets (id text PRIMARY KEY, name text, public boolean DEFAULT false);
CREATE TABLE IF NOT EXISTS storage.objects (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), bucket_id text, name text, owner uuid);
CREATE OR REPLACE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql AS $$ SELECT ARRAY[]::text[] $$;
`

const db = new PGlite()
const stmts = splitStatements(sql)
const failures = []
let ok = 0

await db.exec(bootstrap)

for (const [idx, st] of stmts.entries()) {
  const head = stripComments(st.sql).trim().replace(/\s+/g, ' ').slice(0, 70)
  try {
    await db.exec(st.sql)
    ok++
  } catch (err) {
    failures.push({ idx: idx + 1, line: st.line, head, error: err.message.split('\n').slice(0, 3).join(' | ') })
  }
}

const counts = await db.query(`
  SELECT
    (SELECT count(*) FROM pg_tables WHERE schemaname = 'public') AS tablas,
    (SELECT count(*) FROM pg_policies WHERE schemaname = 'public') AS politicas,
    (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public') AS indices,
    (SELECT count(*) FROM pg_trigger WHERE NOT tgisinternal) AS triggers,
    (SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'public') AS funciones
`)

const rows = await db.query(`
  SELECT 'cursos' t, count(*) n FROM cursos
  UNION ALL SELECT 'modulos', count(*) FROM modulos
  UNION ALL SELECT 'lecciones', count(*) FROM lecciones
  UNION ALL SELECT 'roles', count(*) FROM roles
  UNION ALL SELECT 'evaluaciones', count(*) FROM evaluaciones
  UNION ALL SELECT 'paginas_contenido', count(*) FROM paginas_contenido
  UNION ALL SELECT 'noticias', count(*) FROM noticias
`).catch((e) => ({ rows: [{ t: 'error', n: e.message }] }))

console.log(`Archivo: ${file}`)
console.log(`Sentencias: ${stmts.length} | OK: ${ok} | Fallidas: ${failures.length}`)
console.log('Objetos:', JSON.stringify(counts.rows[0]))
console.log('Semillas:', JSON.stringify(rows.rows))

if (failures.length) {
  console.log('\n=== FALLOS ===')
  for (const f of failures.slice(0, 40)) {
    console.log(`#${f.idx} (linea ${f.line}): ${f.head}`)
    console.log(`   -> ${f.error}`)
  }
  process.exitCode = 1
} else {
  console.log('\nSQL VALIDO: todas las sentencias se ejecutaron en PostgreSQL.')
}
await db.close()
