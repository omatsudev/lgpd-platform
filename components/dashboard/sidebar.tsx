'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard, Database, GraduationCap, AlertTriangle,
  Users, Building2, Settings, ScrollText, Bell, LogOut, Menu, X,
  ShieldAlert, FileText, ClipboardCheck, Truck, ClipboardList, Cookie, TriangleAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/checklist', label: 'Checklist LGPD', icon: ClipboardList },
  { href: '/cookies', label: 'Verificador de Site', icon: Cookie },
  { href: '/inventario', label: 'Inventário de Dados', icon: Database },
  { href: '/riscos', label: 'Gestão de Riscos', icon: TriangleAlert },
  { href: '/incidentes', label: 'Gestão de Incidentes', icon: ShieldAlert },
  { href: '/documentos', label: 'Documentos', icon: FileText },
  { href: '/consentimentos', label: 'Consentimentos', icon: ClipboardCheck },
  { href: '/fornecedores', label: 'Fornecedores', icon: Truck },
  { href: '/treinamentos', label: 'Treinamentos', icon: GraduationCap },
  { href: '/denuncias', label: 'Canal de Denúncias', icon: AlertTriangle },
  { href: '/titulares', label: 'Direitos dos Titulares', icon: Users },
  { href: '/colaboradores', label: 'Colaboradores', icon: Users },
  { href: '/empresas', label: 'Empresas (DPO)', icon: Building2 },
  { href: '/logs', label: 'Logs de Auditoria', icon: ScrollText },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <Link href="/" onClick={onClose}>
          <Image src="/logo.jpg" alt="Serra Privacy" width={130} height={46} className="object-contain rounded-lg" priority />
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-blue-200 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive ? 'text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
              )}
              style={isActive ? { background: 'linear-gradient(90deg, #00bcd4, #0097a7)' } : {}}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
        <Link
          href="/notificacoes"
          onClick={onClose}
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
    </>
  )
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <Menu className="h-5 w-5 text-gray-600" />
    </button>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 flex-col"
        style={{ background: 'linear-gradient(180deg, #0f2d5e 0%, #0a1f42 100%)' }}
      >
        <NavContent />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 flex flex-col lg:hidden transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ background: 'linear-gradient(180deg, #0f2d5e 0%, #0a1f42 100%)' }}
      >
        <NavContent onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Floating mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 flex items-center justify-center h-10 w-10 rounded-xl shadow-lg text-white"
        style={{ background: 'linear-gradient(135deg, #0f2d5e, #00bcd4)' }}
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}
