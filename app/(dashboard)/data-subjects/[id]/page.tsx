import { updateDataSubject } from '@/app/actions/data-subjects'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DATA_SUBJECT_REQUEST_TYPE_LABELS } from '@/lib/status-labels'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const typeMap = DATA_SUBJECT_REQUEST_TYPE_LABELS
const statusMap: Record<
  string,
  { label: string; variant: 'warning' | 'default' | 'success' | 'destructive' }
> = {
  pending: { label: 'Pendente', variant: 'warning' },
  under_review: { label: 'Em análise', variant: 'default' },
  completed: { label: 'Concluído', variant: 'success' },
  rejected: { label: 'Recusado', variant: 'destructive' },
}

export default async function DataSubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await getUserCompany()

  const { data: request } = await supabase
    .from('data_subject_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (!request) notFound()

  const status = statusMap[request.status] ?? {
    label: request.status,
    variant: 'secondary' as const,
  }
  const deadlineDate = new Date(request.response_deadline)
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )
  const overdue = daysLeft < 0 && request.status !== 'completed'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/data-subjects">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
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
            <div>
              <span className="text-gray-500">Tipo:</span>{' '}
              <Badge variant="default" className="ml-1">
                {typeMap[request.type] ?? request.type}
              </Badge>
            </div>
            <div>
              <span className="text-gray-500">Titular:</span>{' '}
              <span className="font-medium ml-1">{request.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Email:</span>{' '}
              <span className="font-medium ml-1">{request.email}</span>
            </div>
            {request.cpf && (
              <div>
                <span className="text-gray-500">CPF:</span>{' '}
                <span className="font-medium ml-1">{request.cpf}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500">Recebido:</span>{' '}
              <span className="font-medium ml-1">{formatDateTime(request.created_at)}</span>
            </div>
            <div
              className={`flex items-center gap-1 ${overdue ? 'text-red-600' : 'text-orange-600'}`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">
                Prazo: {formatDate(request.response_deadline)}
                {overdue
                  ? ' (ATRASADO)'
                  : request.status !== 'completed'
                    ? ` (${daysLeft}d restantes)`
                    : ''}
              </span>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-gray-500 mb-1">Solicitação:</p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{request.description}</p>
          </div>
          {request.response && (
            <div className="pt-2">
              <p className="text-gray-500 mb-1">Resposta enviada:</p>
              <p className="text-gray-800 bg-green-50 p-3 rounded-lg border border-green-100">
                {request.response}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Responder Solicitação</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateDataSubject} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                defaultValue={request.status}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pendente</option>
                <option value="under_review">Em análise</option>
                <option value="completed">Concluído</option>
                <option value="rejected">Recusado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Resposta ao titular</Label>
              <Textarea
                name="response"
                defaultValue={request.response ?? ''}
                rows={5}
                placeholder="Descreva quais dados são tratados, com qual finalidade e base legal..."
              />
            </div>
            <p className="text-xs text-gray-400">
              A resposta será registrada nos logs de auditoria como evidência jurídica.
            </p>
            <div className="flex gap-2 justify-end">
              <Link href="/data-subjects">
                <Button variant="outline" type="button">
                  Voltar
                </Button>
              </Link>
              <Button type="submit">Salvar e Notificar Titular</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
