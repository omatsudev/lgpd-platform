'use client'

import { Bell, ChevronDown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  empresaNome?: string
  userName?: string
}

export function Header({ empresaNome = 'Minha Empresa', userName = 'Usuário' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Building2 className="h-4 w-4" />
        <span className="font-medium">{empresaNome}</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
          <div className="h-7 w-7 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xs text-white font-bold">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <span>{userName}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
      </div>
    </header>
  )
}
