import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, QrCode, Shield } from 'lucide-react'

export default function ConfiguracoesPage() {
  const slug = 'minha-empresa'
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lgpdplatform.com'}/lgpd/${slug}`

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Configure sua empresa e página pública LGPD</p>
      </div>

      {/* Dados da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Empresa</Label>
              <Input defaultValue="Minha Empresa Ltda" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input defaultValue="12.345.678/0001-90" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Setor de Atuação</Label>
            <Input defaultValue="Tecnologia" />
          </div>
          <Button>Salvar Dados</Button>
        </CardContent>
      </Card>

      {/* DPO */}
      <Card>
        <CardHeader>
          <CardTitle>Encarregado de Dados (DPO)</CardTitle>
          <CardDescription>Informações do responsável pela proteção de dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome do DPO</Label>
              <Input placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label>Email do DPO</Label>
              <Input type="email" placeholder="dpo@empresa.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Telefone do DPO</Label>
            <Input placeholder="(11) 99999-0000" />
          </div>
          <Button>Salvar DPO</Button>
        </CardContent>
      </Card>

      {/* Política de Privacidade */}
      <Card>
        <CardHeader>
          <CardTitle>Política de Privacidade</CardTitle>
          <CardDescription>Documento que será exibido na sua página pública LGPD</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do documento (PDF)</Label>
            <Input placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Ou escreva o texto da política</Label>
            <Textarea rows={6} placeholder="Descreva como sua empresa trata os dados pessoais..." />
          </div>
          <Button>Salvar Política</Button>
        </CardContent>
      </Card>

      {/* Página Pública */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Página Pública LGPD
          </CardTitle>
          <CardDescription>Compartilhe este link com seus clientes e funcionários</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <code className="flex-1 text-sm text-blue-600 truncate">{publicUrl}</code>
            <Button variant="ghost" size="icon">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href={`/lgpd/${slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-28 w-28 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                <QrCode className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">QR Code</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Embed no seu site</p>
              <p className="text-xs text-gray-500">Cole este script no seu site para adicionar o botão de privacidade LGPD:</p>
              <div className="bg-gray-900 rounded-lg p-3">
                <code className="text-xs text-green-400">{`<script src="${publicUrl.replace('/lgpd/', '/widget/')}.js"></script>`}</code>
              </div>
              <Button variant="outline" size="sm">
                <Copy className="h-3 w-3 mr-1" />
                Copiar código
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrações */}
      <Card>
        <CardHeader>
          <CardTitle>Integrações</CardTitle>
          <CardDescription>Configure APIs externas para notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>WhatsApp (Z-API)</Label>
              <Badge variant="secondary">Não configurado</Badge>
            </div>
            <Input placeholder="Instance ID" />
            <Input placeholder="Token" type="password" />
          </div>
          <Button>Salvar Integrações</Button>
        </CardContent>
      </Card>
    </div>
  )
}
