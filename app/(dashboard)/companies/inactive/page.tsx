import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime } from '@/lib/utils'
import { Building2 } from 'lucide-react'
import Link from 'next/link'

const ERRORS: Record<string, string> = {
  forbidden: 'Apenas um administrador da empresa pode reativá-la.',
  '1': 'Não foi possível reativar a empresa. Tente novamente.',
}

export default async function InactiveCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { error } = await searchParams

  const { data: memberships } = await supabase
    .from('user_companies')
    .select('company_id')
    .eq('user_id', user!.id)

  const companyIds = (memberships ?? []).map((m) => m.company_id)
  const { data: companiesData } = companyIds.length
    ? await supabase
        .from('companies')
        .select('id, name, sector, deleted_at')
        .in('id', companyIds)
    : { data: [] }

  const inactive = (companiesData ?? []).filter((c) => c.deleted_at)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Empresas Inativas</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Empresas desativadas — os dados continuam salvos, só ficam ocultos das listas ativas
          </p>
        </div>
        <Link href="/companies">
          <Button variant="outline">← Empresas ativas</Button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {ERRORS[error] ?? ERRORS['1']}
        </p>
      )}

      {inactive.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma empresa inativa</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {inactive.map((company: any) => (
            <Card key={company.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 bg-gray-100">
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-700">{company.name}</span>
                        <Badge variant="secondary">Inativa</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Desativada em {formatDateTime(company.deleted_at)}
                      </p>
                    </div>
                  </div>
                  <Link href={`/companies/inactive/${company.id}`}>
                    <Button size="sm">Reativar</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
