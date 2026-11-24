import { createClient } from '@/lib/supabase/server'
import { extractRoleName, type UserRole } from '@/lib/auth/roles'

export type SessionContext =
  | {
      ok: true
      userId: string
      email: string
      fullName: string | null
      roles: UserRole[]
    }
  | {
      ok: false
      reason: 'unauthenticated' | 'not_configured' | 'profile_missing' | 'error'
    }

/**
 * Contexto de sesion verificado contra la base de datos.
 * Los guards de los paneles usan esto, no el estado del cliente.
 */
export async function getSessionContext(): Promise<SessionContext> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { ok: false, reason: 'not_configured' }
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { ok: false, reason: 'unauthenticated' }
    }

    const [{ data: profile, error: profileError }, { data: rolesData, error: rolesError }] =
      await Promise.all([
        supabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', user.id)
          .maybeSingle(),
        supabase.from('user_roles').select('roles(name)').eq('user_id', user.id),
      ])

    if (profileError || rolesError) {
      return { ok: false, reason: 'error' }
    }

    const roles = (rolesData ?? [])
      .map((row) => extractRoleName((row as { roles?: unknown }).roles))
      .filter((role): role is UserRole => role !== null)

    if (!profile && roles.length === 0) {
      return { ok: false, reason: 'profile_missing' }
    }

    return {
      ok: true,
      userId: user.id,
      email: profile?.email ?? user.email ?? '',
      fullName: profile?.full_name ?? null,
      roles,
    }
  } catch (error) {
    // Los errores internos de Next (dynamic usage, redirect, notFound) no son
    // fallos de sesion: hay que dejarlos subir para que Next los maneje.
    const digest = (error as { digest?: unknown } | null)?.digest
    if (typeof digest === 'string' && digest.startsWith('DYNAMIC_SERVER_USAGE')) {
      throw error
    }
    if (digest === 'NEXT_NOT_FOUND' || (typeof digest === 'string' && digest.startsWith('NEXT_REDIRECT'))) {
      throw error
    }
    return { ok: false, reason: 'error' }
  }
}
