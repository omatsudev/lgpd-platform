import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate, formatDateTime } from '@/lib/utils'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { atualizarTitular } from '@/app/actions/titulares'

const tipoMap: Record<string, string> = {
  acesso: 'Acesso', exclusao: 'Exclusão', correcao: 'Correção',
  portabilidade: 'Portabilidade', oposicao: 'Oposição',
}
const statusMap: Record<string, { label: string; variant: 'warning' | 'default' | 'success' | 'destructive' }> = {
  pendente: { label: 'Pendente', variant: 'warning' },
  em_analise: { label: 'Em análise', variant: 'default' },
  concluido: { label: 'Concluído', variant: 'success' },
  recusado: { label: 'Recusado', variant: 'destructive' },
}

export default async function TitularDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await getUserEmpresa()

  const { data: solicitacao } = await supabase
    .from('solicitacoes_titulares')
    .select('*')
    .eq('id', id)
    .single()

  if (!solicitacao) notFound()

  const status = statusMap[solicitacao.status] ?? { label: solicitacao.status, variant: 'secondary' as const }
  const prazoDate = new Date(solicitacao.prazo_resposta)
  const diasRestantes = Math.ceil((prazoDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const atrasado = diasRestantes < 0 && solicitacao.status !== 'concluido'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/titulares">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitação de Titular</h1>
          <p className="text-sm text-gray-500">Direitos do titular de dados</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dados da Solicitação</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-gray-500">Tipo:</span> <Badge variant="default" className="ml-1">{tipoMap[solicitacao.tipo] ?? solicitacao.tipo}</Badge></div>
            <div><span className="text-gray-500">Titular:</span> <span className="font-medium ml-1">{solicitacao.nome}</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-1">{solicitacao.email}</span></div>
            {solicitacao.cpf && <div><span className="text-gray-500">CPF:</span> <span className="font-medium ml-1">{solicitacao.cpf}</span></div>}
            <div><span className="text-gray-500">Recebido:</span> <span className="font-medium ml-1">{formatDateTime(solicitacao.created_at)}</span></div>
            <div className={`flex items-center gap-1 ${atrasado ? 'text-red-600' : 'text-orange-600'}`}>
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">
                Prazo: {formatDate(solicitacao.prazo_resposta)}
                {atrasado ? ' (ATRASADO)' : solicitacao.status !== 'concluido' ? ` (${diasRestantes}d restantes)` : ''}
              </span>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-gray-500 mb-1">Solicitação:</p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{solicitacao.descricao}</p>
          </div>
          {solicitacao.resposta && (
            <div className="pt-2">
              <p className="text-gray-500 mb-1">Resposta enviada:</p>
              <p className="text-gray-800 bg-green-50 p-3 rounded-lg border border-green-100">{solicitacao.resposta}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Responder Solicitação</CardTitle></CardHeader>
        <CardContent>
          <form action={atualizarTitular} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                defaultValue={solicitacao.status}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pendente">Pendente</option>
                <option value="em_analise">Em análise</option>
                <option value="concluido">Concluído</option>
                <option value="recusado">Recusado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Resposta ao titular</Label>
              <Textarea name="resposta" defaultValue={solicitacao.resposta ?? ''} rows={5} placeholder="Descreva quais dados são tratados, com qual finalidade e base legal..." />
            </div>
            <p className="text-xs text-gray-400">A resposta será registrada nos logs de auditoria como evidência jurídica.</p>
            <div className="flex gap-2 justify-end">
              <Link href="/titulares"><Button variant="outline" type="button">Voltar</Button></Link>
              <Button type="submit">Salvar e Notificar Titular</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
