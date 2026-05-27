import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SearchInput } from '@/components/ui/search-input'
import { createClient } from '@/lib/supabase/server'
import { Building2, ExternalLink, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { q } = await searchParams

  const { data: memberships } = await supabase
    .from('user_companies')
    .select('company_id, role, companies(id, name, tax_id, sector, slug, compliance_score)')
    .eq('user_id', user!.id)
    .order('created_at')

  const allCompanies = (memberships ?? []).map((v: any) => v.companies).filter(Boolean)
  const companies = q
    ? allCompanies.filter((e: any) =>
        [e.name, e.tax_id, e.sector].some((f: string | null) =>
          f?.toLowerCase().includes(q.toLowerCase()),
        ),
      )
    : allCompanies

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Empresas Gerenciadas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Empresas sob sua responsabilidade como DPO</p>
        </div>
        <Link href="/companies/novo">
          <Button>
            <Plus className="h-4 w-4 mr-1" /> Nova Empresa
          </Button>
        </Link>
      </div>

      <SearchInput defaultValue={q ?? ''} placeholder="Buscar por nome, CNPJ, setor..." />

      {companies.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma empresa cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "Nova Empresa" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {companies.map((company: any) => (
            <Card key={company.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: '#e8eef7' }}
                    >
                      <Building2 className="h-6 w-6" style={{ color: '#0f2d5e' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{company.name}</span>
                        {company.sector && <Badge variant="secondary">{company.sector}</Badge>}
                      </div>
                      {company.tax_id && (
                        <p className="text-xs text-gray-400 mt-0.5">CNPJ: {company.tax_id}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={company.compliance_score ?? 0} className="w-24 h-1.5" />
                        <span className="text-xs font-medium text-gray-600">
                          {company.compliance_score ?? 0}% adequada
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {company.slug && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/lgpd/${company.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <Link href={`/companies/${company.id}`}>
                      <Button size="sm">Acessar</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
