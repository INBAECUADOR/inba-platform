# INBA Ecuador - Setup Guide for Supabase Cloud & Vercel

## Overview
This guide walks through configuring the INBA Ecuador platform with Supabase Cloud (PostgreSQL + Auth) and deploying to Vercel.

---

## 1. Supabase Cloud Setup

### 1.1 Get Your Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **qknqurlwkobgzgfkbbgq**
3. Go to **Settings → API**
4. Copy:
   - **Project URL**: `https://qknqurlwkobgzgfkbbgq.supabase.co`
   - **anon public key** (for frontend)
   - **service_role key** (for backend/admin - keep secret!)

### 1.2 Apply Database Schema
**Option A: Using Supabase SQL Editor (Recommended)**
1. Go to **SQL Editor → New Query**
2. Copy **entire content** of `supabase/migrations/001_schema.sql` (corrected version)
3. Click **Run**
4. Verify: Tables appear in **Table Editor**

**Option B: Using psql (if installed)**
```powershell
# From project root
psql "postgresql://postgres:YOUR_DB_PASSWORD@db.qknqurlwkobgzgfkbbgq.supabase.co:5432/postgres?sslmode=require" -f supabase/migrations/001_schema.sql
```

### 1.3 Apply Seed Data (Course Content)
Run each seed file **in order** in SQL Editor:

| Order | File | Description |
|-------|------|-------------|
| 1 | `supabase/seed/002_curso_certificacion.sql` | Main course + Module 1 |
| 2 | `supabase/seed/003_modulos_2_4.sql` | Modules 2-4 |
| 3 | `supabase/seed/004_modulos_3_4.sql` | Modules 3-4 |
| 4 | `supabase/seed/005_modulo_4.sql` | Module 4 detail |
| 5 | `supabase/seed/006_modulos_5_6.sql` | Modules 5-6 |
| 6 | `supabase/seed/007_modulos_6_7.sql` | Modules 6-7 |
| 7 | `supabase/seed/008_modulos_7_8.sql` | Modules 7-8 |
| 8 | `supabase/seed/009_modulos_8_9.sql` | Modules 8-9 |
| 9 | `supabase/seed/010_modulos_9_10.sql` | Modules 9-10 |
| 10 | `supabase/seed/011_modulos_10_11.sql` | Modules 10-11 |
| 11 | `supabase/seed/012_modulos_11_12.sql` | Modules 11-12 |
| 12 | `supabase/seed/013_modulo_12.sql` | Module 12 + practice |
| 13 | `supabase/seed/014_certificados_afiliaciones.sql` | Certs & affiliations |
| 14 | `supabase/seed/015_cms_part1.sql` | CMS content part 1 |
| 15 | `supabase/seed/016_cms_part2.sql` | CMS content part 2 |
| 16 | `supabase/seed/017_cms_part3.sql` | CMS content part 3 |

**Verification in Table Editor:**
- `cursos` → 1 row (`CERT-ENT-2026`)
- `modulos` → 12 rows
- `lecciones` → 30+ rows
- `evaluaciones` → 12+ rows
- `preguntas` → 50+ rows

---

## 2. Create Test Users

### 2.1 Create in Supabase Auth
Go to **Authentication → Users → Add user** (create both):

| Email | Password | Role |
|-------|----------|------|
| `admin@inbaecuador.org` | `Admin123!` | Admin |
| `estudiante@test.com` | `Estudiante123!` | Student |

Enable **Email confirmation** for both.

### 2.2 Assign Roles & Profiles
Run in **SQL Editor** after creating users:

```sql
-- Get user IDs first:
SELECT id, email FROM auth.users WHERE email IN ('admin@inbaecuador.org', 'estudiante@test.com');

-- Then run with actual UUIDs:
-- Admin role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u, roles r
WHERE u.email = 'admin@inbaecuador.org' AND r.name = 'admin_general';

INSERT INTO profiles (id, email, full_name)
SELECT id, email, 'Administrador INBA' FROM auth.users WHERE email = 'admin@inbaecuador.org'
ON CONFLICT (id) DO NOTHING;

-- Student role
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM auth.users u, roles r
WHERE u.email = 'estudiante@test.com' AND r.name = 'estudiante';

INSERT INTO profiles (id, email, full_name)
SELECT id, email, 'Estudiante Demo' FROM auth.users WHERE email = 'estudiante@test.com'
ON CONFLICT (id) DO NOTHING;

-- Enroll student in course
INSERT INTO matriculas (user_id, curso_id, estado, fecha_inicio)
SELECT 
    (SELECT id FROM auth.users WHERE email = 'estudiante@test.com'),
    (SELECT id FROM cursos WHERE codigo = 'CERT-ENT-2026'),
    'activa', CURRENT_DATE;
```

**Verify in Table Editor:**
- `profiles` → 2 rows
- `user_roles` → 2 rows (admin_general, estudiante)
- `matriculas` → 1 row (student enrolled in CERT-ENT-2026)

---

## 3. Configure Vercel Environment Variables

Go to **Vercel Dashboard → Project → Settings → Environment Variables**

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://qknqurlwkobgzgfkbbgq.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (your anon key) | All |
| `SUPABASE_SERVICE_ROLE_KEY` | (your service_role key) | All |
| `NEXT_PUBLIC_APP_URL` | `https://inba-platform.vercel.app` | Production |
| `NEXT_PUBLIC_APP_NAME` | `INBA Ecuador` | All |
| `RESEND_API_KEY` | `re_your_key` | Production |
| `EMAIL_FROM` | `INBA Ecuador <noreply@inbaecuador.org>` | All |
| `QR_CODE_BASE_URL` | `https://inba-platform.vercel.app/verificar-certificado` | Production |
| `NODE_ENV` | `production` | Production |

**Important:** Fix `SUPABASE_SERVICE_ROLE_KEY` which shows "Needs Attention"

### Redeploy
```bash
git commit --allow-empty -m "chore: trigger deploy with Cloud config" && git push
```

---

## 4. Test Production

### 4.1 Login Test
Visit: **https://inba-platform.vercel.app/login**

| User | Email | Password | Expected Panel |
|------|-------|----------|----------------|
| Admin | `admin@inbaecuador.org` | `Admin123!` | `/app/admin` |
| Student | `estudiante@test.com` | `Estudiante123!` | `/app/estudiante/cursos` |

### 4.2 Verify Functionality

**Admin Panel (`/app/admin`):**
- [ ] Stats cards load
- [ ] Recent users table shows test users
- [ ] Recent courses shows certification course
- [ ] Quick actions navigate correctly

**Student Panel (`/app/estudiante/cursos`):**
- [ ] Shows "Certificación de Entrenadores..." course
- [ ] Course card shows progress, modules, actions
- [ ] Can click "Continuar" → navigate to course detail
- [ ] `/app/estudiante/evaluaciones` shows autoevaluaciones

**Course Detail (`/app/estudiante/cursos/[id]`):**
- [ ] Modules list with lessons
- [ ] Can open lessons, mark complete
- [ ] Progress updates

**Evaluations (`/app/estudiante/evaluaciones`):**
- [ ] Tabs: Disponibles, Por calificar, Aprobadas
- [ ] Can start autoevaluación
- [ ] Questions render correctly
- [ ] Submit saves attempt
- [ ] Results show after submit

**Certificates (`/app/estudiante/certificados`):**
- [ ] Shows after passing all requirements

---

## 5. Local Development

### 5.1 Local .env.local
```bash
cp .env.production.example .env.local
# Fill in your Cloud credentials
```

### 5.2 Run Locally
```bash
npm install
npm run dev
# Opens http://localhost:3000
```

### 5.3 Run Tests
```bash
npm run type-check  # TypeScript
npm run build       # Production build
npm test            # Unit tests (if configured)
```

---

## 6. Troubleshooting

### "No modules showing"
- Seeds not applied → Run all 16 seed files in order
- Student not enrolled → Check `matriculas` table
- Wrong user role → Check `user_roles` table

### "Authentication failed"
- Check `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY` match Supabase
- Check Vercel Environment Variables are set for correct environment
- Clear browser cache / try incognito

### "Build fails on Vercel"
- Check `SUPABASE_SERVICE_ROLE_KEY` is set (shows "Needs Attention" if not)
- Run `npm run build` locally first
- Check Vercel build logs for specific errors

### "Database connection failed"
- Verify `NEXT_PUBLIC_SUPABASE_URL` uses `https://qknqurlwkobgzgfkbbgq.supabase.co`
- Check Supabase project is not paused (free tier pauses after 1 week inactivity)
- Go to Supabase Dashboard → Settings → General → "Resume project" if needed

---

## 7. File Reference

| File | Purpose |
|------|---------|
| `supabase/migrations/001_schema.sql` | Complete DB schema (corrected) |
| `supabase/seed/002-017*.sql` | Course content seeds |
| `supabase/seed.sql` | Combined seed file (for psql) |
| `setup-cloud.ps1` | Automated setup script |
| `.env.production.example` | Production env template |
| `.env.local` | Local development (gitignored) |

---

## 8. Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` only in Vercel (not in repo)
- [ ] No `.env.local` committed to Git
- [ ] RLS policies enabled on all tables
- [ ] Auth email confirmations enabled
- [ ] Password requirements configured (min 8 chars)
- [ ] HTTPS enforced on Vercel (automatic)
- [ ] No hardcoded secrets in code

---

## 9. Support

If issues persist:
1. Check Vercel build logs
- Check Supabase logs (Dashboard → Logs)
3. Run locally with `npm run dev` and check browser console
4. Verify all SQL executed successfully in Supabase SQL Editor

**Project URLs:**
- Production: https://inba-platform.vercel.app
- Supabase Dashboard: https://supabase.com/dashboard/project/qknqurlwkobgzgfkbbgq
- Vercel Dashboard: https://vercel.com/inbaecuador/inba-platform