import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDateTime } from '@/lib/utils'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { atualizarDenuncia } from '@/app/actions/denuncias'

const statusMap: Record<string, { label: string; variant: 'warning' | 'default' | 'success' }> = {
  recebido: { label: 'Recebido', variant: 'warning' },
  em_analise: { label: 'Em análise', variant: 'default' },
  resolvido: { label: 'Resolvido', variant: 'success' },
}

export default async function DenunciaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { supabase } = await getUserEmpresa()

  const { data: denuncia } = await supabase
    .from('denuncias')
    .select('*')
    .eq('id', id)
    .single()

  if (!denuncia) notFound()

  const status = statusMap[denuncia.status] ?? { label: denuncia.status, variant: 'secondary' as const }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/denuncias">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
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
            <div><span className="text-gray-500">Tipo:</span> <span className="font-medium ml-1">{denuncia.tipo}</span></div>
            <div>
              <span className="text-gray-500">Denunciante:</span>{' '}
              {denuncia.anonimo
                ? <Badge variant="secondary" className="ml-1">Anônimo</Badge>
                : <span className="font-medium ml-1">{denuncia.nome ?? 'Identificado'}</span>
              }
            </div>
            <div><span className="text-gray-500">Recebido em:</span> <span className="font-medium ml-1">{formatDateTime(denuncia.created_at)}</span></div>
            {denuncia.ip_origem && (
              <div><span className="text-gray-500">IP de origem:</span> <span className="font-mono ml-1 text-xs">{denuncia.ip_origem}</span></div>
            )}
          </div>
          <div className="pt-2">
            <p className="text-gray-500 mb-1">Descrição:</p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{denuncia.descricao}</p>
          </div>
          {denuncia.resposta && (
            <div className="pt-2">
              <p className="text-gray-500 mb-1">Resposta registrada:</p>
              <p className="text-gray-800 bg-green-50 p-3 rounded-lg border border-green-100">{denuncia.resposta}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resposta Interna</CardTitle></CardHeader>
        <CardContent>
          <form action={atualizarDenuncia} className="space-y-4">
            <input type="hidden" name="id" value={id} />
            <div className="space-y-2">
              <Label>Status</Label>
              <select
                name="status"
                defaultValue={denuncia.status}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recebido">Recebido</option>
                <option value="em_analise">Em análise</option>
                <option value="resolvido">Resolvido</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Observações internas</Label>
              <Textarea name="resposta" defaultValue={denuncia.resposta ?? ''} rows={4} placeholder="Registre as ações tomadas, investigações realizadas..." />
            </div>
            <div className="flex gap-2 justify-end">
              <Link href="/denuncias"><Button variant="outline" type="button">Voltar</Button></Link>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
