export interface Lectura {
  titulo: string
  autores?: string
  anio?: string
  tipo: 'libro' | 'articulo' | 'guia' | 'web'
  url?: string
  nota?: string
}

export interface GuiaModulo {
  orden: number
  titulo: string
  resumen: string
  conceptosClave: string[]
  lecturas: Lectura[]
}

/**
 * Bibliografía y guía de estudio por módulo.
 * Las lecturas son fuentes reales y verificables: libros de referencia,
 * revisiones científicas y documentos oficiales. Cuando no existe una URL
 * estable se cita la obra para buscarla en biblioteca o buscador académico.
 */
export const biblioteca: Record<number, GuiaModulo> = {
  1: {
    orden: 1,
    titulo: 'Inducción y fundamentos del culturismo natural',
    resumen:
      'Antes de programar hay que entender qué se juzga y bajo qué reglas. Este módulo define el culturismo natural, sus criterios de evaluación y el marco ético de la organización.',
    conceptosClave: [
      'Culturismo natural: desarrollo muscular con ausencia de sustancias prohibidas, verificado por reglas y controles, no por la apariencia.',
      'Criterios de juicio: muscularidad, proporción, simetría, condición física y presentación escénica.',
      'Diferencia entre entrenador, preparador y juez: roles y límites de cada uno.',
      'La evidencia científica como criterio de decisión y el pensamiento crítico frente a modas.',
    ],
    lecturas: [
      {
        titulo: 'Reglamento oficial INBA/PNBA (edición vigente)',
        tipo: 'guia',
        nota: 'Categorías, criterios de juzgamiento, elegibilidad y política antidopaje de la federación.',
      },
      {
        titulo: 'Progression Models in Resistance Training for Healthy Adults',
        autores: 'American College of Sports Medicine',
        anio: '2009',
        tipo: 'articulo',
        url: 'https://journals.lww.com/acsm-msse/fulltext/2009/03000/progression_models_in_resistance_training_for.26.aspx',
        nota: 'Position stand clásico sobre cómo progresar el entrenamiento de fuerza.',
      },
      {
        titulo: 'Science and Development of Muscle Hypertrophy',
        autores: 'Brad Schoenfeld',
        anio: '2020',
        tipo: 'libro',
        nota: 'Manual de referencia que conecta la fisiología con la práctica del entrenamiento.',
      },
      {
        titulo: "NSCA's Essentials of Strength Training and Conditioning",
        autores: 'G. Haff y T. Triplett',
        anio: '2016',
        tipo: 'libro',
        nota: 'Base académica de anatomía, fisiología, programación y evaluación.',
      },
    ],
  },
  2: {
    orden: 2,
    titulo: 'Anatomía aplicada al entrenamiento',
    resumen:
      'El objetivo no es memorizar todos los músculos, sino saber qué estructura produce cada movimiento y cómo adaptar el ejercicio cuando hay dolor o limitaciones.',
    conceptosClave: [
      'Plano y eje del movimiento: sagital (flexión/extensión), frontal (abducción/adducción), transversal (rotación).',
      'Origen, inserción y función: por qué un mismo músculo puede actuar en varios planos.',
      'Principales grupos: pectoral, dorsal ancho, deltoides, bíceps/braquial, tríceps, cuádriceps, isquiosurales, glúteos, erectores y core.',
      'Anatomía palpatoria básica y señales de alarma que obligan a derivar a un profesional de la salud.',
    ],
    lecturas: [
      {
        titulo: 'Atlas de Anatomía Humana',
        autores: 'Frank H. Netter',
        anio: '2019',
        tipo: 'libro',
        nota: 'Referencia visual estándar para estudiar planos, músculos y relaciones anatómicas.',
      },
      {
        titulo: 'Clinically Oriented Anatomy',
        autores: 'K. Moore, A. Dalley y A. Agur',
        anio: '2018',
        tipo: 'libro',
        nota: 'Anatomía con orientación clínica y funcional.',
      },
      {
        titulo: 'Kinesiology of the Musculoskeletal System',
        autores: 'Donald A. Neumann',
        anio: '2017',
        tipo: 'libro',
        nota: 'Kinesiología aplicada: cadenas musculares y análisis del movimiento.',
      },
      {
        titulo: 'Anatomy Trains',
        autores: 'Thomas Myers',
        anio: '2020',
        tipo: 'libro',
        nota: 'Introducción a las cadenas miofasciales (lectura complementaria, no obligatoria).',
      },
    ],
  },
  3: {
    orden: 3,
    titulo: 'Fisiología del ejercicio',
    resumen:
      'Entender cómo se produce la fuerza y cómo el organismo obtiene energía permite explicar por qué funcionan los programas y cuánto tiempo necesitan para mostrar resultados.',
    conceptosClave: [
      'Unidad motora y reclutamiento: el sistema nervioso decide cuánta fuerza producir.',
      'Ciclo de los puentes cruzados y papel del calcio en la contracción muscular.',
      'Sistemas energéticos: fosfágenos, glucólisis y oxidación; predominio según duración e intensidad.',
      'Señalización de la hipertrofia: tensión mecánica, estrés metabólico y daño muscular como estímulos, no como fines.',
      'Adaptaciones neurales tempranas frente a adaptaciones estructurales tardías.',
    ],
    lecturas: [
      {
        titulo: 'Exercise Physiology: Theory and Application to Fitness and Performance',
        autores: 'S. Powers y E. Howley',
        anio: '2018',
        tipo: 'libro',
        nota: 'Texto introductorio completo de fisiología del ejercicio.',
      },
      {
        titulo: 'Skeletal Muscle: Form and Function',
        autores: 'B. MacIntosh, P. Gardiner y A. McComas',
        anio: '2006',
        tipo: 'libro',
        nota: 'Detalle de la estructura y función del músculo esquelético.',
      },
      {
        titulo: 'The Mechanisms of Muscle Hypertrophy and Their Application to Resistance Training',
        autores: 'Brad Schoenfeld',
        anio: '2010',
        tipo: 'articulo',
        url: 'https://journals.lww.com/nsca-jscr/fulltext/2010/10000/the_mechanisms_of_muscle_hypertrophy_and_their.32.aspx',
        nota: 'Revisión clásica sobre tensión mecánica, daño y estrés metabólico.',
      },
    ],
  },
  4: {
    orden: 4,
    titulo: 'Biomecánica y técnica de los ejercicios',
    resumen:
      'La técnica es una herramienta para dirigir la tensión al músculo objetivo con el menor riesgo posible. Aquí se aprende a analizar palancas, torques y rangos de movimiento.',
    conceptosClave: [
      'Palancas y torque: el brazo de momento explica por qué un ejercicio es más difícil en cierto ángulo.',
      'Curva de fuerza y punto de desventaja mecánica (sticking point).',
      'Rango de movimiento útil: recorrido completo con control, sin dolor, adaptado a la persona.',
      'Variantes de agarre, inclinación y posición para cambiar el énfasis muscular.',
      'Errores técnicos frecuentes y cómo corregirlos con instrucciones simples.',
    ],
    lecturas: [
      {
        titulo: 'Fundamentals of Biomechanics',
        autores: 'Duane Knudson',
        anio: '2021',
        tipo: 'libro',
        nota: 'Conceptos de fuerza, torque y análisis del movimiento aplicados al deporte.',
      },
      {
        titulo: 'Basic Biomechanics',
        autores: 'Susan Hall',
        anio: '2018',
        tipo: 'libro',
        nota: 'Introducción con ejemplos de palancas y cargas articulares.',
      },
      {
        titulo: 'Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men',
        autores: 'B. Schoenfeld y colaboradores',
        anio: '2019',
        tipo: 'articulo',
        url: 'https://journals.lww.com/acsm-msse/fulltext/2019/01000/resistance_training_volume_enhances_muscle.11.aspx',
        nota: 'Muestra que más series pueden ayudar a la hipertrofia, con retornos decrecientes.',
      },
    ],
  },
  5: {
    orden: 5,
    titulo: 'Hipertrofia, fuerza y variables del entrenamiento',
    resumen:
      'Las variables (intensidad, volumen, frecuencia, selección, orden, descanso y tempo) son las palancas reales del entrenador. Este módulo enseña a combinarlas con criterio.',
    conceptosClave: [
      'Volumen semanal por grupo muscular y relación dosis-respuesta con rendimientos decrecientes.',
      'Intensidad (%1RM) y proximidad al fallo: la hipertrofia ocurre en un rango amplio si hay esfuerzo suficiente.',
      'Frecuencia: repartir el volumen en 2 sesiones por grupo suele ser más eficiente que acumularlo.',
      'Rango de repeticiones: de 5 a 30+ pueden hipertrofiar si el esfuerzo es cercano al fallo.',
      'Progresión medible: registrar cargas, repeticiones y percepción de esfuerzo.',
    ],
    lecturas: [
      {
        titulo: 'Resistance Training Volume Enhances Muscle Hypertrophy but Not Strength in Trained Men',
        autores: 'B. Schoenfeld y colaboradores',
        anio: '2019',
        tipo: 'articulo',
        url: 'https://journals.lww.com/acsm-msse/fulltext/2019/01000/resistance_training_volume_enhances_muscle.11.aspx',
      },
      {
        titulo: 'Strength and Hypertrophy Adaptations Between Low- vs. High-Load Resistance Training',
        autores: 'B. Schoenfeld, J. Grgic y colaboradores',
        anio: '2017',
        tipo: 'articulo',
        url: 'https://pubmed.ncbi.nlm.nih.gov/28834797/',
        nota: 'Meta-análisis: cargas bajas y altas producen hipertrofia similar si el esfuerzo es alto.',
      },
      {
        titulo: 'How Much Protein Do You Need to Build Muscle?',
        autores: 'Stuart Phillips',
        anio: '2020',
        tipo: 'articulo',
        nota: 'Divulgación científica del autor sobre Proteína y síntesis muscular.',
      },
      {
        titulo: 'Progression Models in Resistance Training for Healthy Adults',
        autores: 'ACSM',
        anio: '2009',
        tipo: 'articulo',
        url: 'https://journals.lww.com/acsm-msse/fulltext/2009/03000/progression_models_in_resistance_training_for.26.aspx',
      },
    ],
  },
  6: {
    orden: 6,
    titulo: 'Diseño de programas y periodización',
    resumen:
      'Un programa es una hipótesis medible: se parte de una evaluación, se define un objetivo, se planifican semanas y se ajusta según resultados.',
    conceptosClave: [
      'Evaluación inicial: historial, disponibilidad, técnica, movilidad y equipamiento.',
      'Objetivos SMART y criterios de éxito medibles.',
      'Periodización: progresión lineal, por bloques y autorregulada (RPE/RIR).',
      'Descarga (deload) programada y manejo de la fatiga acumulada.',
      'Adherencia: planes simples y sostenibles superan planes ideales imposibles de cumplir.',
    ],
    lecturas: [
      {
        titulo: 'Periodization: Theory and Methodology of Training',
        autores: 'Tudor Bompa y Carlo Buzzichelli',
        anio: '2018',
        tipo: 'libro',
        nota: 'Referencia clásica de planificación deportiva.',
      },
      {
        titulo: 'Scientific Principles of Strength Training',
        autores: 'Mike Israetel, James Hoffmann y Chad Wesley Smith',
        anio: '2016',
        tipo: 'libro',
        nota: 'Aplicación práctica de volumen, intensidad y frecuencia.',
      },
      {
        titulo: 'Recommendations for natural bodybuilding contest preparation: resistance and cardiovascular training',
        autores: 'Eric Helms y colaboradores',
        anio: '2015',
        tipo: 'articulo',
        nota: 'Guía específica para preparación natural de competición.',
      },
    ],
  },
  7: {
    orden: 7,
    titulo: 'Evaluación física y seguimiento del atleta',
    resumen:
      'Lo que no se mide no se puede ajustar. El módulo distingue mediciones útiles de datos decorativos y muestra cómo interpretarlas sin sobreestimar su precisión.',
    conceptosClave: [
      'Composición corporal: DEXA como referencia; bioimpedancia y pliegues como estimaciones con error.',
      'Fuerza y rendimiento: tests validados, reproducibles y seguros.',
      'Registro de entrenamiento y seguimiento de la carga (volumen × intensidad).',
      'Medidas de proceso (adherencia, sueño, pasos) frente a medidas de resultado (peso, perímetros).',
      'Interpretación de tendencias y no de mediciones aisladas.',
    ],
    lecturas: [
      {
        titulo: 'Methodology Review: Using Dual-Energy X-Ray Absorptiometry (DXA) for the Assessment of Body Composition in Athletes and Active People',
        autores: 'A. Nana y colaboradores',
        anio: '2015',
        tipo: 'articulo',
        url: 'https://pubmed.ncbi.nlm.nih.gov/25605520/',
      },
      {
        titulo: 'Current Status of Body Composition Assessment in Sport',
        autores: 'T. Ackland y colaboradores',
        anio: '2012',
        tipo: 'articulo',
        url: 'https://pubmed.ncbi.nlm.nih.gov/22228165/',
        nota: 'Revisión de métodos, supuestos y limitaciones.',
      },
      {
        titulo: 'Human Body Composition',
        autores: 'S. Heymsfield y colaboradores',
        anio: '2005',
        tipo: 'libro',
        nota: 'Base conceptual de los modelos de composición corporal.',
      },
    ],
  },
  8: {
    orden: 8,
    titulo: 'Fundamentos de nutrición deportiva',
    resumen:
      'El entrenador no prescribe dietas: educa, detecta señales de riesgo y deriva a nutricionistas. Aquí se estudian los principios que sí corresponden a su rol.',
    conceptosClave: [
      'Balance energético y composición corporal: déficit/superávit moderado y ritmo de cambio.',
      'Proteína: 1.6 g/kg/día como referencia con beneficio estabilizado; distribución en 3-4 comidas.',
      'Carbohidratos como principal combustible del entrenamiento intenso y su papel en el rendimiento.',
      'Grasas, fibra, micronutrientes e hidratación.',
      'Límites del rol: no diagnosticar, no prescribir dietas clínicas, derivar.',
    ],
    lecturas: [
      {
        titulo: 'International Society of Sports Nutrition Position Stand: Protein and Exercise',
        autores: 'R. Jäger y colaboradores',
        anio: '2017',
        tipo: 'articulo',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8',
      },
      {
        titulo: 'A Systematic Review, Meta-Analysis and Meta-Regression of the Effect of Protein Supplementation on Resistance Training-Induced Gains in Muscle Mass and Strength',
        autores: 'R. Morton y colaboradores',
        anio: '2018',
        tipo: 'articulo',
        url: 'https://bjsm.bmj.com/content/52/6/376',
        nota: 'El punto de beneficio se estabiliza alrededor de 1.6 g/kg/día.',
      },
      {
        titulo: 'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation',
        autores: 'E. Helms, A. Aragon y P. Fitschen',
        anio: '2014',
        tipo: 'articulo',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/1550-2783-11-20',
      },
    ],
  },
  9: {
    orden: 9,
    titulo: 'Recuperación, sueño y manejo de la carga',
    resumen:
      'El entrenamiento es el estímulo; la adaptación ocurre en la recuperación. Dormir y gestionar la carga son parte del programa, no un extra.',
    conceptosClave: [
      'Sueño: 7-9 horas para adultos; la restricción afecta rendimiento, apetito y recuperación.',
      'Estrés y sistema nervioso: señales de fatiga acumulada y autorregulación.',
      'Carga externa (kg × reps) frente a carga interna (RPE, frecuencia cardíaca).',
      'Estrategias: deload, reducción de volumen, días de descanso activo, higiene del sueño.',
      'Señales que requieren derivación médica.',
    ],
    lecturas: [
      {
        titulo: 'Sleep and Athletic Performance: The Effects of Sleep Loss on Exercise Performance, and Physiological and Cognitive Responses to Exercise',
        autores: 'H. Fullagar y colaboradores',
        anio: '2015',
        tipo: 'articulo',
        nota: 'Revisión de los efectos de la pérdida de sueño en el rendimiento.',
      },
      {
        titulo: 'Sleep Hygiene and Recovery Strategies in Elite Soccer Players',
        autores: 'M. Nedelec y colaboradores',
        anio: '2015',
        tipo: 'articulo',
        nota: 'Protocolos prácticos de higiene del sueño aplicables a cualquier deporte.',
      },
      {
        titulo: 'Monitoring Training Load to Understand Fatigue in Athletes',
        autores: 'S. Halson',
        anio: '2014',
        tipo: 'articulo',
        nota: 'Cómo medir y interpretar la carga interna y externa.',
      },
    ],
  },
  10: {
    orden: 10,
    titulo: 'Suplementación, antidopaje e integridad deportiva',
    resumen:
      'La mayoría de suplementos no son necesarios y algunos implican riesgo de dopaje. El entrenador debe enseñar a leer etiquetas, exigir certificaciones y conocer la lista WADA.',
    conceptosClave: [
      'Lista de Prohibiciones WADA: se actualiza cada año y aplica en y fuera de competición.',
      'Riesgo de contaminación: buscar sellos Informed Sport, NSF Certified for Sport o Cologne List.',
      'Suplementos con evidencia razonable: creatina monohidrato, cafeína, proteína, beta-alanina en contextos concretos.',
      'Responsabilidad estricta del atleta: lo que entra al cuerpo es su responsabilidad.',
      'Señales de publicidad engañosa y promesas de resultados rápidos.',
    ],
    lecturas: [
      {
        titulo: 'Lista de Prohibiciones de la WADA',
        autores: 'World Anti-Doping Agency',
        tipo: 'web',
        url: 'https://www.wada-ama.org/en/prohibited-list',
        nota: 'Documento oficial de consulta obligatoria antes de recomendar cualquier producto.',
      },
      {
        titulo: 'IOC Consensus Statement: Dietary Supplements and the High-Performance Athlete',
        autores: 'R. Maughan y colaboradores',
        anio: '2018',
        tipo: 'articulo',
        url: 'https://bjsm.bmj.com/content/52/7/439',
      },
      {
        titulo: 'International Society of Sports Nutrition Position Stand: Safety and Efficacy of Creatine Supplementation',
        autores: 'R. Kreider y colaboradores',
        anio: '2017',
        tipo: 'articulo',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0173-z',
      },
      {
        titulo: 'Informed Sport — certificación de suplementos analizados por lote',
        tipo: 'web',
        url: 'https://www.informed-sport.com',
      },
      {
        titulo: 'NSF Certified for Sport',
        tipo: 'web',
        url: 'https://www.nsfsport.com',
      },
    ],
  },
  11: {
    orden: 11,
    titulo: 'Posing, categorías y preparación competitiva',
    resumen:
      'La puesta en escena es parte del deporte: se entrena, se ensaya y se planifica. El módulo cubre poses obligatorias, transiciones y el calendario de preparación.',
    conceptosClave: [
      'Poses obligatorias por categoría y orden de comparación.',
      'Transiciones fluidas y control de la respiración.',
      'Criterios de juzgamiento: muscularidad, proporción, simetría, condición y presentación.',
      'Planificación: fecha objetivo, duración de preparación y puntos de control.',
      'Riesgos de una preparación agresiva: pérdida de masa magra, fatiga y salud hormonal.',
    ],
    lecturas: [
      {
        titulo: 'Reglamento oficial INBA/PNBA: poses y criterios de juzgamiento',
        tipo: 'guia',
        nota: 'Define las poses obligatorias y el orden por categoría.',
      },
      {
        titulo: 'Evidence-based recommendations for natural bodybuilding contest preparation: nutrition and supplementation',
        autores: 'E. Helms, A. Aragon y P. Fitschen',
        anio: '2014',
        tipo: 'articulo',
        url: 'https://jissn.biomedcentral.com/articles/10.1186/1550-2783-11-20',
      },
      {
        titulo: 'Recommendations for natural bodybuilding contest preparation: resistance and cardiovascular training',
        autores: 'E. Helms y colaboradores',
        anio: '2015',
        tipo: 'articulo',
      },
    ],
  },
  12: {
    orden: 12,
    titulo: 'Comunicación, ética y gestión profesional del entrenador',
    resumen:
      'El conocimiento técnico no basta: hay que comunicar, documentar, cobrar y proteger datos. Este módulo cierra la formación con el marco profesional y legal.',
    conceptosClave: [
      'Entrevista inicial y consentimiento informado.',
      'Comunicación de resultados sin promesas ni diagnósticos.',
      'Confidencialidad y protección de datos personales (Ley Orgánica de Protección de Datos, Ecuador).',
      'Presupuesto, contrato de servicios y límites del rol.',
      'Derivación responsable a médicos, nutricionistas y fisioterapeutas.',
    ],
    lecturas: [
      {
        titulo: 'ACSM’s Resources for the Personal Trainer',
        autores: 'American College of Sports Medicine',
        anio: '2021',
        tipo: 'libro',
        nota: 'Marco profesional: evaluación, comunicación y gestión de clientes.',
      },
      {
        titulo: 'Ley Orgánica de Protección de Datos Personales (Ecuador)',
        anio: '2021',
        tipo: 'guia',
        nota: 'Obligaciones sobre tratamiento y resguardo de datos de clientes.',
      },
      {
        titulo: 'Ley del Deporte de Ecuador y su reglamento',
        tipo: 'guia',
        nota: 'Marco legal del deporte formativo y competitivo en el país.',
      },
      {
        titulo: 'Código de Ética INBA',
        tipo: 'guia',
        nota: 'Principios de conducta esperados del entrenador afiliado.',
      },
    ],
  },
}

export function guiaDeModulo(orden: number | null | undefined): GuiaModulo | null {
  if (!orden) return null
  return biblioteca[orden] ?? null
}
