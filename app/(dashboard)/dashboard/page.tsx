import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Database,
  GraduationCap,
  AlertTriangle,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
} from 'lucide-react'

const pendencias = [
  { id: 1, titulo: 'Criar Política de Privacidade', modulo: 'Configurações', prioridade: 'alta' },
  { id: 2, titulo: 'Treinar 5 colaboradores pendentes', modulo: 'Treinamentos', prioridade: 'alta' },
  { id: 3, titulo: 'Responder solicitação de titular #12', modulo: 'Titulares', prioridade: 'media' },
  { id: 4, titulo: 'Mapear dados de RH no inventário', modulo: 'Inventário', prioridade: 'media' },
  { id: 5, titulo: 'Atualizar base legal dos contratos', modulo: 'Inventário', prioridade: 'baixa' },
]

const prioridadeMap: Record<string, 'destructive' | 'warning' | 'secondary'> = {
  alta: 'destructive',
  media: 'warning',
  baixa: 'secondary',
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral da adequação à LGPD</p>
      </div>

      {/* Adequação Score */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Nível de Adequação LGPD</span>
            </div>
            <span className="text-2xl font-bold text-blue-600">42%</span>
          </div>
          <Progress value={42} className="h-3" />
          <p className="text-xs text-blue-700 mt-2">Complete os módulos abaixo para aumentar sua pontuação</p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Itens no Inventário"
          value={24}
          description="Registros de dados mapeados"
          icon={Database}
          color="blue"
          trend="up"
          trendValue="+3 este mês"
        />
        <StatsCard
          title="Treinamentos"
          value="12/20"
          description="Colaboradores treinados"
          icon={GraduationCap}
          color="green"
        />
        <StatsCard
          title="Denúncias Abertas"
          value={3}
          description="2 em análise, 1 recebida"
          icon={AlertTriangle}
          color="yellow"
        />
        <StatsCard
          title="Solicitações Titulares"
          value={7}
          description="4 pendentes de resposta"
          icon={Users}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pendências */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Checklist de Adequação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendencias.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded border-2 border-gray-300 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.titulo}</p>
                      <p className="text-xs text-gray-400">{item.modulo}</p>
                    </div>
                  </div>
                  <Badge variant={prioridadeMap[item.prioridade]}>
                    {item.prioridade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Módulos Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Status dos Módulos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Inventário de Dados', progress: 70, status: 'Em andamento' },
                { name: 'Treinamentos', progress: 60, status: 'Em andamento' },
                { name: 'Canal de Denúncias', progress: 100, status: 'Concluído' },
                { name: 'Direitos dos Titulares', progress: 50, status: 'Em andamento' },
                { name: 'Página Pública LGPD', progress: 0, status: 'Não iniciado' },
              ].map((modulo) => (
                <div key={modulo.name} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{modulo.name}</span>
                    <span className="text-xs text-gray-500">{modulo.progress}%</span>
                  </div>
                  <Progress value={modulo.progress} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
