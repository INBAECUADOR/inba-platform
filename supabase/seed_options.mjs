/**
 * Completa las evaluaciones sembradas:
 *  - opciones para preguntas de opcion_multiple y verdadero_falso
 *  - respuesta esperada (para calificacion por conceptos) en respuesta_corta
 *  - habilita mostrar_respuestas_despues y criterio de aprobacion 70/100
 *
 * Es idempotente: borra las opciones de cada pregunta antes de insertarlas.
 */
const token = process.env.SUPABASE_ACCESS_TOKEN
const ref = process.env.SUPABASE_PROJECT_REF
if (!token || !ref) {
  console.error('faltan SUPABASE_ACCESS_TOKEN / SUPABASE_PROJECT_REF')
  process.exit(1)
}

const api = `https://api.supabase.com/v1/projects/${ref}/database/query`

async function query(sql) {
  const res = await fetch(api, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 800)}`)
  return text ? JSON.parse(text) : []
}

const esc = (value) => String(value).replace(/'/g, "''")

const mc = [
  {
    match: 'En qué plano ocurre la flexión de codo',
    opciones: [
      ['Plano sagital', true],
      ['Plano frontal', false],
      ['Plano transversal', false],
      ['Plano oblicuo', false],
    ],
  },
  {
    match: 'Qué ion es el disparador directo',
    opciones: [
      ['Calcio (Ca²⁺)', true],
      ['Sodio (Na⁺)', false],
      ['Potasio (K⁺)', false],
      ['Magnesio (Mg²⁺)', false],
    ],
  },
  {
    match: 'el torque externo es MÁXIMO cuando',
    opciones: [
      ['Con el antebrazo horizontal (90°)', true],
      ['Con el antebrazo vertical, al inicio del movimiento', false],
      ['Con el brazo completamente extendido y pegado al torso', false],
      ['Al final de la fase concéntrica, con la mancuerna arriba', false],
    ],
  },
  {
    match: 'relación volumen-hipertrofia muestra',
    opciones: [
      ['Rendimientos decrecientes y respuesta individual', true],
      ['Una relación lineal sin límite superior', false],
      ['Que más volumen siempre produce más hipertrofia', false],
      ['Que el volumen no influye en la hipertrofia', false],
    ],
  },
  {
    match: 'método es gold standard para composición corporal',
    opciones: [
      ['DEXA (absorciometría de rayos X de doble energía)', true],
      ['Báscula de bioimpedancia', false],
      ['Índice de masa corporal (IMC)', false],
      ['Plicómetro de tres pliegues', false],
    ],
  },
  {
    match: 'la ingesta proteica donde el beneficio se estabiliza',
    opciones: [
      ['1.6 g/kg/d', true],
      ['0.8 g/kg/d', false],
      ['2.5 g/kg/d', false],
      ['3.5 g/kg/d', false],
    ],
  },
  {
    match: 'sueño <6h en composición corporal',
    opciones: [
      ['Mayor pérdida de masa magra y mayor retención de grasa', true],
      ['Mayor pérdida de grasa y preservación de masa magra', false],
      ['Sin efecto sobre la composición corporal', false],
      ['Mayor pérdida de grasa y de masa magra por igual', false],
    ],
  },
  {
    match: 'certificación reduce riesgo de contaminación',
    opciones: [
      ['Informed Sport / NSF Certified for Sport / Cologne List', true],
      ["Etiqueta 'natural' o 'herbal'", false],
      ['Certificación orgánica del producto', false],
      ['Registro sanitario del país de fabricación', false],
    ],
  },
  {
    match: 'pose obligatoria masculina clásica',
    opciones: [
      ['Back Double Calves', true],
      ['Front Double Biceps', false],
      ['Side Chest', false],
      ['Back Double Biceps', false],
    ],
  },
]

function opcionesPara(pregunta) {
  if (pregunta.tipo === 'verdadero_falso') {
    const esFalso = /^\s*falso/i.test(pregunta.explicacion || '')
    return [
      ['Verdadero', !esFalso],
      ['Falso', esFalso],
    ]
  }
  if (pregunta.tipo === 'opcion_multiple') {
    const found = mc.find((item) => pregunta.enunciado.includes(item.match))
    if (!found) {
      throw new Error(`sin opciones para: ${pregunta.enunciado}`)
    }
    return found.opciones
  }
  if (pregunta.tipo === 'respuesta_corta') {
    // La opcion no se muestra: se usa como referencia de conceptos clave.
    return [[pregunta.explicacion, true]]
  }
  return []
}

const preguntas = await query(
  "select id, tipo, enunciado, explicacion from preguntas where tipo in ('verdadero_falso','opcion_multiple','respuesta_corta')"
)

const statements = []
let totalOpciones = 0

for (const pregunta of preguntas) {
  const opciones = opcionesPara(pregunta)
  if (opciones.length === 0) continue

  statements.push(`DELETE FROM opciones_respuesta WHERE pregunta_id = '${pregunta.id}';`)

  opciones.forEach(([texto, correcta], index) => {
    statements.push(
      `INSERT INTO opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES ('${pregunta.id}', '${esc(
        texto
      )}', ${correcta ? 'TRUE' : 'FALSE'}, ${index});`
    )
    totalOpciones += 1
  })
}

statements.push(
  "UPDATE evaluaciones SET mostrar_respuestas_despues = TRUE, criterio_aprobacion_json = '{\"nota_minima\":70}'::jsonb WHERE criterio_aprobacion_json IS NULL;"
)

await query(statements.join('\n'))
console.log(`preguntas=${preguntas.length} opciones_insertadas=${totalOpciones}`)

const resumen = await query(
  "select count(*) filter (where o.correcta) as correctas, count(*) as total from (select p.id, bool_or(op.es_correcta) as correcta from preguntas p left join opciones_respuesta op on op.pregunta_id = p.id group by p.id) o"
)
console.log(JSON.stringify(resumen))
