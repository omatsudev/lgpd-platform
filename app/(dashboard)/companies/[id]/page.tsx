import { saveCompany } from '@/app/actions/companies'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CompanyFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'
  const { supabase } = await getUserCompany()

  let company: any = null
  if (!isNew) {
    const { data } = await supabase.from('companies').select('*').eq('id', id).single()
    company = data
    if (!company) notFound()
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/companies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nova Empresa' : company?.name}
          </h1>
          <p className="text-sm text-gray-500">
            {isNew ? 'Cadastrar company para gerenciar' : 'Gerenciar adequação LGPD'}
          </p>
        </div>
      </div>

      {!isNew && company && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-800">Adequação LGPD</span>
              <span className="text-xl font-bold text-blue-600">
                {company.compliance_score ?? 0}%
              </span>
            </div>
            <Progress value={company.compliance_score ?? 0} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveCompany} className="space-y-4">
            <input type="hidden" name="id" value={isNew ? '' : id} />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Razão Social</Label>
                <Input
                  name="name"
                  defaultValue={company?.name ?? ''}
                  placeholder="Nome da company"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input
                  name="tax_id"
                  defaultValue={company?.tax_id ?? ''}
                  placeholder="00.000.000/0001-00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Setor</Label>
                <Input
                  name="sector"
                  defaultValue={company?.sector ?? ''}
                  placeholder="Ex: Saúde, Varejo..."
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL pública)</Label>
                <Input
                  name="slug"
                  defaultValue={company?.slug ?? ''}
                  placeholder="nome-da-company"
                  required
                />
              </div>
            </div>
            <Button type="submit">{isNew ? 'Criar Empresa' : 'Salvar Alterações'}</Button>
          </form>
        </CardContent>
      </Card>

      {!isNew && (
        <Card>
          <CardHeader>
            <CardTitle>Acesso Rápido aos Módulos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Inventário de Dados', href: '/inventory' },
                { label: 'Treinamentos', href: '/trainings' },
                { label: 'Canal de Denúncias', href: '/complaints' },
                { label: 'Direitos dos Titulares', href: '/data-subjects' },
              ].map((m) => (
                <Link key={m.href} href={m.href}>
                  <Button variant="outline" className="w-full justify-start">
                    {m.label}
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
