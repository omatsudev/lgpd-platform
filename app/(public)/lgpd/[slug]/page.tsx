import { Shield, Mail, Phone, QrCode, FileText, AlertTriangle, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Em produção, esses dados virão do Supabase via params.slug
const empresaData = {
  nome: 'Empresa Exemplo',
  cnpj: '12.345.678/0001-90',
  dpo_nome: 'João Silva',
  dpo_email: 'dpo@empresa.com',
  dpo_telefone: '(11) 99999-0000',
  politica_url: '/politica-de-privacidade.pdf',
}

export default function LGPDPublicaPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-gray-900">{empresaData.nome}</p>
              <p className="text-xs text-gray-400">Portal de Privacidade e LGPD</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="h-3.5 w-3.5 text-green-500" />
            <span>Adequado à LGPD</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">Portal de Privacidade</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            A {empresaData.nome} respeita sua privacidade e está comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* DPO Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Encarregado (DPO)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{empresaData.dpo_nome}</p>
              <div className="flex items-center gap-2 text-gray-500">
                <Mail className="h-3.5 w-3.5" />
                <a href={`mailto:${empresaData.dpo_email}`} className="hover:text-blue-600">{empresaData.dpo_email}</a>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Phone className="h-3.5 w-3.5" />
                <span>{empresaData.dpo_telefone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Política */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                Política de Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">Consulte como tratamos seus dados pessoais.</p>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={empresaData.politica_url} target="_blank" rel="noopener noreferrer">
                  Acessar Política
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <QrCode className="h-4 w-4 text-purple-600" />
                QR Code LGPD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">Compartilhe este portal com QR Code.</p>
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulários */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Direitos do Titular */}
          <Card id="titular">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Exercer meus Direitos
              </CardTitle>
              <p className="text-sm text-gray-500">Solicite acesso, correção, exclusão ou portabilidade dos seus dados. Prazo de resposta: 15 dias úteis.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action="/api/titulares/public" method="POST">
                <input type="hidden" name="empresa_slug" value={params.slug} />
                <div className="space-y-2">
                  <Label htmlFor="titular-nome">Nome completo</Label>
                  <Input id="titular-nome" name="nome" placeholder="Seu nome" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titular-email">Email</Label>
                  <Input id="titular-email" name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titular-tipo">Tipo de solicitação</Label>
                  <select
                    id="titular-tipo"
                    name="tipo"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="acesso">Acesso aos dados</option>
                    <option value="correcao">Correção de dados</option>
                    <option value="exclusao">Exclusão de dados</option>
                    <option value="portabilidade">Portabilidade</option>
                    <option value="oposicao">Oposição ao tratamento</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="titular-descricao">Descrição</Label>
                  <Textarea id="titular-descricao" name="descricao" placeholder="Descreva sua solicitação..." required />
                </div>
                <Button type="submit" className="w-full">Enviar Solicitação</Button>
              </form>
            </CardContent>
          </Card>

          {/* Canal de Denúncia */}
          <Card id="denuncia">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Canal de Denúncia
              </CardTitle>
              <p className="text-sm text-gray-500">Reporte violações de privacidade ou uso indevido de dados. Pode ser feito de forma anônima.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action="/api/denuncias/public" method="POST">
                <input type="hidden" name="empresa_slug" value={params.slug} />
                <div className="space-y-2">
                  <Label>Identificação</Label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="anonimo" value="true" defaultChecked />
                      <span>Anônimo</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="anonimo" value="false" />
                      <span>Identificado</span>
                    </label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="denuncia-tipo">Tipo de denúncia</Label>
                  <select
                    id="denuncia-tipo"
                    name="tipo"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Vazamento de dados">Vazamento de dados</option>
                    <option value="Uso indevido de dados">Uso indevido de dados</option>
                    <option value="Acesso não autorizado">Acesso não autorizado</option>
                    <option value="Coleta sem consentimento">Coleta sem consentimento</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="denuncia-descricao">Descrição</Label>
                  <Textarea id="denuncia-descricao" name="descricao" placeholder="Descreva o ocorrido..." rows={4} required />
                </div>
                <Button type="submit" variant="outline" className="w-full border-orange-300 text-orange-700 hover:bg-orange-50">
                  Enviar Denúncia
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12 py-6 text-center text-xs text-gray-400">
        <p>Este portal é mantido pela {empresaData.nome} (CNPJ: {empresaData.cnpj})</p>
        <p className="mt-1">Desenvolvido com <a href="/" className="text-blue-500 hover:underline">LGPD Platform</a></p>
      </footer>
    </div>
  )
}
