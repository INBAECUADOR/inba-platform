'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon, Dumbbell, GraduationCap, User, LogIn, UserPlus } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'INBA', href: '/asociacion', description: 'Historia, misión, equipo, reglamentos' },
    { name: 'Competencias', href: '/competencias', description: 'Calendario, categorías, inscripciones' },
    { name: 'Formación', href: '/formacion', description: 'Programas, cursos, certificación' },
    { name: 'Afiliación', href: '/afiliacion', description: 'Tipos, requisitos, beneficios' },
    { name: 'Contacto', href: '/contacto', description: 'Formulario, redes, información' },
  ]

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur-sm shadow-sm border-b border-border'
          : 'bg-transparent'
      )}
    >
      <nav className="container-inba" aria-label="Navegación principal">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2" aria-label="INBA Ecuador - Inicio">
            <Dumbbell className="h-8 w-8 text-primary" aria-hidden="true" />
            <span className="font-bold text-xl text-foreground">INBA Ecuador</span>
          </Link>

          <div className="hidden md:flex md:items-center md:gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors relative',
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title={item.description}
              >
                {item.name}
                {pathname === item.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              aria-label={`Cambiar a tema ${theme === 'dark' ? 'claro' : 'oscuro'}`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {loading ? (
              <div className="h-10 w-24 animate-pulse bg-muted rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/app"
                  className="btn-primary"
                >
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Mi Academia
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost">
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Link>
                <Link href="/register" className="btn-primary">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrarse
                </Link>
              </div>
            )}

            <button
              className="md:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-2 py-2 text-base font-medium rounded-lg transition-colors',
                    pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Link
                  href="/login"
                  className="btn-outline w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="btn-primary w-full justify-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}