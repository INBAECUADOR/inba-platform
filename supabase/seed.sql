-- ============================================
-- COMBINED SEED FILE FOR INBA ECUADOR
-- Run this after applying the schema (001_schema.sql)
-- ============================================

-- 001_roles.sql (roles are inserted in schema, this is reference)
-- Roles: admin_general, admin_academico, docente, estudiante, afiliado

-- 002_curso_certificacion.sql
\ir ./seed/002_curso_certificacion.sql

-- 003_modulos_2_4.sql
\ir ./seed/003_modulos_2_4.sql

-- 004_modulos_3_4.sql
\ir ./seed/004_modulos_3_4.sql

-- 005_modulo_4.sql
\ir ./seed/005_modulo_4.sql

-- 006_modulos_5_6.sql
\ir ./seed/006_modulos_5_6.sql

-- 007_modulos_6_7.sql
\ir ./seed/007_modulos_6_7.sql

-- 008_modulos_7_8.sql
\ir ./seed/008_modulos_7_8.sql

-- 009_modulos_8_9.sql
\ir ./seed/009_modulos_8_9.sql

-- 010_modulos_9_10.sql
\ir ./seed/010_modulos_9_10.sql

-- 011_modulos_10_11.sql
\ir ./seed/011_modulos_10_11.sql

-- 012_modulos_11_12.sql
\ir ./seed/012_modulos_11_12.sql

-- 013_modulo_12.sql
\ir ./seed/013_modulo_12.sql

-- 014_certificados_afiliaciones.sql
\ir ./seed/014_certificados_afiliaciones.sql

-- 015_cms_part1.sql
\ir ./seed/015_cms_part1.sql

-- 016_cms_part2.sql
\ir ./seed/016_cms_part2.sql

-- 017_cms_part3.sql
\ir ./seed/017_cms_part3.sql