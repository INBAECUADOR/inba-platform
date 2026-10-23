<#>
.SYNOPSIS
    Setup script for INBA Ecuador Supabase Cloud project.
    Applies schema, seeds, creates test users, and assigns roles.

.PREREQUISITES
    - Supabase Cloud project created at https://supabase.com/dashboard
    - Project URL and keys from Settings > API
    - psql (PostgreSQL client) installed, OR use Supabase SQL Editor manually

.USAGE
    1. Update the variables below with your Supabase Cloud credentials
    2. Run: .\setup-cloud.ps1
    3. Or manually execute the generated SQL in Supabase Dashboard > SQL Editor

.NOTES
    Project: qknqurlwkobgzgfkbbgq.supabase.co
    Schema: 001_schema.sql (corrected version)
    Seeds: 002-017
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef = "qknqurlwkobgzgfkbbgq",
    
    [Parameter(Mandatory=$true)]
    [string]$ServiceRoleKey,
    
    [Parameter(Mandatory=$true)]
    [string]$AnonKey,
    
    [string]$DbPassword
)

$ErrorActionPreference = "Stop"

Write-Host "=== INBA Ecuador - Supabase Cloud Setup ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectRef" -ForegroundColor Yellow

# Build connection string
$DbHost = "db.$ProjectRef.supabase.co"
$DbPort = 5432
$DbName = "postgres"
$DbUser = "postgres"

if (-not $DbPassword) {
    $DbPassword = Read-Host "Enter database password (from Supabase Settings > Database)" -AsSecureString
    $DbPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($DbPassword))
}

$ConnString = "postgresql://$DbUser:$DbPassword@$DbHost:$DbPort/$DbName?sslmode=require"

Write-Host "`nTesting database connection..." -ForegroundColor Yellow
try {
    $test = & psql "$ConnString" -c "SELECT version();" -t
    Write-Host "✓ Connected to PostgreSQL" -ForegroundColor Green
} catch {
    Write-Host "✗ Connection failed. Check credentials and network." -ForegroundColor Red
    Write-Host "You can also run the SQL manually in Supabase Dashboard > SQL Editor" -ForegroundColor Yellow
    exit 1
}

# Function to execute SQL file
function Execute-SqlFile {
    param([string]$FilePath, [string]$Description)
    
    Write-Host "`n[$Description] Applying $FilePath..." -ForegroundColor Cyan
    try {
        & psql "$ConnString" -f $FilePath -v ON_ERROR_STOP=1
        Write-Host "✓ $Description completed" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed: $_" -ForegroundColor Red
        throw $_
    }
}

# 1. Apply corrected schema
Write-Host "`n=== STEP 1: Apply Database Schema ===" -ForegroundColor Magenta
Execute-SqlFile "supabase/migrations/001_schema.sql" "Schema"

# 2. Apply seeds
Write-Host "`n=== STEP 2: Apply Seed Data ===" -ForegroundColor Magenta
$seedFiles = @(
    "supabase/seed/002_curso_certificacion.sql",
    "supabase/seed/003_modulos_2_4.sql",
    "supabase/seed/004_modulos_3_4.sql",
    "supabase/seed/005_modulo_4.sql",
    "supabase/seed/006_modulos_5_6.sql",
    "supabase/seed/007_modulos_6_7.sql",
    "supabase/seed/008_modulos_7_8.sql",
    "supabase/seed/009_modulos_8_9.sql",
    "supabase/seed/010_modulos_9_10.sql",
    "supabase/seed/011_modulos_10_11.sql",
    "supabase/seed/012_modulos_11_12.sql",
    "supabase/seed/013_modulo_12.sql",
    "supabase/seed/014_certificados_afiliaciones.sql",
    "supabase/seed/015_cms_part1.sql",
    "supabase/seed/016_cms_part2.sql",
    "supabase/seed/017_cms_part3.sql"
)

foreach ($seed in $seedFiles) {
    Execute-SqlFile $seed "Seed"
}

# 3. Create test users and assign roles
Write-Host "`n=== STEP 3: Create Test Users & Assign Roles ===" -ForegroundColor Magenta

$setupUsersSql = @"
-- Create test users via Supabase Auth (run in SQL Editor or use Supabase CLI)
-- These users need to be created first in Authentication > Users
-- Then run this to assign roles and create profiles

-- Admin user: admin@inbaecuador.org / Admin123!
-- Student user: estudiante@test.com / Estudiante123!

-- After creating users in Auth, get their IDs:
-- SELECT id, email FROM auth.users WHERE email IN ('admin@inbaecuador.org', 'estudiante@test.com');

-- Then run these with the actual UUIDs:
/*
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
*/
"@

Write-Host "`n=== MANUAL STEPS REQUIRED ===" -ForegroundColor Yellow
Write-Host "1. Go to Supabase Dashboard > Authentication > Users > Add user" -ForegroundColor White
Write-Host "   - admin@inbaecuador.org / Admin123! (Admin)" -ForegroundColor White
Write-Host "   - estudiante@test.com / Estudiante123! (Student)" -ForegroundColor White
Write-Host "2. Go to Supabase Dashboard > SQL Editor" -ForegroundColor White
Write-Host "3. Run the user setup SQL (see output above)" -ForegroundColor White
Write-Host "4. Verify in Table Editor: profiles, user_roles, matriculas" -ForegroundColor White

Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Database schema and seeds applied successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with Cloud credentials" -ForegroundColor White
Write-Host "2. Redeploy on Vercel" -ForegroundColor White
Write-Host "3. Test login at https://inba-platform.vercel.app/login" -ForegroundColor White