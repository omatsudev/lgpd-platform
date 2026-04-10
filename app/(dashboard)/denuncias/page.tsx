import { Search, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

const denunciasMock = [
  {
    id: '1',
    anonimo: true,
    tipo: 'Vazamento de dados',
    descricao: 'Acredito que meus dados foram compartilhados sem autorização...',
    status: 'recebido',
    created_at: '2024-03-10T14:23:00Z',
  },
  {
    id: '2',
    anonimo: false,
    nome: 'João Silva',
    tipo: 'Uso indevido de dados',
    descricao: 'Recebi marketing sem ter dado consentimento...',
    status: 'em_analise',
    created_at: '2024-03-08T09:15:00Z',
  },
  {
    id: '3',
    anonimo: true,
    tipo: 'Acesso não autorizado',
    descricao: 'Funcionário acessou dados sem necessidade...',
    status: 'resolvido',
    created_at: '2024-03-01T16:40:00Z',
  },
]

const statusMap: Record<string, { label: string; variant: 'warning' | 'default' | 'success' }> = {
  recebido: { label: 'Recebido', variant: 'warning' },
  em_analise: { label: 'Em análise', variant: 'default' },
  resolvido: { label: 'Resolvido', variant: 'success' },
}

export default function DenunciasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Canal de Denúncias</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as denúncias recebidas pelo canal público</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/lgpd/minha-empresa#denuncia" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver canal público
          </a>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar denúncias..." className="pl-9" />
      </div>

      <div className="grid gap-3">
        {denunciasMock.map((d) => {
          const status = statusMap[d.status]
          return (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{d.tipo}</span>
                      <Badge variant="secondary">{d.anonimo ? 'Anônimo' : d.nome}</Badge>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{d.descricao}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(d.created_at)}</p>
                  </div>
                  <Link href={`/denuncias/${d.id}`}>
                    <Button variant="outline" size="sm">Ver detalhes</Button>
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
