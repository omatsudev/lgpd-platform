import { DeleteCompanyForm } from '@/components/settings/delete-company-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserCompany } from '@/lib/supabase/queries'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const ERRORS: Record<string, string> = {
  forbidden: 'Apenas um administrador da empresa pode desativá-la.',
  mismatch: 'O nome digitado não corresponde ao nome da empresa.',
  '1': 'Não foi possível desativar a empresa. Tente novamente.',
}

const HIDDEN_ITEMS = [
  'Documentos e políticas cadastrados',
  'Inventário de dados, RIPD e DPIAs',
  'Treinamentos e colaboradores vinculados a eles',
  'Consentimentos e finalidades de consentimento coletadas',
  'Solicitações de titulares (DSRs) e reclamações registradas',
  'Fornecedores, checklist de conformidade, riscos e registros de retenção/descarte',
  'O acesso de todos os colaboradores e DPOs vinculados a esta empresa',
]

export default async function DeleteCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { company } = await getUserCompany()
  const { error } = await searchParams

  if (!company) redirect('/settings')

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Desativar Empresa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Você está prestes a desativar{' '}
          <span className="font-semibold text-gray-700">{company.name}</span>
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {ERRORS[error] ?? ERRORS['1']}
        </p>
      )}

      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />O que acontece ao desativar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 mb-3">
            <strong>Nenhum dado é apagado.</strong> {company.name} deixa de aparecer nas empresas
            ativas e ninguém consegue mais acessá-la até que seja reativada. Ficam ocultos
            (mas preservados):
          </p>
          <ul className="text-sm text-red-700 space-y-1.5 list-disc list-inside">
            {HIDDEN_ITEMS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-sm text-red-700 mt-3">
            Você pode reativar a qualquer momento em &quot;Empresas Inativas&quot;, escolhendo entre
            restaurar os dados como estavam ou começar do zero.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confirmar desativação</CardTitle>
        </CardHeader>
        <CardContent>
          <DeleteCompanyForm companyName={company.name} />
        </CardContent>
      </Card>

      <Link href="/settings" className="text-sm text-gray-500 hover:text-gray-700 inline-block">
        ← Cancelar e voltar para Configurações
      </Link>
    </div>
  )
}
