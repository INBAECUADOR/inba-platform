/**
 * Aprovisiona Supabase + Vercel para INBA Ecuador usando la API de gestion.
 *
 * Requiere un Personal Access Token de Supabase (sbp_...) en la variable
 * de entorno SUPABASE_ACCESS_TOKEN. NUNCA se escribe en disco ni en el repo.
 *
 * Uso:
 *   $env:SUPABASE_ACCESS_TOKEN = "sbp_..."      # PowerShell
 *   node supabase/apply.mjs                     # usa/crea el proyecto y aplica el SQL
 *   node supabase/apply.mjs --create            # crea un proyecto nuevo si no hay ninguno
 *
 * Pasos:
 *   1. Lista proyectos de la cuenta.
 *   2. Reutiliza el proyecto existente o crea uno (plan free, us-east-1).
 *   3. Ejecuta supabase/complete_deployment.sql via Management API.
 *   4. Obtiene URL + claves (publishable/secret).
 *   5. Configura las variables de entorno de Vercel (production/preview/dev).
 *
 * No borra datos: el SQL solo crea objetos (CREATE TABLE sin DROP).
 */
import { readFile } from 'node:fs/promises'

const API = 'https://api.supabase.com/v1'
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN

if (!TOKEN || !TOKEN.startsWith('sbp_')) {
  console.error('Falta SUPABASE_ACCESS_TOKEN (debe empezar con sbp_).')
  console.error('Genera uno en https://supabase.com/dashboard/account/tokens')
  process.exit(1)
}

const projectName = process.env.INBA_PROJECT_NAME ?? 'inba-ecuador'
const region = process.env.INBA_REGION ?? 'us-east-1'
const createIfMissing = process.argv.includes('--create')
// --new fuerza la creacion de un proyecto limpio aunque ya existan otros.
const forceNew = process.argv.includes('--new')

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  })
  const text = await res.text()
  let body
  try { body = text ? JSON.parse(text) : null } catch { body = text }
  if (!res.ok) {
    const msg = body?.message ?? body?.error ?? text
    throw new Error(`${init.method ?? 'GET'} ${path} -> ${res.status}: ${msg}`)
  }
  return body
}

const log = (...a) => console.log(...a)

/**
 * Un proyecto pausado (INACTIVE) no responde por DNS ni acepta consultas.
 * Esperamos a que Supabase lo levante antes de tocar la base.
 */
async function waitForHealthy(project) {
  if (project.status === 'ACTIVE_HEALTHY') return project

  log(`  Esperando a que el proyecto este ACTIVE_HEALTHY (ahora: ${project.status})...`)
  let last = project
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 5000))
    last = await api(`/projects/${project.id}`)
    if (last.status === 'ACTIVE_HEALTHY') {
      log('  Proyecto activo.')
      return last
    }
    process.stdout.write('.')
  }
  throw new Error(
    `El proyecto ${project.id} no llego a ACTIVE_HEALTHY (estado: ${last.status}). ` +
      'Restauraciones pausadas pueden tardar varios minutos: vuelve a ejecutar el script.'
  )
}

// 1. Proyectos existentes
log('→ Consultando proyectos de la cuenta...')
const projects = await api('/projects')
if (!Array.isArray(projects)) throw new Error('Respuesta inesperada de /projects')

let project = forceNew ? null : (projects.find((p) => p.name === projectName) ?? projects[0])

if (forceNew || (!project && createIfMissing)) {
  log('→ No hay proyectos. Creando uno nuevo (plan free)...')
  const orgs = await api('/organizations')
  if (!orgs?.length) throw new Error('La cuenta no tiene organizaciones.')
  const dbPass = `Inba${Math.random().toString(36).slice(2, 10)}${Date.now().toString().slice(-4)}!A`
  project = await api('/projects', {
    method: 'POST',
    body: JSON.stringify({
      organization_id: orgs[0].id,
      name: projectName,
      db_pass: dbPass,
      region,
      plan: 'free',
    }),
  })
  log(`  Proyecto creado: ${project.id} (${project.name})`)
  // La contrasena de la base no es necesaria para el flujo (se usa la API de
  // gestion y la anon key) y no debe quedar en la salida. Se puede guardar en
  // un archivo fuera del repo pasando INBA_DB_PASS_FILE.
  if (process.env.INBA_DB_PASS_FILE) {
    const { writeFile } = await import('node:fs/promises')
    await writeFile(process.env.INBA_DB_PASS_FILE, dbPass, 'utf8')
    log(`  db_pass guardada en ${process.env.INBA_DB_PASS_FILE}`)
  } else {
    log('  db_pass generada y NO mostrada (usa el dashboard si necesitas resetearla).')
  }
  project = await waitForHealthy(project)
}

if (!project) {
  console.error('No hay proyectos y no se paso --create.')
  process.exit(1)
}

const ref = project.id
log(`→ Proyecto: ${project.name} (${ref}) estado=${project.status}`)
project = await waitForHealthy(project)

// 2. Aplicar el SQL
log('→ Aplicando supabase/complete_deployment.sql ...')
const sql = await readFile('supabase/complete_deployment.sql', 'utf8')
try {
  await api(`/projects/${ref}/database/query`, {
    method: 'POST',
    body: JSON.stringify({ query: sql }),
  })
  log('  SQL aplicado sin errores.')
} catch (e) {
  console.error('  El SQL fallo:', e.message)
  console.error('  Si el esquema ya existia, usa una base nueva o revisa el objeto conflictivo.')
  process.exit(1)
}

// 3. Claves
log('→ Obteniendo claves del proyecto...')
const keys = await api(`/projects/${ref}/api-keys?reveal=true`)
// Preferimos las claves JWT legacy (anon / service_role): supabase-js 2.39
// y @supabase/ssr 0.1 no soportan las nuevas sb_publishable_/sb_secret_.
const publishable =
  keys.find((k) => k.name === 'anon')?.api_key ??
  keys.find((k) => k.type === 'publishable')?.api_key
const secret =
  keys.find((k) => k.name === 'service_role')?.api_key ??
  keys.find((k) => k.type === 'secret')?.api_key
if (!publishable || !secret) throw new Error('No se pudieron leer las claves del proyecto.')

const url = `https://${ref}.supabase.co`
log(`  URL: ${url}`)
log(`  publishable: ${publishable.slice(0, 12)}...`)
log(`  secret:      ${secret.slice(0, 10)}... (no se imprime completo)`)

// 4. Vercel
const { spawnSync } = await import('node:child_process')
const envVars = {
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: publishable,
  SUPABASE_SERVICE_ROLE_KEY: secret,
  NEXT_PUBLIC_APP_URL: 'https://inba-platform.vercel.app',
}

log('→ Configurando variables de entorno en Vercel...')
for (const [name, value] of Object.entries(envVars)) {
  for (const env of ['production', 'preview', 'development']) {
    spawnSync('npx', ['vercel', 'env', 'rm', name, env, '--yes'], { stdio: 'ignore', shell: true })
    const r = spawnSync('npx', ['vercel', 'env', 'add', name, env, '--type', 'config', '--force', '--yes'], {
      input: value,
      encoding: 'utf8',
      shell: true,
    })
    if (r.status !== 0) log(`  ! ${name} (${env}): ${(r.stderr || r.stdout || '').trim().slice(0, 120)}`)
  }
  log(`  ${name} configurada`)
}

log('→ Desplegando a produccion...')
const deploy = spawnSync('npx', ['vercel', '--prod', '--yes'], { encoding: 'utf8', shell: true })
log(deploy.stdout?.slice(-400) ?? '')
if (deploy.status !== 0) log(deploy.stderr?.slice(-400) ?? '')

log('\nListo. Verifica:')
log('  https://inba-platform.vercel.app/api/health')
log('  https://inba-platform.vercel.app/login')
