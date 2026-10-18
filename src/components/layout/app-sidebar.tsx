'use client'

import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/cn'
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardCheck,
  Award,
  BookOpen,
  Calendar,
  Users,
  Trophy,
  Shield,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Home,
  Building2,
  Dumbbell,
  User,
  FileText,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const navigation = {
  admin: [
    { label: 'Dashboard', href: '/app/admin', icon: LayoutDashboard },
    { label: 'Usuarios', href: '/app/admin/usuarios', icon: Users },
    { label: 'Cursos', href: '/app/admin/cursos', icon: GraduationCap },
    { label: 'Evaluaciones', href: '/app/admin/evaluaciones', icon: ClipboardCheck },
    { label: 'Certificados', href: '/app/admin/certificados', icon: Award },
    { label: 'Afiliaciones', href: '/app/admin/afiliaciones', icon: Users },
    { label: 'Pagos', href: '/app/admin/pagos', icon: CreditCard },
    { label: 'Configuración', href: '/app/admin/configuracion', icon: Settings },
  ],
  docente: [
    { label: 'Panel Docente', href: '/app/docente', icon: LayoutDashboard },
    { label: 'Mis Cursos', href: '/app/docente/cursos', icon: GraduationCap },
    { label: 'Evaluaciones', href: '/app/docente/evaluaciones', icon: ClipboardCheck },
    { label: 'Calificar', href: '/app/docente/calificar', icon: Award },
    { label: 'Prácticas', href: '/app/docente/practicas', icon: BookOpen },
    { label: 'Alumnos', href: '/app/docente/alumnos', icon: Users },
  ],
  estudiante: [
    { label: 'Mi Academia', href: '/app/estudiante', icon: Home },
    { label: 'Mis Cursos', href: '/app/estudiante/cursos', icon: GraduationCap },
    { label: 'Evaluaciones', href: '/app/estudiante/evaluaciones', icon: ClipboardCheck },
    { label: 'Calificaciones', href: '/app/estudiante/calificaciones', icon: Award },
    { label: 'Prácticas', href: '/app/estudiante/practicas', icon: BookOpen },
    { label: 'Calendario', href: '/app/estudiante/calendario', icon: Calendar },
    { label: 'Certificados', href: '/app/estudiante/certificados', icon: Trophy },
  ],
  afiliado: [
    { label: 'Mi Perfil', href: '/app/afiliado', icon: User },
    { label: 'Renovación', href: '/app/afiliado/renovacion', icon: CreditCard },
    { label: 'Eventos', href: '/app/afiliado/eventos', icon: Calendar },
    { label: 'Pagos', href: '/app/afiliado/pagos', icon: CreditCard },
    { label: 'Certificados', href: '/app/afiliado/certificados', icon: Award },
    { label: 'Directorio', href: '/app/afiliado/directorio', icon: Users },
  ],
}

export function AppSidebar() {
  const { profile, signOut } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const highestRole = profile?.roles?.[0] || 'estudiante'
  const navItems = navigation[highestRole as keyof typeof navigation] || navigation.estudiante

  const toggleSidebar = () => setCollapsed(!collapsed)

  return (
    <>
      <Button
        className="lg:hidden fixed top-4 left-4 z-50"
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ boxShadow: 'var(--shadow-lg)' }}
        aria-label="Navegación principal"
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link href="/app" className="flex items-center gap-2" aria-label="INBA Ecuador - Inicio">
              <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              <span className="font-bold text-xl text-foreground">INBA Ecuador</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn('h-8 w-8', collapsed && 'justify-center')}
            aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2" role="navigation" aria-label="Menú principal">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/app' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center'
                )}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          {!collapsed && (
            <div className="space-y-2">
              <Link
                href="/app/perfil"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <User className="h-5 w-5" />
                <span>Mi perfil</span>
              </Link>
              <Link
                href="/app/configuracion"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Settings className="h-5 w-5" />
                <span>Configuración</span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 px-3 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || 'Usuario'} />
              <AvatarFallback className="text-xs font-medium bg-primary text-primary-foreground">
                {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{profile?.full_name || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground capitalize truncate">{highestRole.replace('_', ' ')}</p>
              </div>
            )}
          </div>

          <form action="/api/auth/signout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all',
                collapsed && 'justify-center'
              )}
              title={collapsed ? 'Cerrar sesión' : undefined}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>Cerrar sesión</span>}
            </Button>
          </form>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}