import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function DenunciaDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/denuncias">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denúncia #{params.id}</h1>
          <p className="text-sm text-gray-500">Detalhes e resposta</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Informações da Denúncia</span>
            <Badge variant="warning">Em análise</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-gray-500">Tipo:</span> <span className="font-medium ml-1">Uso indevido de dados</span></div>
            <div><span className="text-gray-500">Denunciante:</span> <Badge variant="secondary" className="ml-1">Anônimo</Badge></div>
            <div><span className="text-gray-500">Recebido em:</span> <span className="font-medium ml-1">10/03/2024 14:23</span></div>
            <div><span className="text-gray-500">IP de origem:</span> <span className="font-mono ml-1 text-xs">192.168.x.x</span></div>
          </div>
          <div className="pt-2">
            <p className="text-gray-500 mb-1">Descrição:</p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">Recebi comunicações de marketing sem ter dado consentimento para isso. Meus dados parecem ter sido compartilhados com terceiros.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Resposta Interna</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="recebido">Recebido</option>
              <option value="em_analise" selected>Em análise</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Observações internas (não enviadas ao denunciante)</Label>
            <Textarea rows={4} placeholder="Registre as ações tomadas, investigações realizadas..." />
          </div>
          <div className="flex gap-2 justify-end">
            <Link href="/denuncias"><Button variant="outline">Voltar</Button></Link>
            <Button>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
