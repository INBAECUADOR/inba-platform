import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Cierre de sesion desde el formulario del sidebar.
 * Limpia las cookies de Supabase en el servidor y vuelve al login.
 */
export async function POST(request: Request) {
  const loginUrl = new URL('/login', request.url)

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.redirect(loginUrl, { status: 303 })
  }

  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // Si el cierre remoto falla, igual mandamos al login: el middleware
    // rechazara el acceso si la cookie sigue siendo valida.
  }

  return NextResponse.redirect(loginUrl, { status: 303 })
}
