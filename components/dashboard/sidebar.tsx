'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Database,
  GraduationCap,
  AlertTriangle,
  Users,
  Building2,
  Settings,
  ScrollText,
  Bell,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventario', label: 'Inventário de Dados', icon: Database },
  { href: '/treinamentos', label: 'Treinamentos', icon: GraduationCap },
  { href: '/denuncias', label: 'Canal de Denúncias', icon: AlertTriangle },
  { href: '/titulares', label: 'Direitos dos Titulares', icon: Users },
  { href: '/colaboradores', label: 'Colaboradores', icon: Users },
  { href: '/empresas', label: 'Empresas (DPO)', icon: Building2 },
  { href: '/logs', label: 'Logs de Auditoria', icon: ScrollText },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col" style={{ background: 'linear-gradient(180deg, #0f2d5e 0%, #0a1f42 100%)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.jpg"
            alt="Serra Privacy"
            width={140}
            height={50}
            className="object-contain rounded-lg"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'text-white'
                  : 'text-blue-200 hover:text-white hover:bg-white/10'
              )}
              style={isActive ? { background: 'linear-gradient(90deg, #00bcd4, #0097a7)' } : {}}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/notificacoes"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-all"
        >
          <Bell className="h-4 w-4" />
          Notificações
        </Link>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-200 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
