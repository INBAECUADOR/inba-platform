export interface BloqueInstitucional {
  titulo: string
  parrafos?: string[]
  items?: string[]
}

export interface PaginaInstitucional {
  titulo: string
  descripcion: string
  bloques: BloqueInstitucional[]
  /** Aclaración honesta cuando falta documentación oficial por publicar. */
  nota?: string
  cta?: { label: string; href: string }
}

/**
 * Contenido de las secciones informativas del sitio público.
 *
 * Solo se incluye información descriptiva y verificable. Los datos que
 * dependen de documentación oficial (nombres del directorio, tablas de
 * categorías, PDFs de reglamentos, resultados) se marcan como pendientes de
 * publicación en lugar de inventarse.
 */
export const paginasInstitucionales: Record<string, PaginaInstitucional> = {
  'asociacion/historia': {
    titulo: 'Historia',
    descripcion: 'Trayectoria de INBA Ecuador en la promoción del culturismo natural',
    bloques: [
      {
        titulo: 'Nuestra identidad',
        parrafos: [
          'INBA Ecuador es la organización nacional dedicada al culturismo natural: la práctica deportiva que excluye el uso de sustancias prohibidas y se apoya en entrenamiento, nutrición y recuperación planificados.',
          'La institución reúne a atletas, entrenadores, jueces y clubes en torno a un mismo criterio: competir y formar con evidencia científica y juego limpio.',
        ],
      },
      {
        titulo: 'Líneas de trabajo',
        items: [
          'Formación y certificación de entrenadores de culturismo natural.',
          'Organización de competencias oficiales con arbitraje certificado.',
          'Afiliación de atletas, entrenadores y clubes.',
          'Verificación pública de certificados emitidos.',
        ],
      },
    ],
    nota: 'La cronología oficial y los hitos institucionales se publicarán en esta sección cuando la directiva valide la información.',
  },
  'asociacion/mision-vision': {
    titulo: 'Misión y Visión',
    descripcion: 'El propósito que guía el trabajo de INBA Ecuador',
    bloques: [
      {
        titulo: 'Misión',
        parrafos: [
          'Formar entrenadores y atletas con base científica, promover el culturismo natural y organizar competencias confiables, transparentes y accesibles para el deporte ecuatoriano.',
        ],
      },
      {
        titulo: 'Visión',
        parrafos: [
          'Ser la referencia nacional en culturismo natural, reconocida por la calidad de su formación, la transparencia de sus competencias y el respeto a la salud de sus deportistas.',
        ],
      },
      {
        titulo: 'Valores',
        items: [
          'Juego limpio: tolerancia cero frente al dopaje.',
          'Evidencia científica: decisiones técnicas y académicas fundamentadas.',
          'Transparencia: resultados, reglas y certificados verificables.',
          'Excelencia: estándares exigentes en formación y arbitraje.',
          'Comunidad: trabajo conjunto entre atletas, entrenadores y jueces.',
        ],
      },
    ],
  },
  'asociacion/equipo': {
    titulo: 'Equipo Directivo',
    descripcion: 'Áreas de trabajo de la organización',
    bloques: [
      {
        titulo: 'Estructura organizativa',
        items: [
          'Dirección general: representación institucional y lineamientos estratégicos.',
          'Área académica: diseño y supervisión del programa de certificación.',
          'Área técnica: calendario de competencias, sedes y logística.',
          'Arbitraje: selección, formación y evaluación de jueces.',
          'Administración: afiliaciones, certificados y atención a socios.',
        ],
      },
    ],
    nota: 'Los nombres y cargos de la directiva se publicarán únicamente con la autorización de cada integrante.',
  },
  'asociacion/reglamentos': {
    titulo: 'Reglamentos',
    descripcion: 'Documentos que rigen la actividad institucional y deportiva',
    bloques: [
      {
        titulo: 'Documentos vigentes',
        items: [
          'Estatuto orgánico de la organización.',
          'Reglamento de competencias: inscripción, pesaje, categorías y criterios de evaluación.',
          'Código de conducta de atletas, entrenadores y jueces.',
          'Política antidopaje y controles.',
          'Reglamento académico de la certificación de entrenadores.',
        ],
      },
    ],
    nota: 'Los documentos oficiales se publicarán en formato PDF en esta sección cuando la directiva apruebe la versión vigente. Mientras tanto, pueden solicitarse por los canales de contacto.',
    cta: { label: 'Solicitar documentación', href: '/contacto' },
  },
  'asociacion/politicas': {
    titulo: 'Políticas',
    descripcion: 'Compromisos institucionales con el deporte limpio y la integridad',
    bloques: [
      {
        titulo: 'Política antidopaje',
        parrafos: [
          'INBA Ecuador promueve el culturismo natural. Los participantes aceptan someterse a controles y declarar el uso de sustancias cuando la organización lo requiera. El incumplimiento implica sanciones deportivas conforme al reglamento.',
        ],
      },
      {
        titulo: 'Integridad y transparencia',
        items: [
          'Publicación de reglas y resultados verificables.',
          'Arbitraje con jueces acreditados y criterios conocidos de antemano.',
          'Manejo de conflictos de interés en la evaluación de atletas.',
        ],
      },
      {
        titulo: 'Protección de datos',
        parrafos: [
          'Los datos personales se tratan con la finalidad de gestionar afiliaciones, matrículas, evaluaciones y certificados. La verificación pública de un certificado expone únicamente el nombre del titular, el curso, la fecha y el estado del documento.',
        ],
      },
    ],
  },
  'competencias/categorias': {
    titulo: 'Categorías',
    descripcion: 'Cómo se organizan las categorías de competencia',
    bloques: [
      {
        titulo: 'Criterios de clasificación',
        items: [
          'Categorías por grupo de edad, desde juvenil hasta máster.',
          'Categorías por división de peso o talla según la modalidad.',
          'Categorías por nivel: debutantes y categoría abierta.',
          'Categorías especiales definidas en la convocatoria de cada evento.',
        ],
      },
      {
        titulo: 'Cómo elegir tu categoría',
        parrafos: [
          'Cada convocatoria publica la tabla de categorías con los rangos aplicables. El atleta declara su categoría al inscribirse y la organización la verifica durante el pesaje o la medición previa al evento.',
        ],
      },
    ],
    nota: 'La tabla oficial de categorías con rangos exactos se publica junto al reglamento de cada temporada.',
    cta: { label: 'Ver calendario', href: '/competencias/calendario' },
  },
  'competencias/inscripcion': {
    titulo: 'Inscripciones',
    descripcion: 'Cómo participar en una competencia oficial',
    bloques: [
      {
        titulo: 'Pasos para inscribirte',
        items: [
          'Contar con afiliación vigente como atleta.',
          'Revisar la convocatoria del evento y la tabla de categorías.',
          'Completar la inscripción desde la plataforma o con el formulario oficial del evento.',
          'Entregar la documentación solicitada dentro del plazo.',
          'Confirmar el pago de la inscripción y esperar la validación.',
        ],
      },
      {
        titulo: 'Antes del evento',
        parrafos: [
          'La organización publica el cronograma de pesaje, reuniones técnicas y horarios de escenario. Es obligatorio presentarse con documento de identidad y cumplir el protocolo de la convocatoria.',
        ],
      },
    ],
    cta: { label: 'Afiliarme', href: '/afiliacion' },
  },
  'competencias/reglamentos': {
    titulo: 'Reglamento de competencia',
    descripcion: 'Reglas aplicables a todos los eventos oficiales',
    bloques: [
      {
        titulo: 'Contenido del reglamento',
        items: [
          'Requisitos de inscripción y documentación.',
          'Procedimiento de pesaje y verificación de categoría.',
          'Criterios de evaluación y puntuación del jurado.',
          'Reglas de presentación, posing y vestimenta.',
          'Protocolo antidopaje y causales de descalificación.',
          'Procedimiento de apelaciones y sanciones.',
        ],
      },
    ],
    nota: 'El texto completo en PDF se publicará cuando la directiva apruebe la versión vigente. También puede solicitarse por los canales de contacto.',
    cta: { label: 'Contactar a la organización', href: '/contacto' },
  },
  'competencias/resultados': {
    titulo: 'Resultados',
    descripcion: 'Resultados oficiales de las competencias INBA Ecuador',
    bloques: [
      {
        titulo: 'Publicación de resultados',
        parrafos: [
          'Los resultados se publican al cierre de cada evento con el puesto, el atleta y la categoría. Una vez publicados, quedan disponibles para consulta permanente.',
        ],
      },
    ],
    nota: 'Todavía no se han publicado resultados en la plataforma. La sección se activará con el primer evento cerrado.',
    cta: { label: 'Ver calendario', href: '/competencias/calendario' },
  },
  'formacion/programas': {
    titulo: 'Programas',
    descripcion: 'Líneas de formación de INBA Ecuador',
    bloques: [
      {
        titulo: 'Qué ofrecemos',
        items: [
          'Certificación de Entrenadores de Culturismo Natural: programa completo por módulos, con evaluaciones y prácticas.',
          'Actualizaciones y seminarios para entrenadores ya certificados.',
          'Formación de jueces y oficiales técnicos.',
          'Capacitación para afiliados en temas de entrenamiento y nutrición deportiva.',
        ],
      },
    ],
    cta: { label: 'Ver el programa disponible', href: '/formacion' },
  },
  'formacion/certificacion': {
    titulo: 'Certificación de Entrenadores',
    descripcion: 'Requisitos y proceso para obtener la certificación',
    bloques: [
      {
        titulo: 'Proceso',
        items: [
          'Matricularte en el programa de certificación desde la plataforma.',
          'Completar los módulos y sus contenidos.',
          'Aprobar las evaluaciones y las prácticas supervisadas.',
          'Cumplir los requisitos administrativos y de afiliación.',
          'Recibir el certificado con número de serie y URL pública de verificación.',
        ],
      },
      {
        titulo: 'Verificación',
        parrafos: [
          'Cada certificado emitido tiene un identificador público. Cualquier persona puede comprobar su validez en la sección de verificación sin acceder a datos privados del titular.',
        ],
      },
    ],
    cta: { label: 'Verificar un certificado', href: '/verificar-certificado' },
  },
  'formacion/metodologia': {
    titulo: 'Metodología',
    descripcion: 'Cómo se enseña y se evalúa en INBA Ecuador',
    bloques: [
      {
        titulo: 'Enfoque formativo',
        items: [
          'Contenido basado en evidencia científica y práctica profesional.',
          'Módulos secuenciales con objetivos de aprendizaje definidos.',
          'Evaluaciones por competencias, no solo memorísticas.',
          'Prácticas supervisadas para aplicar lo aprendido.',
          'Retroalimentación del docente en cada entrega.',
        ],
      },
      {
        titulo: 'Seguimiento del progreso',
        parrafos: [
          'La plataforma registra el avance por módulo y las calificaciones de evaluaciones y prácticas. El estudiante puede consultar su progreso y sus notas desde su panel.',
        ],
      },
    ],
    cta: { label: 'Ver mis cursos', href: '/app/estudiante/cursos' },
  },
  'formacion/docentes': {
    titulo: 'Docentes',
    descripcion: 'Quiénes imparten la formación',
    bloques: [
      {
        titulo: 'Perfil del cuerpo docente',
        items: [
          'Entrenadores certificados con experiencia en culturismo natural.',
          'Profesionales de ciencias del deporte y nutrición.',
          'Jueces y oficiales técnicos con acreditación vigente.',
        ],
      },
    ],
    nota: 'Las fichas del cuerpo docente se publicarán con la autorización de cada profesional.',
  },
  'formacion/inscripcion': {
    titulo: 'Inscripción a la formación',
    descripcion: 'Cómo matricularte en el programa de certificación',
    bloques: [
      {
        titulo: 'Pasos',
        items: [
          'Crear una cuenta en la plataforma.',
          'Elegir el programa de certificación y revisar sus requisitos.',
          'Solicitar la matrícula desde tu panel de estudiante.',
          'Coordinar el pago y la documentación con la administración.',
          'Acceder a los módulos una vez activada la matrícula.',
        ],
      },
    ],
    cta: { label: 'Crear cuenta', href: '/register' },
  },
  'afiliacion/tipos': {
    titulo: 'Tipos de afiliación',
    descripcion: 'Modalidades de participación en INBA Ecuador',
    bloques: [
      {
        titulo: 'Modalidades',
        items: [
          'Atleta: participación en competencias oficiales.',
          'Entrenador: ejercicio profesional y acceso a formación continua.',
          'Juez: arbitraje de competencias previa acreditación.',
          'Club o asociación provincial: participación institucional.',
        ],
      },
    ],
    cta: { label: 'Solicitar afiliación', href: '/afiliacion/solicitud' },
  },
  'afiliacion/requisitos': {
    titulo: 'Requisitos',
    descripcion: 'Documentación necesaria para afiliarte',
    bloques: [
      {
        titulo: 'Documentos',
        items: [
          'Documento de identidad vigente.',
          'Datos de contacto actualizados en la plataforma.',
          'Aceptación de los reglamentos y del código de conducta.',
          'Comprobante del pago de la cuota de afiliación.',
        ],
      },
      {
        titulo: 'Para menores de edad',
        parrafos: [
          'Las solicitudes de menores de edad requieren la autorización de su representante legal, conforme a la convocatoria vigente.',
        ],
      },
    ],
  },
  'afiliacion/solicitud': {
    titulo: 'Solicitud de afiliación',
    descripcion: 'Cómo enviar tu solicitud',
    bloques: [
      {
        titulo: 'Proceso',
        items: [
          'Crear una cuenta o iniciar sesión en la plataforma.',
          'Completar tus datos personales y de contacto.',
          'Enviar la solicitud con la documentación requerida.',
          'Esperar la revisión y la confirmación de la administración.',
          'Recibir tu carnet digital y el estado de afiliación vigente.',
        ],
      },
    ],
    nota: 'El formulario de afiliación en línea está en implementación. Mientras tanto, las solicitudes se reciben por los canales de contacto.',
    cta: { label: 'Escribir a la organización', href: '/contacto' },
  },
  'afiliacion/renovacion': {
    titulo: 'Renovación',
    descripcion: 'Cómo mantener tu afiliación vigente',
    bloques: [
      {
        titulo: 'Renovación anual',
        parrafos: [
          'La afiliación tiene vigencia anual. Antes del vencimiento la organización notifica al afiliado y publica el procedimiento de renovación del período.',
        ],
      },
      {
        titulo: 'Qué revisar',
        items: [
          'Datos personales y de contacto actualizados.',
          'Comprobante de pago del período.',
          'Aceptación de la versión vigente de los reglamentos.',
        ],
      },
    ],
    cta: { label: 'Mi perfil', href: '/app/perfil' },
  },
  'afiliacion/beneficios': {
    titulo: 'Beneficios',
    descripcion: 'Qué obtienes al afiliarte',
    bloques: [
      {
        titulo: 'Beneficios del afiliado',
        items: [
          'Participación en competencias oficiales del calendario INBA.',
          'Acceso a los programas de formación y actualización.',
          'Certificados verificables públicamente.',
          'Representación institucional en eventos nacionales.',
          'Acceso a la comunidad de atletas, entrenadores y jueces.',
        ],
      },
    ],
    cta: { label: 'Afiliarme', href: '/afiliacion' },
  },
  privacidad: {
    titulo: 'Política de Privacidad',
    descripcion: 'Cómo tratamos tus datos personales',
    bloques: [
      {
        titulo: 'Datos que recopilamos',
        items: [
          'Datos de identificación y contacto que registras al crear tu cuenta.',
          'Información académica: matrículas, avance, evaluaciones y certificados.',
          'Información de afiliación y participación en competencias.',
        ],
      },
      {
        titulo: 'Finalidad',
        parrafos: [
          'Los datos se usan para gestionar tu cuenta, tu formación, tu afiliación y la emisión de certificados. No se venden ni se ceden a terceros ajenos a la operación de la plataforma.',
        ],
      },
      {
        titulo: 'Verificación pública de certificados',
        parrafos: [
          'La verificación de un certificado muestra únicamente el nombre del titular, el programa, la fecha de emisión, el número de serie y el estado del documento.',
        ],
      },
      {
        titulo: 'Tus derechos',
        parrafos: [
          'Puedes solicitar acceso, rectificación o eliminación de tus datos escribiendo a la organización. Las solicitudes se atienden conforme a la normativa ecuatoriana de protección de datos personales.',
        ],
      },
    ],
    cta: { label: 'Contactar', href: '/contacto' },
  },
  terminos: {
    titulo: 'Términos y Condiciones',
    descripcion: 'Condiciones de uso de la plataforma',
    bloques: [
      {
        titulo: 'Uso de la cuenta',
        parrafos: [
          'Cada usuario es responsable de la veracidad de los datos que registra y de la confidencialidad de sus credenciales. Las cuentas son personales y no deben compartirse.',
        ],
      },
      {
        titulo: 'Contenido académico',
        parrafos: [
          'Los materiales de formación son de uso personal del estudiante matriculado. No está permitida su reproducción o distribución sin autorización.',
        ],
      },
      {
        titulo: 'Conducta',
        items: [
          'No suplantar la identidad de otra persona.',
          'No intentar acceder a información de otros usuarios.',
          'Respetar los reglamentos deportivos y el código de conducta.',
        ],
      },
      {
        titulo: 'Certificados',
        parrafos: [
          'Un certificado solo es válido si aparece como vigente en la verificación pública. La organización puede revocar certificados ante incumplimientos comprobados.',
        ],
      },
    ],
    cta: { label: 'Verificar certificado', href: '/verificar-certificado' },
  },
  cookies: {
    titulo: 'Política de Cookies',
    descripcion: 'Uso de cookies en la plataforma',
    bloques: [
      {
        titulo: 'Cookies necesarias',
        parrafos: [
          'La plataforma utiliza cookies estrictamente necesarias para mantener tu sesión iniciada y proteger el acceso a tu cuenta. Sin ellas no es posible autenticarse.',
        ],
      },
      {
        titulo: 'Sin publicidad',
        parrafos: [
          'No utilizamos cookies de publicidad ni de seguimiento entre sitios. Las mediciones técnicas se limitan al funcionamiento del servicio.',
        ],
      },
      {
        titulo: 'Cómo eliminarlas',
        parrafos: [
          'Puedes borrar las cookies desde la configuración de tu navegador. Al hacerlo se cerrará tu sesión en la plataforma.',
        ],
      },
    ],
  },
}
