import type { LearnerReportRow } from './use-cases/get-company-training-report'

const STATUS_LABELS: Record<LearnerReportRow['status'], string> = {
  not_started: 'Não iniciado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

const HEADER = [
  'Colaborador',
  'E-mail',
  'Status',
  'Progresso (%)',
  'Módulos concluídos',
  'Tentativas na avaliação final',
  'Melhor nota (%)',
  'Início',
  'Conclusão',
  'Código do certificado',
]

function escapeCell(value: string): string {
  // Neutralizes spreadsheet formula injection and quotes separators.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

function formatDate(date: Date | null): string {
  return date ? date.toISOString().slice(0, 10) : ''
}

/** Semicolon-separated CSV with BOM, the format Excel opens correctly in pt-BR. */
export function toReportCsv(rows: readonly LearnerReportRow[]): string {
  const lines = rows.map((row) =>
    [
      row.learnerName,
      row.learnerEmail,
      STATUS_LABELS[row.status],
      String(row.completionPercent),
      `${row.completedModules}/${row.totalModules}`,
      String(row.examAttempts),
      row.bestExamScore === null ? '' : String(Math.round(row.bestExamScore * 100)),
      formatDate(row.startedAt),
      formatDate(row.completedAt),
      row.certificateCode ?? '',
    ]
      .map(escapeCell)
      .join(';'),
  )
  return '﻿' + [HEADER.join(';'), ...lines].join('\r\n')
}
