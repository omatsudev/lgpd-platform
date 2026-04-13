'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="flex items-center gap-2"
      style={{ background: 'linear-gradient(135deg, #0f2d5e, #00bcd4)' }}
    >
      <Printer className="h-4 w-4" />
      Exportar PDF
    </Button>
  )
}
