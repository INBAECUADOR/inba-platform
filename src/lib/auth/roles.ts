export type UserRole =
  | 'admin_general'
  | 'admin_academico'
  | 'docente'
  | 'estudiante'
  | 'afiliado'
  | 'public'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin_general: 5,
  admin_academico: 4,
  docente: 3,
  estudiante: 2,
  afiliado: 1,
  public: 0,
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin_general: 'Administrador General',
  admin_academico: 'Administrador Académico',
  docente: 'Docente',
  estudiante: 'Estudiante',
  afiliado: 'Afiliado',
  public: 'Público',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin_general: 'Acceso total al sistema, gestión de usuarios, roles, configuración global',
  admin_academico: 'Gestión académica: cursos, módulos, evaluaciones, docentes, matrículas',
  docente: 'Gestión de sus cursos asignados: evaluaciones, calificaciones, prácticas',
  estudiante: 'Acceso a sus cursos, evaluaciones, calificaciones, certificados',
  afiliado: 'Gestión de su afiliación, beneficios, renovaciones',
  public: 'Acceso público sin autenticación',
}

export function hasRole(userRoles: UserRole[], requiredRole: UserRole): boolean {
  const userMaxLevel = Math.max(...userRoles.map(r => ROLE_HIERARCHY[r]))
  return userMaxLevel >= ROLE_HIERARCHY[requiredRole]
}

export function hasAnyRole(userRoles: UserRole[], requiredRoles: UserRole[]): boolean {
  return userRoles.some(r => requiredRoles.includes(r))
}

export function getHighestRole(userRoles: UserRole[]): UserRole | null {
  if (userRoles.length === 0) return null
  return userRoles.reduce((a, b) =>
    ROLE_HIERARCHY[a] > ROLE_HIERARCHY[b] ? a : b
  )
}

export const PERMISSIONS = {
  // Usuarios
  'users:read': ['admin_general', 'admin_academico'],
  'users:write': ['admin_general'],
  'users:roles': ['admin_general'],

  // Cursos
  'courses:read': ['admin_general', 'admin_academico', 'docente', 'estudiante', 'afiliado'],
  'courses:write': ['admin_general', 'admin_academico'],
  'courses:publish': ['admin_general', 'admin_academico'],
  'courses:assign_docente': ['admin_general', 'admin_academico'],

  // Módulos/Lecciones
  'modules:write': ['admin_general', 'admin_academico', 'docente'],
  'lessons:write': ['admin_general', 'admin_academico', 'docente'],

  // Matrículas
  'enrollments:read': ['admin_general', 'admin_academico', 'docente', 'estudiante'],
  'enrollments:write': ['admin_general', 'admin_academico'],
  'enrollments:approve': ['admin_general', 'admin_academico'],
  'enrollments:self': ['estudiante'],

  // Evaluaciones
  'evaluations:read': ['admin_general', 'admin_academico', 'docente', 'estudiante'],
  'evaluations:write': ['admin_general', 'admin_academico', 'docente'],
  'evaluations:grade': ['admin_general', 'admin_academico', 'docente'],
  'evaluations:take': ['estudiante'],

  // Prácticas
  'practices:read': ['admin_general', 'admin_academico', 'docente', 'estudiante'],
  'practices:write': ['admin_general', 'admin_academico', 'docente'],
  'practices:attendance': ['admin_general', 'admin_academico', 'docente'],
  'practices:enroll': ['estudiante'],

  // Certificados
  'certificates:read': ['admin_general', 'admin_academico', 'docente', 'estudiante', 'afiliado'],
  'certificates:issue': ['admin_general', 'admin_academico'],
  'certificates:verify': ['public'],

  // Afiliaciones
  'affiliations:read': ['admin_general', 'admin_academico', 'docente', 'estudiante', 'afiliado'],
  'affiliations:write': ['admin_general', 'admin_academico'],
  'affiliations:approve': ['admin_general', 'admin_academico'],
  'affiliations:self': ['afiliado'],

  // Competencias
  'events:read': ['admin_general', 'admin_academico', 'docente', 'estudiante', 'afiliado', 'public'],
  'events:write': ['admin_general', 'admin_academico'],
  'events:results': ['admin_general', 'admin_academico'],

  // CMS
  'cms:read': ['admin_general', 'admin_academico', 'docente', 'estudiante', 'afiliado', 'public'],
  'cms:write': ['admin_general', 'admin_academico'],

  // Reportes
  'reports:read': ['admin_general', 'admin_academico'],
  'reports:export': ['admin_general', 'admin_academico'],

  // Auditoría
  'audit:read': ['admin_general', 'admin_academico'],
} as const

export type Permission = keyof typeof PERMISSIONS

export function hasPermission(userRoles: UserRole[], permission: Permission): boolean {
  const allowedRoles = PERMISSIONS[permission] as readonly UserRole[]
  if (allowedRoles.includes('public')) return true
  return userRoles.some(r => allowedRoles.includes(r))
}