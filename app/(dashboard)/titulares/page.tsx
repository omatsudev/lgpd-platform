import { ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { SearchInput } from '@/components/ui/search-input'
import { getUserEmpresa } from '@/lib/supabase/queries'

const tipoMap: Record<string, string> = {
  acesso: 'Acesso', exclusao: 'Exclusão', correcao: 'Correção',
  portabilidade: 'Portabilidade', oposicao: 'Oposição',
}
const statusMap: Record<string, { label: string; variant: 'warning' | 'default' | 'success' | 'destructive' | 'secondary' }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  em_analise: { label: 'Em análise', variant: 'default' },
  concluido: { label: 'Concluído', variant: 'success' },
  recusado: { label: 'Recusado', variant: 'destructive' },
}

export default async function TitularesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { empresa, empresaId, supabase } = await getUserEmpresa()
  const { q } = await searchParams

  let query = supabase.from('solicitacoes_titulares').select('*').eq('empresa_id', empresaId ?? '')
  if (q) query = query.or(`nome.ilike.%${q}%,email.ilike.%${q}%,descricao.ilike.%${q}%,tipo.ilike.%${q}%`)

  const { data } = empresaId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const solicitacoes = data ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Direitos dos Titulares</h1>
          <p className="text-sm text-gray-500 mt-0.5">Solicitações de acesso, exclusão e correção (prazo: 15 dias)</p>
        </div>
        {empresa?.slug && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/lgpd/${empresa.slug}#titular`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" /> Formulário público
            </a>
          </Button>
        )}
      </div>

      <SearchInput defaultValue={q ?? ''} placeholder="Buscar por nome, email, tipo..." />

      {solicitacoes.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-500 font-medium">Nenhuma solicitação recebida</p>
            <p className="text-sm text-gray-400 mt-1">As solicitações chegam pelo formulário público da empresa</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {solicitacoes.map((s: any) => {
            const status = statusMap[s.status] ?? { label: s.status, variant: 'secondary' as const }
            const prazoDate = new Date(s.prazo_resposta)
            const diasRestantes = Math.ceil((prazoDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            const atrasado = diasRestantes < 0 && s.status !== 'concluido'
            return (
              <Card key={s.id} className={`hover:shadow-md transition-shadow ${atrasado ? 'border-red-200' : ''}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default">{tipoMap[s.tipo] ?? s.tipo}</Badge>
                        <span className="font-medium text-gray-900">{s.nome}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{s.email}</p>
                      <p className="text-sm text-gray-500 line-clamp-1">{s.descricao}</p>
                      <div className={`flex items-center gap-1 text-xs ${atrasado ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        <Clock className="h-3 w-3" />
                        <span>
                          Prazo: {formatDate(s.prazo_resposta)}
                          {atrasado ? ' (ATRASADO)' : diasRestantes >= 0 && s.status !== 'concluido' ? ` (${diasRestantes}d restantes)` : ''}
                        </span>
                      </div>
                    </div>
                    <Link href={`/titulares/${s.id}`} className="flex-shrink-0">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">Responder</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
