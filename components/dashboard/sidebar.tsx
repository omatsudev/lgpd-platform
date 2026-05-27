'use client'

import { cn } from '@/lib/utils'
import {
  AlertTriangle,
  BarChart2,
  Bell,
  Building2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cookie,
  Database,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  ShieldAlert,
  TriangleAlert,
  Truck,
  Users,
  X,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const allNavItems = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['empresa', 'admin', 'dpo'],
  },
  {
    href: '/checklist',
    label: 'Checklist LGPD',
    icon: ClipboardList,
    roles: ['empresa', 'admin', 'dpo'],
  },
  { href: '/cookies', label: 'Verificador de Site', icon: Cookie, roles: ['empresa', 'admin'] },
  {
    href: '/inventory',
    label: 'Inventário de Dados',
    icon: Database,
    roles: ['empresa', 'admin', 'dpo'],
  },
  {
    href: '/retention-disposal',
    label: 'Retenção e Descarte',
    icon: Clock,
    roles: ['empresa', 'admin', 'dpo'],
  },
  {
    href: '/risks',
    label: 'Gestão de Riscos',
    icon: TriangleAlert,
    roles: ['empresa', 'admin', 'dpo'],
  },
  { href: '/report', label: 'Relatório LGPD', icon: BarChart2, roles: ['empresa', 'admin', 'dpo'] },
  {
    href: '/incidents',
    label: 'Gestão de Incidentes',
    icon: ShieldAlert,
    roles: ['empresa', 'admin', 'dpo'],
  },
  { href: '/documents', label: 'Documentos', icon: FileText, roles: ['empresa', 'admin', 'dpo'] },
  { href: '/consents', label: 'Consentimentos', icon: ClipboardCheck, roles: ['empresa', 'admin'] },
  { href: '/suppliers', label: 'Fornecedores', icon: Truck, roles: ['empresa', 'admin'] },
  { href: '/trainings', label: 'Treinamentos', icon: GraduationCap, roles: ['empresa', 'admin'] },
  {
    href: '/complaints',
    label: 'Canal de Denúncias',
    icon: AlertTriangle,
    roles: ['empresa', 'admin', 'dpo'],
  },
  {
    href: '/data-subjects',
    label: 'Direitos dos Titulares',
    icon: Users,
    roles: ['empresa', 'admin', 'dpo'],
  },
  { href: '/companies', label: 'Empresas (DPO)', icon: Building2, roles: ['dpo'] },
  {
    href: '/audit-logs',
    label: 'Logs de Auditoria',
    icon: ScrollText,
    roles: ['empresa', 'admin', 'dpo'],
  },
  { href: '/settings', label: 'Configurações', icon: Settings, roles: ['empresa', 'admin', 'dpo'] },
]

function NavContent({ onClose, role }: { onClose?: () => void; role?: string | null }) {
  const pathname = usePathname()
  const navItems = allNavItems.filter((item) => !role || item.roles.includes(role))
  return (
    <>
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <Link href="/" onClick={onClose}>
          <Image
            src="/logo.jpg"
            alt="Serra Privacy"
            width={130}
            height={46}
            className="object-contain rounded-lg"
            priority
          />
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
                isActive ? 'text-white' : 'text-blue-200 hover:text-white hover:bg-white/10',
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
        <p className="px-3 pt-3 text-xs text-blue-300/50 select-none">
          v{process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0'}
        </p>
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

export function Sidebar({ role }: { role?: string | null }) {
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
        <NavContent role={role} />
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
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: 'linear-gradient(180deg, #0f2d5e 0%, #0a1f42 100%)' }}
      >
        <NavContent onClose={() => setMobileOpen(false)} role={role} />
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
