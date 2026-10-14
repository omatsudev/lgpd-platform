import { LockedFeature } from '@/components/dashboard/locked-feature'
import { TrainingReportTable } from '@/components/training/training-report-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getUserCompany } from '@/lib/supabase/queries'
import { isTrainingManager } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import { Download, GraduationCap, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TrainingsPage() {
  const { companyId, company, role } = await getUserCompany()
  if (company?.plan === 'basico') return <LockedFeature moduleKey="trainings" reason="plan" />
  if (!isTrainingManager(role)) redirect('/trainings/track')
  if (!companyId) redirect('/dashboard')

  const training = await createTrainingModule()
  const report = await training.getCompanyTrainingReport.execute(companyId)
  const { summary } = report

  const stats = [
    { label: 'Colaboradores na trilha', value: summary.enrolled },
    { label: 'Em andamento', value: summary.inProgress },
    { label: 'Concluíram (certificado)', value: summary.completed },
    {
      label: 'Nota média na avaliação',
      value: summary.averageScore === null ? '—' : `${Math.round(summary.averageScore * 100)}%`,
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Treinamentos</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Acompanhe o progresso dos colaboradores na trilha {report.trackTitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/collaborators">
            <Button variant="outline">
              <UserPlus className="h-4 w-4" /> Convidar colaboradores
            </Button>
          </Link>
          <Link href="/trainings/track">
            <Button variant="outline">
              <GraduationCap className="h-4 w-4" /> Ver trilha
            </Button>
          </Link>
          <a href="/trainings/report" download>
            <Button disabled={report.rows.length === 0}>
              <Download className="h-4 w-4" /> Exportar CSV
            </Button>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {report.rows.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <GraduationCap className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="font-medium text-gray-500">Nenhum colaborador iniciou a trilha ainda</p>
            <p className="mt-1 text-sm text-gray-400">
              Convide colaboradores: ao entrar na plataforma, eles acessam o treinamento pelo menu
              Treinamentos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <TrainingReportTable rows={report.rows} />
      )}
    </div>
  )
}
