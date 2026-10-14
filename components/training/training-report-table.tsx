import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type {
  LearnerReportRow,
  LearnerReportStatus,
} from '@/lib/training/application/use-cases/get-company-training-report'
import { formatDate } from './labels'

const STATUS: Record<
  LearnerReportStatus,
  { label: string; variant: 'success' | 'warning' | 'secondary' }
> = {
  completed: { label: 'Concluído', variant: 'success' },
  in_progress: { label: 'Em andamento', variant: 'warning' },
  not_started: { label: 'Não iniciado', variant: 'secondary' },
}

const score = (row: LearnerReportRow) =>
  row.bestExamScore === null ? '—' : `${Math.round(row.bestExamScore * 100)}%`

export function TrainingReportTable({ rows }: { rows: LearnerReportRow[] }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <th scope="col" className="px-4 py-3">
                  Colaborador
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Progresso
                </th>
                <th scope="col" className="px-4 py-3">
                  Módulos
                </th>
                <th scope="col" className="px-4 py-3">
                  Nota
                </th>
                <th scope="col" className="px-4 py-3">
                  Conclusão
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.enrollmentId} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{row.learnerName}</p>
                    <p className="text-xs text-gray-500">{row.learnerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS[row.status].variant}>{STATUS[row.status].label}</Badge>
                  </td>
                  <td className="w-40 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress value={row.completionPercent} className="h-1.5" />
                      <span className="text-xs text-gray-500">{row.completionPercent}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.completedModules}/{row.totalModules}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {score(row)}
                    {row.examAttempts > 0 && (
                      <span className="block text-xs text-gray-400">
                        {row.examAttempts} tentativa{row.examAttempts > 1 ? 's' : ''}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.completedAt ? formatDate(row.completedAt) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="divide-y divide-gray-100 md:hidden">
          {rows.map((row) => (
            <li key={row.enrollmentId} className="space-y-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-900">{row.learnerName}</p>
                  <p className="truncate text-xs text-gray-500">{row.learnerEmail}</p>
                </div>
                <Badge variant={STATUS[row.status].variant}>{STATUS[row.status].label}</Badge>
              </div>
              <Progress value={row.completionPercent} className="h-1.5" />
              <p className="text-xs text-gray-500">
                {row.completionPercent}% · {row.completedModules}/{row.totalModules} módulos · nota{' '}
                {score(row)}
                {row.completedAt && ` · concluído em ${formatDate(row.completedAt)}`}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
