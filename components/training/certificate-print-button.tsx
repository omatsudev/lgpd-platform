'use client'

import { Download } from 'lucide-react'
import { trackButtonClass } from './track-shell'

export function CertificatePrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={trackButtonClass}>
      <Download className="h-4 w-4" /> Baixar PDF
    </button>
  )
}
