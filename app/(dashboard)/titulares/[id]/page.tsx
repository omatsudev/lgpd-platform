import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function TitularDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/titulares">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitação #{params.id}</h1>
          <p className="text-sm text-gray-500">Direitos do titular de dados</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dados da Solicitação</span>
            <Badge variant="warning">Pendente</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-gray-500">Tipo:</span> <Badge variant="default" className="ml-1">Acesso</Badge></div>
            <div><span className="text-gray-500">Titular:</span> <span className="font-medium ml-1">Maria Santos</span></div>
            <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-1">maria@email.com</span></div>
            <div><span className="text-gray-500">CPF:</span> <span className="font-medium ml-1">***.456.789-**</span></div>
            <div><span className="text-gray-500">Recebido:</span> <span className="font-medium ml-1">25/03/2024 10:30</span></div>
            <div className="flex items-center gap-1 text-orange-600">
              <Clock className="h-3.5 w-3.5" />
              <span className="font-medium">Prazo: 10/04/2024 (5 dias restantes)</span>
            </div>
          </div>
          <div className="pt-2">
            <p className="text-gray-500 mb-1">Solicitação:</p>
            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">Gostaria de saber quais dados pessoais vocês possuem sobre mim e para qual finalidade são utilizados.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Responder Solicitação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="pendente">Pendente</option>
              <option value="em_analise">Em análise</option>
              <option value="concluido">Concluído</option>
              <option value="recusado">Recusado</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Resposta ao titular</Label>
            <Textarea rows={5} placeholder="Descreva quais dados são tratados, com qual finalidade e base legal. Esta resposta será enviada ao titular..." />
          </div>
          <p className="text-xs text-gray-400">A resposta será registrada nos logs de auditoria como evidência jurídica.</p>
          <div className="flex gap-2 justify-end">
            <Link href="/titulares"><Button variant="outline">Voltar</Button></Link>
            <Button>Salvar e Notificar Titular</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
