import { updateComplaint } from '@/app/actions/complaints'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const statusMap: Record<string, { label: string; variant: 'warning' | 'default' | 'success' }> = {
  received: { label: 'Recebido', variant: 'warning' },
  under_review: { label: 'Em análise', variant: 'default' },
  resolved: { label: 'Resolvido', variant: 'success' },
}

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await getUserCompany()

  const { data: complaint } = await supabase.from('complaints').select('*').eq('id', id).single()

  if (!complaint) notFound()

  const status = statusMap[complaint.status] ?? {
    label: complaint.status,
    variant: 'secondary' as const,
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/complaints">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denúncia</h1>
          <p className="text-sm text-gray-500">Detalhes e resposta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações da Denúncia</span>
            <Badge variant={status.variant}>{status.label}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-500">Tipo:</span>{' '}
              <span className="font-medium ml-1">{complaint.type}</span>
            </div>
            <div>
              <span className="text-gray-500">Denunciante:</span>{' '}
              {complaint.anonymous ? (
                <Badge variant="secondary" className="ml-1">
                  Anônimo
                </Badge>
              ) : (
                <span className="font-medium ml-1">{complaint.name ?? 'Identificado'}</span>
              )}
            </div>
            <div>
              <span className="text-gray-500">Recebido em:</span>{' '}
              <span className="font-medium ml-1">{formatDateTime(complaint.created_at)}</span>
            </div>
            {complaint.source_ip && (
              <div>
                <span className="text-gray-500">IP de origem:</span>{' '}
                <span className="font-mono ml-1 text-xs">{complaint.source_ip}</span>
              </div>
            )}
          </div>
          <div className="pt-2">
            <p className="text-gray-500 mb-1">Descrição:</p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{complaint.description}</p>
          </div>
          {complaint.response && (
            <div className="pt-2">
              <p className="text-gray-500 mb-1">Resposta registrada:</p>
              <p className="text-gray-800 bg-green-50 p-3 rounded-lg border border-green-100">
                {complaint.response}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resposta Interna</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateComplaint} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                defaultValue={complaint.status}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="received">Recebido</option>
                <option value="under_review">Em análise</option>
                <option value="resolved">Resolvido</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Observações internas</Label>
              <Textarea
                name="response"
                defaultValue={complaint.response ?? ''}
                rows={4}
                placeholder="Registre as ações tomadas, investigações realizadas..."
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Link href="/complaints">
                <Button variant="outline" type="button">
                  Voltar
                </Button>
              </Link>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
