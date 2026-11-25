'use client'

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { extractRoleName, UserRole } from '@/lib/auth/roles'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    roles: UserRole[]
  } | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<{
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    roles: UserRole[]
  } | null>(null)
  const [loading, setLoading] = useState(true)

  // Un solo cliente por montaje: recrearlo en cada render deja suscripciones
  // apuntando a instancias distintas.
  const [supabase] = useState(() => createClient())

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url')
        .eq('id', userId)
        .maybeSingle()

      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userId)

      const roles = (rolesData ?? [])
        .map((r) => extractRoleName((r as { roles?: unknown }).roles))
        .filter((role): role is UserRole => role !== null)

      if (data) {
        setProfile({ ...data, roles })
      } else {
        setProfile(null)
      }
    },
    [supabase]
  )

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id)
  }, [user, fetchProfile])

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Las consultas a Supabase no pueden hacerse dentro del callback:
      // supabase-js mantiene un lock durante el evento y la query se queda
      // esperando para siempre (el panel se queda en "Cargando...".
      if (session?.user) {
        const userId = session.user.id
        setTimeout(() => {
          void fetchProfile(userId)
        }, 0)
      } else {
        setProfile(null)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      if (session?.user) void fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
