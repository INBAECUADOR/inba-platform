import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * Diagnostico de conectividad con Supabase.
 * No expone claves: solo indica si estan configuradas y el host.
 */
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  let host = ''
  try {
    host = url ? new URL(url).host : ''
  } catch {
    host = url
  }

  if (!url || !anon) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'missing_env',
        supabase_url_set: Boolean(url),
        anon_key_set: Boolean(anon),
        supabase_host: host,
      },
      { status: 503 }
    )
  }

  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from('cursos')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json(
        { ok: false, reason: 'db_error', message: error.message, supabase_host: host },
        { status: 503 }
      )
    }

    const { data: roles, error: rolesError } = await supabase.from('roles').select('name')

    return NextResponse.json({
      ok: true,
      supabase_host: host,
      cursos: count ?? 0,
      roles: rolesError ? null : roles?.map((r) => r.name) ?? [],
    })
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'unreachable',
        message: e instanceof Error ? e.message : String(e),
        supabase_host: host,
      },
      { status: 503 }
    )
  }
}
