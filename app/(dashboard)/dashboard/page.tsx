import { StatsCard } from '@/components/dashboard/stats-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CHECKLIST } from '@/lib/checklist-items'
import { scoreChecklist } from '@/lib/checklist-scoring'
import { getUserCompany } from '@/lib/supabase/queries'
import {
  AlertTriangle,
  ClipboardList,
  Clock,
  Database,
  GraduationCap,
  Link as LinkIcon,
  Shield,
  TrendingUp,
  TriangleAlert,
  Truck,
  Users,
} from 'lucide-react'
import Link from 'next/link'


export default async function DashboardPage() {
  const { company, companyId, supabase } = await getUserCompany()

  if (!companyId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          Nenhuma empresa encontrada. Configure sua empresa em{' '}
          <a href="/settings" className="text-blue-600 underline">
            Configurações
          </a>
          .
        </p>
      </div>
    )
  }

  const [
    { count: inventoryCount },
    { data: complaints },
    { data: dataSubjects },
    { data: trainings },
    { data: risks },
    { data: suppliers },
    { data: incidents },
    { data: checklistItems },
    { data: documents },
  ] = await Promise.all([
    supabase
      .from('data_inventory')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', companyId),
    supabase.from('complaints').select('status').eq('company_id', companyId),
    supabase
      .from('data_subject_requests')
      .select('status, response_deadline')
      .eq('company_id', companyId),
    supabase.from('trainings').select('id, training_employees(status)').eq('company_id', companyId),
    supabase
      .from('risks')
      .select('status, inherent_probability, inherent_impact')
      .eq('company_id', companyId),
    supabase.from('suppliers').select('has_dpa, access_type').eq('company_id', companyId),
    supabase.from('incidents').select('status').eq('company_id', companyId),
    supabase.from('checklist_items').select('item_key, status').eq('company_id', companyId),
    supabase.from('documents').select('status, expiration_date').eq('company_id', companyId),
  ])

  // Metrics
  const complaintsUnderReview = (complaints ?? []).filter((d) => d.status === 'under_review').length
  const pendingDataSubjects = (dataSubjects ?? []).filter((t) => t.status === 'pending').length
  const overdueDataSubjects = (dataSubjects ?? []).filter(
    (t) =>
      t.status === 'pending' && t.response_deadline && new Date(t.response_deadline) < new Date(),
  ).length

  const allEmployees = (trainings ?? []).flatMap((t: any) => t.training_employees ?? [])
  const totalEmployees = allEmployees.length
  const completedEmployees = allEmployees.filter((c: any) => c.status === 'completed').length

  const openRisks = (risks ?? []).filter((r) => r.status !== 'closed')
  const criticalRisks = openRisks.filter(
    (r) => r.inherent_probability * r.inherent_impact >= 15,
  )
  const suppliersWithoutDPA = (suppliers ?? []).filter(
    (f) => f.access_type !== 'no_data_access' && !f.has_dpa,
  )
  const openIncidents = (incidents ?? []).filter((i) => !['resolved', 'closed'].includes(i.status))
  const expiredDocuments = (documents ?? []).filter(
    (d) => d.expiration_date && new Date(d.expiration_date) < new Date(),
  )
  const checklist = scoreChecklist(checklistItems ?? [])

  // Overall compliance score
  const overallScore = Math.round(
    checklist.percentage * 0.4 +
      (suppliersWithoutDPA.length === 0 ? 100 : Math.max(0, 100 - suppliersWithoutDPA.length * 20)) * 0.2 +
      (criticalRisks.length === 0 ? 100 : Math.max(0, 100 - criticalRisks.length * 25)) * 0.2 +
      (openIncidents.length === 0 ? 100 : Math.max(0, 100 - openIncidents.length * 15)) * 0.2,
  )

  const scoreColor =
    overallScore >= 70 ? 'text-green-600' : overallScore >= 40 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg =
    overallScore >= 70
      ? 'border-green-200 bg-green-50'
      : overallScore >= 40
        ? 'border-yellow-200 bg-yellow-50'
        : 'border-red-200 bg-red-50'
  const scoreLabel =
    overallScore >= 70
      ? 'Boa adequação'
      : overallScore >= 40
        ? 'Adequação parcial'
        : 'Atenção necessária'

  // Urgent alerts
  const alerts = [
    ...(criticalRisks.length > 0
      ? [
          {
            title: `${criticalRisks.length} risco(s) crítico(s) sem tratamento`,
            href: '/risks',
            priority: 'high' as const,
          },
        ]
      : []),
    ...(openIncidents.length > 0
      ? [
          {
            title: `${openIncidents.length} incidente(s) em aberto`,
            href: '/incidents',
            priority: 'high' as const,
          },
        ]
      : []),
    ...(overdueDataSubjects > 0
      ? [
          {
            title: `${overdueDataSubjects} solicitação(ões) de titular em atraso`,
            href: '/data-subjects',
            priority: 'high' as const,
          },
        ]
      : []),
    ...(suppliersWithoutDPA.length > 0
      ? [
          {
            title: `${suppliersWithoutDPA.length} fornecedor(es) sem DPA assinado`,
            href: '/suppliers',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(expiredDocuments.length > 0
      ? [
          {
            title: `${expiredDocuments.length} documento(s) vencido(s)`,
            href: '/documents',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(pendingDataSubjects > 0
      ? [
          {
            title: `${pendingDataSubjects} solicitação(ões) de titular pendente(s)`,
            href: '/data-subjects',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(complaintsUnderReview > 0
      ? [
          {
            title: `${complaintsUnderReview} denúncia(s) em análise`,
            href: '/complaints',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(inventoryCount === 0
      ? [
          {
            title: 'Inventário de dados vazio — mapeie os processos',
            href: '/inventory',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(!company?.privacy_policy_url
      ? [
          {
            title: 'Adicionar URL da Política de Privacidade',
            href: '/settings',
            priority: 'low' as const,
          },
        ]
      : []),
  ]

  const priorityVariant: Record<string, 'destructive' | 'warning' | 'secondary'> = {
    high: 'destructive',
    medium: 'warning',
    low: 'secondary',
  }

  // Module status
  const modules = [
    { name: 'Checklist LGPD', href: '/checklist', progress: checklist.percentage },
    {
      name: 'Inventário de Dados',
      href: '/inventory',
      progress: (inventoryCount ?? 0) > 0 ? 100 : 0,
    },
    {
      name: 'Fornecedores c/ DPA',
      href: '/suppliers',
      progress:
        (suppliers ?? []).length > 0
          ? Math.round(
              ((suppliers ?? []).filter((f) => f.has_dpa).length / (suppliers ?? []).length) *
                100,
            )
          : 0,
    },
    {
      name: 'Treinamentos',
      href: '/trainings',
      progress: totalEmployees > 0 ? Math.round((completedEmployees / totalEmployees) * 100) : 0,
    },
    {
      name: 'Riscos encerrados',
      href: '/risks',
      progress:
        (risks ?? []).length > 0
          ? Math.round(
              ((risks ?? []).filter((r) => r.status === 'closed').length / (risks ?? []).length) *
                100,
            )
          : 0,
    },
    {
      name: 'Página Pública LGPD',
      href: '/settings',
      progress: Math.round(
        (([company?.slug, company?.dpo_name && company?.dpo_email, company?.privacy_policy_url].filter(
          Boolean,
        ).length /
          3) *
          100,
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da adequação à LGPD</p>
      </div>

      {/* Score de conformidade */}
      <Card className={`border-2 ${scoreBg}`}>
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-2 gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <span className="font-semibold text-gray-900 text-sm md:text-base">
                  Índice de Conformidade LGPD
                </span>
                <p className="text-xs text-gray-500">
                  {scoreLabel} · Checklist (40%) + Fornecedores (20%) + Riscos (20%) + Incidentes
                  (20%)
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-2xl md:text-3xl font-bold ${scoreColor}`}>{overallScore}%</span>
              <Link href="/report" className="block text-xs text-blue-600 hover:underline mt-0.5">
                Ver relatório
              </Link>
            </div>
          </div>
          <Progress value={overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Riscos Críticos"
          value={criticalRisks.length}
          description={`${openRisks.length} abertos no total`}
          icon={TriangleAlert}
          color={criticalRisks.length > 0 ? 'red' : 'green'}
        />
        <StatsCard
          title="Checklist"
          value={`${checklist.percentage}%`}
          description={`${checklist.completed}/${checklist.total - checklist.notApplicable} concluídos`}
          icon={ClipboardList}
          color="blue"
        />
        <StatsCard
          title="Fornecedores"
          value={`${(suppliers ?? []).filter((f) => f.has_dpa).length}/${(suppliers ?? []).length}`}
          description="com DPA assinado"
          icon={Truck}
          color={suppliersWithoutDPA.length > 0 ? 'yellow' : 'green'}
        />
        <StatsCard
          title="Titulares"
          value={pendingDataSubjects}
          description={overdueDataSubjects > 0 ? `${overdueDataSubjects} em atraso!` : 'pendentes'}
          icon={Users}
          color={overdueDataSubjects > 0 ? 'red' : pendingDataSubjects > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Stats secundários */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Inventário"
          value={inventoryCount ?? 0}
          description="processos mapeados"
          icon={Database}
          color="blue"
        />
        <StatsCard
          title="Treinamentos"
          value={`${completedEmployees}/${totalEmployees}`}
          description="colaboradores treinados"
          icon={GraduationCap}
          color="green"
        />
        <StatsCard
          title="Incidentes"
          value={openIncidents.length}
          description="em aberto"
          icon={AlertTriangle}
          color={openIncidents.length > 0 ? 'red' : 'green'}
        />
        <StatsCard
          title="Denúncias"
          value={complaintsUnderReview}
          description="em análise"
          icon={AlertTriangle}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Alertas e pendências */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-orange-500" />
              Alertas e Pendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-green-600 font-medium">
                Sem pendências urgentes. Plataforma em dia!
              </p>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 8).map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-2 w-2 rounded-full flex-shrink-0 ${item.priority === 'high' ? 'bg-red-500' : item.priority === 'medium' ? 'bg-yellow-400' : 'bg-gray-300'}`}
                      />
                      <p className="text-sm text-gray-900 truncate group-hover:text-blue-600">
                        {item.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={priorityVariant[item.priority]} className="text-xs">
                        {item.priority}
                      </Badge>
                      <LinkIcon className="h-3 w-3 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status dos módulos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Progresso por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {modules.map((m) => (
                <Link key={m.name} href={m.href} className="block group">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                        {m.name}
                      </span>
                      <span
                        className={`text-xs font-semibold ${m.progress >= 80 ? 'text-green-600' : m.progress >= 40 ? 'text-yellow-600' : 'text-red-500'}`}
                      >
                        {m.progress}%
                      </span>
                    </div>
                    <Progress value={m.progress} className="h-1.5" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
