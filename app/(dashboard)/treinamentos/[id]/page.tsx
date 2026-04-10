import { ArrowLeft, Send, Download, Upload } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const isNew = false

const colaboradores = [
  { id: '1', nome: 'Ana Paula', whatsapp: '11999990001', status: 'concluido', progresso: 100 },
  { id: '2', nome: 'Bruno Costa', whatsapp: '11999990002', status: 'em_andamento', progresso: 60 },
  { id: '3', nome: 'Carla Dias', whatsapp: '11999990003', status: 'nao_iniciado', progresso: 0 },
]

const statusMap: Record<string, 'success' | 'warning' | 'secondary'> = {
  concluido: 'success',
  em_andamento: 'warning',
  nao_iniciado: 'secondary',
}
const statusLabel: Record<string, string> = {
  concluido: 'Concluído',
  em_andamento: 'Em andamento',
  nao_iniciado: 'Não iniciado',
}

export default function TreinamentoFormPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'novo'
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/treinamentos">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Novo Treinamento' : 'Introdução à LGPD'}</h1>
          <p className="text-sm text-gray-500">Gerencie conteúdo e acompanhe colaboradores</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conteúdo */}
        <Card>
          <CardHeader><CardTitle>Conteúdo do Treinamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input defaultValue={isNew ? '' : 'Introdução à LGPD'} placeholder="Nome do treinamento" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea rows={2} defaultValue={isNew ? '' : 'Conceitos básicos da Lei Geral de Proteção de Dados'} />
            </div>
            <div className="space-y-2">
              <Label>Vídeo (URL YouTube/Vimeo)</Label>
              <Input placeholder="https://youtube.com/..." />
            </div>
            <div className="space-y-2">
              <Label>Material PDF</Label>
              <div className="flex items-center gap-2">
                <Input placeholder="URL do PDF ou faça upload" />
                <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
              </div>
            </div>
            <Button className="w-full">Salvar Treinamento</Button>
          </CardContent>
        </Card>

        {/* Envio WhatsApp */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="h-4 w-4 text-green-600" /> Enviar via WhatsApp</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">O sistema gera um link único por colaborador e envia via WhatsApp automaticamente.</p>
            <div className="space-y-2">
              <Label>Mensagem personalizada</Label>
              <Textarea rows={3} defaultValue="Olá {nome}, você recebeu um treinamento obrigatório sobre LGPD. Acesse: {link}" />
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              Enviar para todos (3)
            </Button>
            <Button variant="outline" className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Enviar apenas para pendentes
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progresso dos colaboradores */}
      {!isNew && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Progresso dos Colaboradores</CardTitle>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-1" /> Exportar</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {colaboradores.map((c) => (
                <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{c.nome}</span>
                      <Badge variant={statusMap[c.status]}>{statusLabel[c.status]}</Badge>
                    </div>
                    <Progress value={c.progresso} className="h-1.5" />
                  </div>
                  <Button variant="ghost" size="sm">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
