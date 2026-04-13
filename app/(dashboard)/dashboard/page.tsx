import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CHECKLIST } from '@/lib/checklist-items'
import {
  Database, GraduationCap, AlertTriangle, Users, Clock,
  TrendingUp, Shield, TriangleAlert, Truck, ClipboardList, Link as LinkIcon,
} from 'lucide-react'
import Link from 'next/link'
import { getUserEmpresa } from '@/lib/supabase/queries'

function scoreChecklist(itens: any[]) {
  const total = CHECKLIST.reduce((acc, c) => acc + c.itens.length, 0)
  const map: Record<string, string> = {}
  for (const i of itens) map[i.item_key] = i.status
  const na = CHECKLIST.reduce((acc, c) => acc + c.itens.filter((i: any) => map[i.key] === 'nao_aplicavel').length, 0)
  const done = CHECKLIST.reduce((acc, c) => acc + c.itens.filter((i: any) => map[i.key] === 'concluido').length, 0)
  const efetivos = total - na
  return { total, done, efetivos, pct: efetivos > 0 ? Math.round((done / efetivos) * 100) : 0 }
}

export default async function DashboardPage() {
  const { empresa, empresaId, supabase } = await getUserEmpresa()

  if (!empresaId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">
          Nenhuma empresa encontrada. Configure sua empresa em{' '}
          <a href="/configuracoes" className="text-blue-600 underline">Configurações</a>.
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
    supabase.from('inventario_dados').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId),
    supabase.from('denuncias').select('status').eq('empresa_id', empresaId),
    supabase.from('solicitacoes_titulares').select('status, prazo_resposta').eq('empresa_id', empresaId),
    supabase.from('treinamentos').select('id, treinamento_colaboradores(status)').eq('empresa_id', empresaId),
    supabase.from('riscos').select('status, probabilidade_inerente, impacto_inerente').eq('empresa_id', empresaId),
    supabase.from('fornecedores').select('possui_dpa, tipo_acesso').eq('empresa_id', empresaId),
    supabase.from('incidentes').select('status').eq('empresa_id', empresaId),
    supabase.from('checklist_itens').select('item_key, status').eq('empresa_id', empresaId),
    supabase.from('documentos').select('status, data_expiracao').eq('empresa_id', empresaId),
  ])

  // Métricas
  const denunciasEmAnalise = (denuncias ?? []).filter(d => d.status === 'em_analise').length
  const titularesPendentes = (titulares ?? []).filter(t => t.status === 'pendente').length
  const titularesAtrasados = (titulares ?? []).filter(t =>
    t.status === 'pendente' && t.prazo_resposta && new Date(t.prazo_resposta) < new Date()
  ).length

  const todosColabs = (treinamentos ?? []).flatMap((t: any) => t.treinamento_colaboradores ?? [])
  const colabsTotal = todosColabs.length
  const colabsConcluidos = todosColabs.filter((c: any) => c.status === 'concluido').length

  const riscosAbertos = (riscos ?? []).filter(r => r.status !== 'encerrado')
  const riscosCriticos = riscosAbertos.filter(r => r.probabilidade_inerente * r.impacto_inerente >= 15)
  const fornSemDPA = (fornecedores ?? []).filter(f => f.tipo_acesso !== 'sem_acesso_dados' && !f.possui_dpa)
  const incAbertos = (incidentes ?? []).filter(i => !['resolvido', 'encerrado'].includes(i.status))
  const docVencidos = (documentos ?? []).filter(d => d.data_expiracao && new Date(d.data_expiracao) < new Date())
  const checklist = scoreChecklist(checklistItens ?? [])

  // Score de conformidade (mesmo algoritmo do relatório)
  const scoreGeral = Math.round(
    (checklist.pct * 0.4) +
    ((fornSemDPA.length === 0 ? 100 : Math.max(0, 100 - fornSemDPA.length * 20)) * 0.2) +
    ((riscosCriticos.length === 0 ? 100 : Math.max(0, 100 - riscosCriticos.length * 25)) * 0.2) +
    ((incAbertos.length === 0 ? 100 : Math.max(0, 100 - incAbertos.length * 15)) * 0.2)
  )

  const scoreColor = scoreGeral >= 70 ? 'text-green-600' : scoreGeral >= 40 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg = scoreGeral >= 70 ? 'border-green-200 bg-green-50' : scoreGeral >= 40 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'
  const scoreLabel = scoreGeral >= 70 ? 'Boa adequação' : scoreGeral >= 40 ? 'Adequação parcial' : 'Atenção necessária'

  // Alertas urgentes
  const alertas = [
    ...(riscosCriticos.length > 0 ? [{ titulo: `${riscosCriticos.length} risco(s) crítico(s) sem tratamento`, href: '/riscos', prioridade: 'alta' as const }] : []),
    ...(incAbertos.length > 0 ? [{ titulo: `${incAbertos.length} incidente(s) em aberto`, href: '/incidentes', prioridade: 'alta' as const }] : []),
    ...(titularesAtrasados > 0 ? [{ titulo: `${titularesAtrasados} solicitação(ões) de titular em atraso`, href: '/titulares', prioridade: 'alta' as const }] : []),
    ...(fornSemDPA.length > 0 ? [{ titulo: `${fornSemDPA.length} fornecedor(es) sem DPA assinado`, href: '/fornecedores', prioridade: 'media' as const }] : []),
    ...(docVencidos.length > 0 ? [{ titulo: `${docVencidos.length} documento(s) vencido(s)`, href: '/documentos', prioridade: 'media' as const }] : []),
    ...(titularesPendentes > 0 ? [{ titulo: `${titularesPendentes} solicitação(ões) de titular pendente(s)`, href: '/titulares', prioridade: 'media' as const }] : []),
    ...(denunciasEmAnalise > 0 ? [{ titulo: `${denunciasEmAnalise} denúncia(s) em análise`, href: '/denuncias', prioridade: 'media' as const }] : []),
    ...(inventarioCount === 0 ? [{ titulo: 'Inventário de dados vazio — mapeie os processos', href: '/inventario', prioridade: 'media' as const }] : []),
    ...(!empresa?.politica_privacidade_url ? [{ titulo: 'Adicionar URL da Política de Privacidade', href: '/configuracoes', prioridade: 'baixa' as const }] : []),
  ]

  const prioridadeVariant: Record<string, 'destructive' | 'warning' | 'secondary'> = {
    alta: 'destructive', media: 'warning', baixa: 'secondary',
  }

  // Status dos módulos
  const modulos = [
    { name: 'Checklist LGPD', href: '/checklist', progress: checklist.pct },
    { name: 'Inventário de Dados', href: '/inventario', progress: (inventarioCount ?? 0) > 0 ? 100 : 0 },
    { name: 'Fornecedores c/ DPA', href: '/fornecedores', progress: (fornecedores ?? []).length > 0 ? Math.round(((fornecedores ?? []).filter(f => f.possui_dpa).length / (fornecedores ?? []).length) * 100) : 0 },
    { name: 'Treinamentos', href: '/treinamentos', progress: colabsTotal > 0 ? Math.round((colabsConcluidos / colabsTotal) * 100) : 0 },
    { name: 'Riscos encerrados', href: '/riscos', progress: (riscos ?? []).length > 0 ? Math.round(((riscos ?? []).filter(r => r.status === 'encerrado').length / (riscos ?? []).length) * 100) : 0 },
    { name: 'Página Pública LGPD', href: '/configuracoes', progress: empresa?.slug ? 100 : 0 },
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
                <span className="font-semibold text-gray-900 text-sm md:text-base">Índice de Conformidade LGPD</span>
                <p className="text-xs text-gray-500">{scoreLabel} · Checklist (40%) + Fornecedores (20%) + Riscos (20%) + Incidentes (20%)</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className={`text-2xl md:text-3xl font-bold ${scoreColor}`}>{scoreGeral}%</span>
              <Link href="/relatorio" className="block text-xs text-blue-600 hover:underline mt-0.5">Ver relatório</Link>
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
          value={`${(fornecedores ?? []).filter(f => f.possui_dpa).length}/${(fornecedores ?? []).length}`}
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
        <StatsCard title="Inventário" value={inventarioCount ?? 0} description="processos mapeados" icon={Database} color="blue" />
        <StatsCard title="Treinamentos" value={`${colabsConcluidos}/${colabsTotal}`} description="colaboradores treinados" icon={GraduationCap} color="green" />
        <StatsCard title="Incidentes" value={incAbertos.length} description="em aberto" icon={AlertTriangle} color={incAbertos.length > 0 ? 'red' : 'green'} />
        <StatsCard title="Denúncias" value={denunciasEmAnalise} description="em análise" icon={AlertTriangle} color="yellow" />
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
              <p className="text-sm text-green-600 font-medium">Sem pendências urgentes. Plataforma em dia!</p>
            ) : (
              <div className="space-y-2">
                {alertas.slice(0, 8).map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`h-2 w-2 rounded-full flex-shrink-0 ${item.prioridade === 'alta' ? 'bg-red-500' : item.prioridade === 'media' ? 'bg-yellow-400' : 'bg-gray-300'}`} />
                      <p className="text-sm text-gray-900 truncate group-hover:text-blue-600">{item.titulo}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={prioridadeVariant[item.prioridade]} className="text-xs">{item.prioridade}</Badge>
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
                      <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">{m.name}</span>
                      <span className={`text-xs font-semibold ${m.progress >= 80 ? 'text-green-600' : m.progress >= 40 ? 'text-yellow-600' : 'text-red-500'}`}>{m.progress}%</span>
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
