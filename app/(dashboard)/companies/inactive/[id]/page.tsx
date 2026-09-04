import { reactivateCompany } from '@/app/actions/company-lifecycle'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { RefreshCcw, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ReactivateCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, deleted_at')
    .eq('id', id)
    .single()

  if (!company || !company.deleted_at) notFound()

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reativar Empresa</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-semibold text-gray-700">{company.name}</span> foi desativada em{' '}
          {formatDateTime(company.deleted_at)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-blue-600" />
            Restaurar dados anteriores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Reativa a empresa mantendo tudo que já estava cadastrado: documentos, treinamentos,
            consentimentos, inventário de dados e demais registros continuam exatamente como
            estavam antes da desativação.
          </p>
          <form action={reactivateCompany}>
            <input type="hidden" name="company_id" value={company.id} />
            <input type="hidden" name="mode" value="restore" />
            <Button type="submit">Restaurar dados anteriores</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-amber-800">
            <RefreshCcw className="h-4 w-4" />
            Começar do zero
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-amber-700">
            Reativa a empresa apagando permanentemente todos os dados cadastrados anteriormente
            (documentos, treinamentos, consentimentos, inventário, etc.). A empresa volta como se
            tivesse acabado de ser criada. Esta ação não pode ser desfeita.
          </p>
          <form action={reactivateCompany}>
            <input type="hidden" name="company_id" value={company.id} />
            <input type="hidden" name="mode" value="fresh" />
            <Button type="submit" variant="destructive">
              Apagar tudo e começar do zero
            </Button>
          </form>
        </CardContent>
      </Card>

      <Link
        href="/companies/inactive"
        className="text-sm text-gray-500 hover:text-gray-700 inline-block"
      >
        ← Cancelar e voltar para Empresas Inativas
      </Link>
    </div>
  )
}
