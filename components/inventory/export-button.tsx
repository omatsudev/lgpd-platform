'use client'

import { Button } from '@/components/ui/button'
import { ChevronDown, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { useState } from 'react'

type Item = {
  process_name?: string
  data_type?: string
  purpose?: string
  legal_basis?: string
  responsible_department?: string
  risk_level?: string
  record_status?: string
  created_at?: string
}

const riskLabel: Record<string, string> = { high: 'Alto', medium: 'Médio', low: 'Baixo' }
const statusLabel: Record<string, string> = { complete: 'Completo', draft: 'Rascunho' }

function toCSV(items: Item[]): string {
  const header = [
    'Processo',
    'Setor',
    'Base Legal',
    'Finalidade',
    'Tipo de Dado',
    'Risco',
    'Status',
    'Criado em',
  ]
  const rows = items.map((i) =>
    [
      i.process_name ?? i.data_type ?? '',
      i.responsible_department ?? '',
      i.legal_basis ?? '',
      i.purpose ?? '',
      i.data_type ?? '',
      riskLabel[i.risk_level ?? ''] ?? i.risk_level ?? '',
      statusLabel[i.record_status ?? ''] ?? i.record_status ?? '',
      i.created_at ? new Date(i.created_at).toLocaleDateString('pt-BR') : '',
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  return [header.join(','), ...rows].join('\n')
}

export function ExportButton({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false)

  const exportCSV = () => {
    const csv = toCSV(items)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-lgpd-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setOpen(false)
  }

  const exportPDF = () => {
    window.print()
    setOpen(false)
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)}>
        <Download className="h-4 w-4 mr-1" /> Exportar <ChevronDown className="h-3 w-3 ml-1" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
            <button
              onClick={exportCSV}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-green-600" /> Excel / CSV
            </button>
            <button
              onClick={exportPDF}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-4 w-4 text-red-500" /> PDF (imprimir)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
