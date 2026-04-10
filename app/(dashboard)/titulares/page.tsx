import { Search, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatDateTime } from '@/lib/utils'

const solicitacoesMock = [
  {
    id: '1',
    tipo: 'acesso',
    nome: 'Maria Santos',
    email: 'maria@email.com',
    descricao: 'Gostaria de saber quais dados pessoais vocês possuem sobre mim.',
    status: 'pendente',
    prazo_resposta: '2024-04-10',
    created_at: '2024-03-25T10:30:00Z',
  },
  {
    id: '2',
    tipo: 'exclusao',
    nome: 'Carlos Oliveira',
    email: 'carlos@email.com',
    descricao: 'Solicito a exclusão de todos os meus dados cadastrados.',
    status: 'em_analise',
    prazo_resposta: '2024-04-08',
    created_at: '2024-03-23T15:20:00Z',
  },
  {
    id: '3',
    tipo: 'correcao',
    nome: 'Ana Lima',
    email: 'ana@email.com',
    descricao: 'Meu endereço está desatualizado. Gostaria de corrigir.',
    status: 'concluido',
    prazo_resposta: '2024-03-20',
    created_at: '2024-03-10T08:45:00Z',
  },
]

const tipoMap: Record<string, string> = {
  acesso: 'Acesso',
  exclusao: 'Exclusão',
  correcao: 'Correção',
  portabilidade: 'Portabilidade',
  oposicao: 'Oposição',
}

const statusMap: Record<string, { label: string; variant: 'warning' | 'default' | 'success' | 'destructive' | 'secondary' }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  em_analise: { label: 'Em análise', variant: 'default' },
  concluido: { label: 'Concluído', variant: 'success' },
  recusado: { label: 'Recusado', variant: 'destructive' },
}

export default function TitularesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direitos dos Titulares</h1>
          <p className="text-sm text-gray-500 mt-1">Solicitações de acesso, exclusão e correção de dados (prazo: 15 dias)</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/lgpd/minha-empresa#titular" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver formulário público
          </a>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar por nome, email, tipo..." className="pl-9" />
      </div>

      <div className="grid gap-3">
        {solicitacoesMock.map((s) => {
          const status = statusMap[s.status]
          const prazoDate = new Date(s.prazo_resposta)
          const hoje = new Date()
          const diasRestantes = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
          const atrasado = diasRestantes < 0 && s.status !== 'concluido'

          return (
            <Card key={s.id} className={`hover:shadow-md transition-shadow ${atrasado ? 'border-red-200' : ''}`}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="default">{tipoMap[s.tipo]}</Badge>
                      <span className="font-medium text-gray-900">{s.nome}</span>
                      <span className="text-sm text-gray-400">{s.email}</span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{s.descricao}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Recebido: {formatDateTime(s.created_at)}</span>
                      <span className={`flex items-center gap-1 ${atrasado ? 'text-red-500 font-medium' : ''}`}>
                        <Clock className="h-3 w-3" />
                        Prazo: {formatDate(s.prazo_resposta)}
                        {atrasado && ' (ATRASADO)'}
                        {!atrasado && s.status !== 'concluido' && diasRestantes >= 0 && ` (${diasRestantes}d restantes)`}
                      </span>
                    </div>
                  </div>
                  <Link href={`/titulares/${s.id}`}>
                    <Button variant="outline" size="sm">Responder</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
