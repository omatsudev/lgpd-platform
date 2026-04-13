import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Database, GraduationCap, AlertTriangle, Users, Clock, TrendingUp, Shield } from 'lucide-react'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'

const prioridadeMap: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  alta: 'destructive', media: 'warning', baixa: 'secondary',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { empresa, empresaId } = await getUserEmpresa()

  if (!empresaId) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Nenhuma empresa encontrada. Configure sua empresa em <a href="/configuracoes" className="text-blue-600 underline">Configurações</a>.</p>
      </div>
    )
  }

  const [
    { count: inventarioCount },
    { data: denuncias },
    { data: titulares },
    { data: treinamentos },
  ] = await Promise.all([
    supabase.from('inventario_dados').select('*', { count: 'exact', head: true }).eq('empresa_id', empresaId),
    supabase.from('denuncias').select('status').eq('empresa_id', empresaId),
    supabase.from('solicitacoes_titulares').select('status').eq('empresa_id', empresaId),
    supabase.from('treinamentos').select('id, treinamento_colaboradores(status)').eq('empresa_id', empresaId),
  ])

  const denunciasTotal = denuncias?.length ?? 0
  const denunciasEmAnalise = denuncias?.filter(d => d.status === 'em_analise').length ?? 0

  const titularesTotal = titulares?.length ?? 0
  const titularesPendentes = titulares?.filter(t => t.status === 'pendente').length ?? 0

  const todosColabs = (treinamentos ?? []).flatMap((t: any) => t.treinamento_colaboradores ?? [])
  const colabsTotal = todosColabs.length
  const colabsConcluidos = todosColabs.filter((c: any) => c.status === 'concluido').length

  const percentual = empresa?.percentual_adequacao ?? 0

  const pendencias = [
    ...(inventarioCount === 0 ? [{ id: 1, titulo: 'Mapear dados no inventário', modulo: 'Inventário', prioridade: 'alta' }] : []),
    ...(colabsTotal === 0 ? [{ id: 2, titulo: 'Cadastrar colaboradores e criar treinamento', modulo: 'Treinamentos', prioridade: 'alta' }] : []),
    ...(colabsConcluidos < colabsTotal ? [{ id: 3, titulo: `Treinar colaboradores pendentes (${colabsTotal - colabsConcluidos})`, modulo: 'Treinamentos', prioridade: 'media' }] : []),
    ...(titularesPendentes > 0 ? [{ id: 4, titulo: `Responder solicitações de titulares (${titularesPendentes})`, modulo: 'Titulares', prioridade: 'media' }] : []),
    ...(!empresa?.politica_privacidade_url ? [{ id: 5, titulo: 'Adicionar Política de Privacidade', modulo: 'Configurações', prioridade: 'baixa' }] : []),
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da adequação à LGPD</p>
      </div>

      {/* Score */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900 text-sm md:text-base">Nível de Adequação LGPD</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-blue-600">{percentual}%</span>
          </div>
          <Progress value={percentual} className="h-3" />
          <p className="text-xs text-blue-700 mt-2">Complete os módulos abaixo para aumentar sua pontuação</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatsCard title="Inventário" value={inventarioCount ?? 0} description="Registros mapeados" icon={Database} color="blue" />
        <StatsCard title="Treinamentos" value={`${colabsConcluidos}/${colabsTotal}`} description="Colaboradores treinados" icon={GraduationCap} color="green" />
        <StatsCard title="Denúncias" value={denunciasTotal} description={`${denunciasEmAnalise} em análise`} icon={AlertTriangle} color="yellow" />
        <StatsCard title="Titulares" value={titularesTotal} description={`${titularesPendentes} pendentes`} icon={Users} color="red" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-5 w-5 text-orange-500" />
              Checklist de Adequação
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendencias.length === 0 ? (
              <p className="text-sm text-green-600 font-medium">Todos os itens principais estão em dia!</p>
            ) : (
              <div className="space-y-2">
                {pendencias.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-4 w-4 rounded border-2 border-gray-300 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.titulo}</p>
                        <p className="text-xs text-gray-400">{item.modulo}</p>
                      </div>
                    </div>
                    <Badge variant={prioridadeMap[item.prioridade]} className="flex-shrink-0 text-xs">
                      {item.prioridade}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status módulos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Status dos Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Inventário de Dados', progress: Math.min((inventarioCount ?? 0) > 0 ? 100 : 0, 100) },
                { name: 'Treinamentos', progress: colabsTotal > 0 ? Math.round((colabsConcluidos / colabsTotal) * 100) : 0 },
                { name: 'Canal de Denúncias', progress: 100 },
                { name: 'Direitos dos Titulares', progress: 100 },
                { name: 'Página Pública LGPD', progress: empresa?.slug ? 100 : 0 },
              ].map((m) => (
                <div key={m.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{m.name}</span>
                    <span className="text-xs text-gray-500">{m.progress}%</span>
                  </div>
                  <Progress value={m.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
