import { Plus, Search, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const treinamentosMock = [
  {
    id: '1',
    titulo: 'Introdução à LGPD',
    descricao: 'Conceitos básicos da Lei Geral de Proteção de Dados',
    total_colaboradores: 20,
    concluidos: 12,
    em_andamento: 5,
    nao_iniciados: 3,
  },
  {
    id: '2',
    titulo: 'Segurança da Informação',
    descricao: 'Boas práticas de segurança no tratamento de dados',
    total_colaboradores: 20,
    concluidos: 8,
    em_andamento: 4,
    nao_iniciados: 8,
  },
]

export default function TreinamentosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Treinamentos</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie treinamentos e acompanhe a evolução dos colaboradores</p>
        </div>
        <Link href="/treinamentos/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Treinamento
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar treinamentos..." className="pl-9" />
      </div>

      <div className="grid gap-4">
        {treinamentosMock.map((t) => {
          const progresso = Math.round((t.concluidos / t.total_colaboradores) * 100)
          return (
            <Card key={t.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <h3 className="font-semibold text-gray-900">{t.titulo}</h3>
                    <p className="text-sm text-gray-500">{t.descricao}</p>

                    <div className="flex items-center gap-4 pt-3">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="success">{t.concluidos} concluídos</Badge>
                        <Badge variant="warning">{t.em_andamento} em andamento</Badge>
                        <Badge variant="secondary">{t.nao_iniciados} não iniciados</Badge>
                      </div>
                    </div>

                    <div className="pt-3 space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Progresso geral</span>
                        <span>{progresso}%</span>
                      </div>
                      <Progress value={progresso} />
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Enviar WhatsApp
                    </Button>
                    <Link href={`/treinamentos/${t.id}`}>
                      <Button size="sm">Gerenciar</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
