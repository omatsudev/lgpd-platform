import { getUserCompany } from '@/lib/supabase/queries'
import { toReportCsv } from '@/lib/training/application/report-csv'
import { isTrainingManager } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'

export async function GET() {
  const { user, companyId, company, role } = await getUserCompany()
  if (!user) return new Response('Unauthorized', { status: 401 })
  if (!companyId || !isTrainingManager(role) || company?.plan === 'basico') {
    return new Response('Forbidden', { status: 403 })
  }

  const training = await createTrainingModule()
  const report = await training.getCompanyTrainingReport.execute(companyId)
  const date = new Date().toISOString().slice(0, 10)

  return new Response(toReportCsv(report.rows), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="treinamento-lgpd-${date}.csv"`,
      'cache-control': 'no-store',
    },
  })
}
