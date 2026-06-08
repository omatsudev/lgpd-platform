import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/server'
import { AlertTriangle, FileText, Mail, Phone, QrCode, Users } from 'lucide-react'
import Image from 'next/image'
import { notFound } from 'next/navigation'

export default async function LGPDPublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, tax_id, dpo_name, dpo_email, dpo_phone, privacy_policy_url')
    .eq('slug', slug)
    .single()

  if (!company) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-serra-privacy.png"
              alt="Serra Privacy"
              width={40}
              height={40}
              className="object-contain"
            />
            <div className="border-l border-gray-200 pl-3">
              <p className="font-bold text-gray-900 text-sm">{company.name}</p>
              <p className="text-xs text-gray-400">Portal de Privacidade</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Portal de Privacidade</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm md:text-base">
            A {company.name} respeita sua privacidade e está comprometida com a proteção dos seus
            dados, em conformidade com a LGPD.
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" /> Encarregado (DPO)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              {company.dpo_name ? (
                <>
                  <p className="font-medium text-gray-900">{company.dpo_name}</p>
                  {company.dpo_email && (
                    <a
                      href={`mailto:${company.dpo_email}`}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 break-all"
                    >
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      {company.dpo_email}
                    </a>
                  )}
                  {company.dpo_phone && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                      {company.dpo_phone}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-xs">DPO não configurado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" /> Política de Privacidade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500">Consulte como tratamos seus dados pessoais.</p>
              {company.privacy_policy_url ? (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={company.privacy_policy_url} target="_blank" rel="noopener noreferrer">
                    Acessar Política
                  </a>
                </Button>
              ) : (
                <p className="text-xs text-gray-400">Em elaboração</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <QrCode className="h-4 w-4 text-purple-600" /> QR Code LGPD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-500">Compartilhe este portal.</p>
              <div className="flex justify-center">
                <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <QrCode className="h-10 w-10 text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulários */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Titular */}
          <Card id="data-subject">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-5 w-5 text-blue-600" /> Exercer meus Direitos
              </CardTitle>
              <p className="text-sm text-gray-500">Prazo de resposta: 15 dias úteis.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" action="/api/data-subjects/public" method="POST">
                <input type="hidden" name="company_slug" value={slug} />
                <div className="space-y-1.5">
                  <Label>Nome completo</Label>
                  <Input name="name" placeholder="Seu nome" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input name="email" type="email" placeholder="seu@email.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de solicitação</Label>
                  <select
                    name="type"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="access">Acesso aos dados</option>
                    <option value="correction">Correção de dados</option>
                    <option value="deletion">Exclusão de dados</option>
                    <option value="portability">Portabilidade</option>
                    <option value="objection">Oposição ao tratamento</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea name="description" placeholder="Descreva sua solicitação..." required />
                </div>
                <Button type="submit" className="w-full">
                  Enviar Solicitação
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Denúncia */}
          <Card id="complaint">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-orange-500" /> Canal de Denúncia
              </CardTitle>
              <p className="text-sm text-gray-500">Pode ser feito de forma anônima.</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" action="/api/complaints/public" method="POST">
                <input type="hidden" name="company_slug" value={slug} />
                <div className="space-y-1.5">
                  <Label>Identificação</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="anonymous" value="true" defaultChecked /> Anônimo
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="radio" name="anonymous" value="false" /> Identificado
                    </label>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Tipo de denúncia</Label>
                  <select
                    name="type"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="data_breach">Vazamento de dados</option>
                    <option value="data_misuse">Uso indevido de dados</option>
                    <option value="unauthorized_access">Acesso não autorizado</option>
                    <option value="collection_without_consent">Coleta sem consentimento</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea
                    name="description"
                    placeholder="Descreva o ocorrido..."
                    rows={4}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Enviar Denúncia
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-10 py-5 text-center text-xs text-gray-400 px-4">
        <p>
          {company.name}
          {company.tax_id ? ` — CNPJ: ${company.tax_id}` : ''}
        </p>
        <p className="mt-1">
          Desenvolvido com{' '}
          <a href="/" className="text-blue-500 hover:underline">
            Serra Privacy
          </a>
        </p>
      </footer>
    </div>
  )
}
