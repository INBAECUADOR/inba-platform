/**
 * Aplica correcciones verificadas sobre supabase/complete_deployment.sql.
 * Idempotente: si ya esta corregido, los contadores salen en 0.
 * Uso: node scripts/fix-sql.mjs [archivo]
 */
import { readFile, writeFile } from 'node:fs/promises'

const file = process.argv[2] ?? 'supabase/complete_deployment.sql'
let sql = await readFile(file, 'utf8')
const report = []

function replace(label, pattern, replacement) {
  const before = sql
  sql = sql.replace(pattern, replacement)
  const changed = before === sql ? 0 : (before.match(pattern) || []).length
  report.push(`${label}: ${changed}`)
}

// 1. Falta ';' al cerrar la tabla noticias (rompia todos los objetos CMS)
replace(
  'P1 punto y coma en noticias',
  /(updated_at TIMESTAMPTZ DEFAULT NOW\(\)\r?\n)\)(\r?\n\r?\nCREATE TABLE documentos_institucionales \()/,
  '$1);$2'
)

// 2. Declaracion faltante de v_modulo_id en el primer bloque DO
replace(
  'P2 declarar v_modulo_id',
  /DECLARE\r?\n  v_curso_id UUID;\r?\nBEGIN/g,
  'DECLARE\r\n  v_curso_id UUID;\r\n  v_modulo_id UUID;\r\n  v_eval_id UUID;\r\nBEGIN'
)

// 2b. Bloques que ya tienen v_modulo_id pero usan v_eval_id sin declararlo
replace(
  'P2b declarar v_eval_id',
  /DECLARE\r?\n  v_curso_id UUID;\r?\n  v_modulo_id UUID;\r?\nBEGIN/g,
  'DECLARE\r\n  v_curso_id UUID;\r\n  v_modulo_id UUID;\r\n  v_eval_id UUID;\r\nBEGIN'
)

// 2c. SELECT ambiguo: cursos.id y modulos.id se llaman igual
replace('P2c SELECT c.id', /SELECT id, m\.id,/g, 'SELECT c.id, m.id,')

// 3. INSERT INTO lecciones tenia un 'texto' extra (9 valores para 8 columnas)
{
  const before = sql
  sql = sql.replace(/\r?\n(\s*)'texto', TRUE,/g, '\r\n$1TRUE,')
  report.push(`P3 'texto' duplicado en lecciones: ${(before.match(/\r?\n\s*'texto', TRUE,/g) || []).length}`)
}

// 4. Modulo 5: dos temas con orden 2 -> renumerar 3,4,5 y sus lecciones
const S = 'AND orden = 5\\) AND t\\.orden = '
;[
  ["'Periodización y caso práctico estancamiento',[\\s\\S]*?" + S + '4;', 5],
  ["'Descanso, frecuencia y progresión',[\\s\\S]*?" + S + '3;', 4],
  ["'Proximidad al fallo: Refalo 2023',[\\s\\S]*?" + S + '2;', 3]
].forEach(([pat, n]) => {
  const re = new RegExp(pat)
  const before = sql
  sql = sql.replace(re, (m) => m.replace(/t\.orden = \d;/, `t.orden = ${n};`))
  report.push(`P4 leccion modulo 5 -> orden ${n}: ${before === sql ? 0 : 1}`)
})

replace(
  'P5 tema modulo 5 orden 2 -> 3',
  /\(v_modulo_id, 2, 'Proximidad al fallo \(RIR\)'/,
  "(v_modulo_id, 3, 'Proximidad al fallo (RIR)'"
)
replace(
  'P6 tema modulo 5 orden 3 -> 4',
  /\(v_modulo_id, 3, 'Descanso y frecuencia'/,
  "(v_modulo_id, 4, 'Descanso y frecuencia'"
)
replace(
  'P7 tema modulo 5 orden 4 -> 5',
  /\(v_modulo_id, 4, 'Progresión y periodización'/,
  "(v_modulo_id, 5, 'Progresión y periodización'"
)

await writeFile(file, sql, 'utf8')
console.log(report.join('\n'))
