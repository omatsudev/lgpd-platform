'use client'

import { Bell, ChevronDown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  empresaNome?: string
  userName?: string
}

export function Header({ empresaNome = 'Minha Empresa', userName = 'Usuário' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm">
      {/* Spacer for mobile hamburger button */}
      <div className="w-12 lg:hidden" />

      <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
        <Building2 className="h-4 w-4 flex-shrink-0" style={{ color: '#0f2d5e' }} />
        <span className="font-semibold truncate" style={{ color: '#0f2d5e' }}>{empresaNome}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative flex-shrink-0">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ background: '#00bcd4' }} />
        </Button>
        <button className="flex items-center gap-2 rounded-lg px-2 md:px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0f2d5e, #00bcd4)' }}>
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="hidden sm:inline">{userName}</span>
          <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:inline" />
        </button>
      </div>
    </header>
  )
}
