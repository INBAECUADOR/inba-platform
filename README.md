# INBA Ecuador - Plataforma Digital Oficial

Plataforma digital integral para la Federación Ecuatoriana de Culturismo Natural (INBA Ecuador).

## 🏗️ Arquitectura

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/DB**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Auth**: Supabase Auth (email/password, magic links, MFA)
- **Video**: Mux / Bunny Stream
- **Email**: Resend
- **PDF/QR**: @react-pdf/renderer + qrcode
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deploy**: Vercel + Supabase Cloud

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 20+
- Docker Desktop (para Supabase local)
- Git

### Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd inba-platform

# Instalar dependencias
npm install

# Iniciar Supabase local (requiere Docker)
npx supabase start

# Copiar variables de entorno
cp .env.example .env.local

# Ejecutar migraciones
npx supabase db reset

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`
Supabase Studio: `http://localhost:54323`

## 📁 Estructura del Proyecto

```
inba-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (public)/           # Páginas públicas
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── formacion/
│   │   │   ├── competencias/
│   │   │   ├── afiliacion/
│   │   │   ├── contacto/
│   │   │   ├── asociacion/
│   │   │   └── verificar-certificado/[uuid]/
│   │   ├── (app)/              # App privada (requiere auth)
│   │   │   ├── layout.tsx      # Layout con sidebar
│   │   │   ├── page.tsx        # Redirect por rol
│   │   │   ├── estudiante/     # Panel estudiante
│   │   │   ├── docente/        # Panel docente
│   │   │   ├── admin/          # Panel admin
│   │   │   └── afiliado/       # Panel afiliado
│   │   ├── api/                # API Routes
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Estilos globales
│   ├── components/
│   │   ├── ui/                 # Componentes base (shadcn/ui)
│   │   ├── layout/             # Header, Footer, Sidebar
│   │   ├── forms/              # Componentes de formularios
│   │   ├── course/             # Componentes de cursos
│   │   ├── evaluation/         # Componentes de evaluaciones
│   │   ├── certificate/        # Componentes de certificados
│   │   └── admin/              # Componentes admin
│   ├── hooks/                  # Custom hooks
│   ├── lib/
│   │   ├── supabase/           # Cliente Supabase
│   │   ├── auth/               # Utilidades de auth/roles
│   │   ├── validations/        # Schemas Zod
│   │   ├── utils/              # Utilidades
│   │   ├── pdf/                # Generación PDF
│   │   ├── qr/                 # Generación QR
│   │   └── email/              # Templates email
│   ├── hooks/                  # Custom hooks
│   ├── types/                  # Tipos TypeScript
│   └── validations/            # Schemas Zod
├── supabase/
│   ├── migrations/             # Migraciones SQL
│   ├── seed/                   # Datos semilla
│   └── functions/              # Edge Functions
├── tests/
│   ├── unit/                   # Tests unitarios (Vitest)
│   └── e2e/                    # Tests E2E (Playwright)
└── docs/                       # Documentación
```

## 🗄️ Modelo de Datos

### Entidades Principales
- **Usuarios y Roles**: profiles, roles, user_roles
- **Afiliaciones**: afiliacion_tipos, afiliacion_solicitudes, afiliaciones
- **Cursos**: cursos, modulos, temas, lecciones, recursos
- **Matrículas**: matriculas, progreso_lecciones
- **Evaluaciones**: evaluaciones, preguntas, opciones_respuesta, intentos_evaluacion, respuestas, rubricas
- **Prácticas**: practicas_sesiones, practicas_inscripciones, asistencias, calificaciones_practica
- **Certificados**: certificados, certificado_config
- **Eventos**: eventos, evento_inscripciones, evento_resultados
- **CMS**: paginas_contenido, noticias, documentos_institucionales
- **Auditoría**: audit_logs, notificaciones

### Roles
- `admin_general` - Acceso total
- `admin_academico` - Gestión académica
- `docente` - Gestión de cursos asignados
- `estudiante` - Acceso a sus cursos
- `afiliado` - Gestión de afiliación

## 🔐 Autenticación y Autorización

- **Supabase Auth**: Email/password, Magic Links, MFA
- **Row Level Security (RLS)**: Políticas a nivel de fila en PostgreSQL
- **Middleware**: Protección de rutas `/app/*`
- **RBAC**: Permisos basados en roles con herencia

## 📚 Estructura Curricular (12 Módulos)

1. **Fundamentos del culturismo natural** - Historia, principios, ética
2. **Anatomía funcional** - Sistema musculoesquelético, planos, ejes
3. **Biomecánica del ejercicio** - Palancas, torque, análisis de ejercicios
4. **Fisiología del ejercicio** - Contracción, sistemas energéticos, hipertrofia
5. **Principios del entrenamiento** - Sobrecarga, especificidad, individualización
6. **Hipertrofia y programación** - Volumen, RIR, periodización
7. **Evaluación física** - Anamnesis, composición corporal, tests
8. **Nutrición deportiva** - Macronutrientes, suplementos, antidopaje
9. **Recuperación y sueño** - Manejo de carga, señales de alerta
10. **Suplementación y antidopaje** - Evaluación crítica, WADA
11. **Posing y competencia** - Poses, peak week, reverse diet
12. **Ética y gestión profesional** - Comunicación, límites, código conducta

## 🎯 Sistema de Evaluación

- **Exámenes de módulo** (11): 22 preguntas cada uno (12 OM + 4 VF + 6 RC)
- **Examen final integrador**: 100 preguntas
- **Prácticas presenciales** (Módulo 12): Rúbricas de evaluación
- **Umbral de aprobación**: ≥70% en todo
- **Certificado**: Solo si todos los módulos + examen final + prácticas ≥70%

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # ESLint
npm run type-check   # TypeScript check
npm run test         # Tests unitarios (Vitest)
npm run test:ui      # UI de tests
npm run test:e2e     # Tests E2E (Playwright)
npm run db:push      # Push migraciones a Supabase
npm run db:reset     # Reset BD local
npm run db:generate-types  # Generar tipos TypeScript
```

## 🌐 Despliegue

### Vercel + Supabase Cloud
1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel
3. Conectar proyecto Supabase Cloud
4. Configurar DNS personalizado

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
QR_CODE_BASE_URL=
```

## 📋 Checklist de Producción

- [ ] SSL/TLS configurado
- [ ] CSP headers configurados
- [ ] Rate limiting en API
- [ ] Backups automáticos Supabase
- [ ] Monitoreo Sentry
- [ ] Logs de auditoría
- [ ] Backup de BD automatizado
- [ ] Documentación de API
- [ ] Tests E2E pasando
- [ ] Lighthouse > 90

## 📄 Licencia

Proyecto privado - INBA Ecuador. Todos los derechos reservados.

## 🤝 Contribución

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Add: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

- **Email**: dev@inbaecuador.org
- **Issues**: GitHub Issues
- **Documentación**: `/docs`

---

**INBA Ecuador** - Federación Ecuatoriana de Culturismo Natural
*Formando entrenadores con ciencia, ética y pasión*