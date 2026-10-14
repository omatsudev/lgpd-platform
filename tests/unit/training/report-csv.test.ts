import { toReportCsv } from '@/lib/training/application/report-csv'
import type { LearnerReportRow } from '@/lib/training/application/use-cases/get-company-training-report'
import { describe, expect, it } from 'vitest'

const row = (overrides: Partial<LearnerReportRow> = {}): LearnerReportRow => ({
  enrollmentId: 'e1',
  learnerName: 'Ana Souza',
  learnerEmail: 'ana@acme.com',
  status: 'completed',
  completionPercent: 100,
  completedModules: 3,
  totalModules: 3,
  examAttempts: 2,
  bestExamScore: 0.8667,
  startedAt: new Date('2026-10-01T10:00:00Z'),
  completedAt: new Date('2026-10-10T10:00:00Z'),
  certificateCode: 'SP-ABCD-EFGH-JKMN',
  ...overrides,
})

describe('toReportCsv', () => {
  it('writes a semicolon separated file with BOM and pt-BR labels', () => {
    const lines = toReportCsv([row()]).split('\r\n')
    expect(lines[0].startsWith('﻿Colaborador;E-mail;Status')).toBe(true)
    expect(lines[1]).toBe(
      'Ana Souza;ana@acme.com;Concluído;100;3/3;2;87;2026-10-01;2026-10-10;SP-ABCD-EFGH-JKMN',
    )
  })

  it('leaves empty cells for missing score and dates', () => {
    const line = toReportCsv([
      row({ status: 'not_started', bestExamScore: null, completedAt: null, certificateCode: null }),
    ]).split('\r\n')[1]
    expect(line).toBe('Ana Souza;ana@acme.com;Não iniciado;100;3/3;2;;2026-10-01;;')
  })

  it('quotes separators and neutralizes spreadsheet formulas', () => {
    const line = toReportCsv([row({ learnerName: '=HYPERLINK("x")', learnerEmail: 'a;b' })]).split(
      '\r\n',
    )[1]
    expect(line.startsWith(`"'=HYPERLINK(""x"")";"a;b";`)).toBe(true)
  })
})
