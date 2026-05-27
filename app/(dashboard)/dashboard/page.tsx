import { StatsCard } from '@/components/dashboard/stats-card'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CHECKLIST } from '@/lib/checklist-items'
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

function scoreChecklist(itens: any[]) {
  const total = CHECKLIST.reduce((acc, c) => acc + c.items.length, 0)
  const map: Record<string, string> = {}
  for (const i of itens) map[i.item_key] = i.status
  const na = CHECKLIST.reduce(
    (acc, c) => acc + c.items.filter((i: any) => map[i.key] === 'not_applicable').length,
    0,
  )
  const done = CHECKLIST.reduce(
    (acc, c) => acc + c.items.filter((i: any) => map[i.key] === 'completed').length,
    0,
  )
  const efetivos = total - na
  return { total, done, efetivos, pct: efetivos > 0 ? Math.round((done / efetivos) * 100) : 0 }
}

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
    { count: inventarioCount },
    { data: denuncias },
    { data: titulares },
    { data: treinamentos },
    { data: riscos },
    { data: fornecedores },
    { data: incidentes },
    { data: checklistItens },
    { data: documentos },
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
  const denunciasEmAnalise = (denuncias ?? []).filter((d) => d.status === 'under_review').length
  const titularesPendentes = (titulares ?? []).filter((t) => t.status === 'pending').length
  const titularesAtrasados = (titulares ?? []).filter(
    (t) =>
      t.status === 'pending' && t.response_deadline && new Date(t.response_deadline) < new Date(),
  ).length

  const todosColabs = (treinamentos ?? []).flatMap((t: any) => t.training_employees ?? [])
  const colabsTotal = todosColabs.length
  const colabsConcluidos = todosColabs.filter((c: any) => c.status === 'completed').length

  const riscosAbertos = (riscos ?? []).filter((r) => r.status !== 'closed')
  const riscosCriticos = riscosAbertos.filter(
    (r) => r.inherent_probability * r.inherent_impact >= 15,
  )
  const fornSemDPA = (fornecedores ?? []).filter(
    (f) => f.access_type !== 'no_data_access' && !f.has_dpa,
  )
  const incAbertos = (incidentes ?? []).filter((i) => !['resolved', 'closed'].includes(i.status))
  const docVencidos = (documentos ?? []).filter(
    (d) => d.expiration_date && new Date(d.expiration_date) < new Date(),
  )
  const checklist = scoreChecklist(checklistItens ?? [])

  // Overall compliance score
  const scoreGeral = Math.round(
    checklist.pct * 0.4 +
      (fornSemDPA.length === 0 ? 100 : Math.max(0, 100 - fornSemDPA.length * 20)) * 0.2 +
      (riscosCriticos.length === 0 ? 100 : Math.max(0, 100 - riscosCriticos.length * 25)) * 0.2 +
      (incAbertos.length === 0 ? 100 : Math.max(0, 100 - incAbertos.length * 15)) * 0.2,
  )

  const scoreColor =
    scoreGeral >= 70 ? 'text-green-600' : scoreGeral >= 40 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg =
    scoreGeral >= 70
      ? 'border-green-200 bg-green-50'
      : scoreGeral >= 40
        ? 'border-yellow-200 bg-yellow-50'
        : 'border-red-200 bg-red-50'
  const scoreLabel =
    scoreGeral >= 70
      ? 'Boa adequação'
      : scoreGeral >= 40
        ? 'Adequação parcial'
        : 'Atenção necessária'

  // Urgent alerts
  const alertas = [
    ...(riscosCriticos.length > 0
      ? [
          {
            title: `${riscosCriticos.length} risco(s) crítico(s) sem tratamento`,
            href: '/risks',
            priority: 'high' as const,
          },
        ]
      : []),
    ...(incAbertos.length > 0
      ? [
          {
            title: `${incAbertos.length} incidente(s) em aberto`,
            href: '/incidents',
            priority: 'high' as const,
          },
        ]
      : []),
    ...(titularesAtrasados > 0
      ? [
          {
            title: `${titularesAtrasados} solicitação(ões) de titular em atraso`,
            href: '/data-subjects',
            priority: 'high' as const,
          },
        ]
      : []),
    ...(fornSemDPA.length > 0
      ? [
          {
            title: `${fornSemDPA.length} fornecedor(es) sem DPA assinado`,
            href: '/suppliers',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(docVencidos.length > 0
      ? [
          {
            title: `${docVencidos.length} documento(s) vencido(s)`,
            href: '/documents',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(titularesPendentes > 0
      ? [
          {
            title: `${titularesPendentes} solicitação(ões) de titular pendente(s)`,
            href: '/data-subjects',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(denunciasEmAnalise > 0
      ? [
          {
            title: `${denunciasEmAnalise} denúncia(s) em análise`,
            href: '/complaints',
            priority: 'medium' as const,
          },
        ]
      : []),
    ...(inventarioCount === 0
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
  const modulos = [
    { name: 'Checklist LGPD', href: '/checklist', progress: checklist.pct },
    {
      name: 'Inventário de Dados',
      href: '/inventory',
      progress: (inventarioCount ?? 0) > 0 ? 100 : 0,
    },
    {
      name: 'Fornecedores c/ DPA',
      href: '/suppliers',
      progress:
        (fornecedores ?? []).length > 0
          ? Math.round(
              ((fornecedores ?? []).filter((f) => f.has_dpa).length / (fornecedores ?? []).length) *
                100,
            )
          : 0,
    },
    {
      name: 'Treinamentos',
      href: '/trainings',
      progress: colabsTotal > 0 ? Math.round((colabsConcluidos / colabsTotal) * 100) : 0,
    },
    {
      name: 'Riscos encerrados',
      href: '/risks',
      progress:
        (riscos ?? []).length > 0
          ? Math.round(
              ((riscos ?? []).filter((r) => r.status === 'closed').length / (riscos ?? []).length) *
                100,
            )
          : 0,
    },
    { name: 'Página Pública LGPD', href: '/settings', progress: company?.slug ? 100 : 0 },
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
              <span className={`text-2xl md:text-3xl font-bold ${scoreColor}`}>{scoreGeral}%</span>
              <Link href="/report" className="block text-xs text-blue-600 hover:underline mt-0.5">
                Ver relatório
              </Link>
            </div>
          </div>
          <Progress value={scoreGeral} className="h-3" />
        </CardContent>
      </Card>

      {/* Stats principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Riscos Críticos"
          value={riscosCriticos.length}
          description={`${riscosAbertos.length} abertos no total`}
          icon={TriangleAlert}
          color={riscosCriticos.length > 0 ? 'red' : 'green'}
        />
        <StatsCard
          title="Checklist"
          value={`${checklist.pct}%`}
          description={`${checklist.done}/${checklist.efetivos} concluídos`}
          icon={ClipboardList}
          color="blue"
        />
        <StatsCard
          title="Fornecedores"
          value={`${(fornecedores ?? []).filter((f) => f.has_dpa).length}/${(fornecedores ?? []).length}`}
          description="com DPA assinado"
          icon={Truck}
          color={fornSemDPA.length > 0 ? 'yellow' : 'green'}
        />
        <StatsCard
          title="Titulares"
          value={titularesPendentes}
          description={titularesAtrasados > 0 ? `${titularesAtrasados} em atraso!` : 'pendentes'}
          icon={Users}
          color={titularesAtrasados > 0 ? 'red' : titularesPendentes > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Stats secundários */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard
          title="Inventário"
          value={inventarioCount ?? 0}
          description="processos mapeados"
          icon={Database}
          color="blue"
        />
        <StatsCard
          title="Treinamentos"
          value={`${colabsConcluidos}/${colabsTotal}`}
          description="colaboradores treinados"
          icon={GraduationCap}
          color="green"
        />
        <StatsCard
          title="Incidentes"
          value={incAbertos.length}
          description="em aberto"
          icon={AlertTriangle}
          color={incAbertos.length > 0 ? 'red' : 'green'}
        />
        <StatsCard
          title="Denúncias"
          value={denunciasEmAnalise}
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
            {alertas.length === 0 ? (
              <p className="text-sm text-green-600 font-medium">
                Sem pendências urgentes. Plataforma em dia!
              </p>
            ) : (
              <div className="space-y-2">
                {alertas.slice(0, 8).map((item, i) => (
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
              {modulos.map((m) => (
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
