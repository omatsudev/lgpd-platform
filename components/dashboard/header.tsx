'use client'

import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import { Bell, Building2, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type HeaderNotification = {
  id: string
  title: string
  message: string
  link: string | null
  created_at: string
}

interface HeaderProps {
  companyName?: string
  userName?: string
  companies?: { id: string; name: string }[]
  currentCompanyId?: string | null
  switchCompanyAction?: (formData: FormData) => Promise<void>
  notifications?: HeaderNotification[]
  unreadCount?: number
}

export function Header({
  companyName = 'Minha Empresa',
  userName = 'Usuário',
  companies = [],
  currentCompanyId,
  switchCompanyAction,
  notifications = [],
  unreadCount = 0,
}: HeaderProps) {
  const hasMultiple = companies.length > 1
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm">
      {/* Spacer for mobile hamburger button */}
      <div className="w-12 lg:hidden" />

      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
        <Building2 className="h-4 w-4 flex-shrink-0" style={{ color: '#0f2d5e' }} />

        {hasMultiple && switchCompanyAction ? (
          <form action={switchCompanyAction} className="flex items-center">
            <select
              name="companyId"
              defaultValue={currentCompanyId ?? ''}
              onChange={(e) => e.currentTarget.form?.requestSubmit()}
              className="appearance-none font-semibold text-sm border-none outline-none bg-transparent cursor-pointer pr-1 max-w-[180px] md:max-w-xs truncate"
              style={{ color: '#0f2d5e' }}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-3 w-3 flex-shrink-0" style={{ color: '#0f2d5e' }} />
          </form>
        ) : (
          <span className="font-semibold truncate" style={{ color: '#0f2d5e' }}>
            {companyName}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative" ref={panelRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative flex-shrink-0"
            onClick={() => setOpen((o) => !o)}
          >
            <Bell className="h-5 w-5 text-gray-500" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 h-2 w-2 rounded-full"
                style={{ background: '#00bcd4' }}
              />
            )}
          </Button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-lg z-50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-900">Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-xs text-gray-400">{unreadCount} não lida(s)</span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-gray-400 text-center">
                    Nenhuma notificação nova
                  </p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.link ?? '/notificacoes'}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <p className="text-sm font-medium text-gray-900">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                    </Link>
                  ))
                )}
              </div>
              <Link
                href="/notificacoes"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-gray-50 border-t border-gray-100"
              >
                Ver todas
              </Link>
            </div>
          )}
        </div>
        <button className="flex items-center gap-2 rounded-lg px-2 md:px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #0f2d5e, #00bcd4)' }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{userName}</span>
          <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:inline" />
        </button>
      </div>
    </header>
  )
}
