import { Plus, Building2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SearchInput } from '@/components/ui/search-input'
import { createClient } from '@/lib/supabase/server'

export default async function EmpresasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { q } = await searchParams

  const { data: vinculos } = await supabase
    .from('user_companies')
    .select('company_id, role, companies(id, name, tax_id, sector, slug, compliance_score)')
    .eq('user_id', user!.id)
    .order('created_at')

  const todas = (vinculos ?? []).map((v: any) => v.companies).filter(Boolean)
  const empresas = q
    ? todas.filter((e: any) =>
        [e.name, e.tax_id, e.sector].some((f: string | null) => f?.toLowerCase().includes(q.toLowerCase()))
      )
    : todas

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Empresas Gerenciadas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Empresas sob sua responsabilidade como DPO</p>
        </div>
        <Link href="/empresas/novo">
          <Button><Plus className="h-4 w-4 mr-1" /> Nova Empresa</Button>
        </Link>
      </div>

      <SearchInput defaultValue={q ?? ''} placeholder="Buscar por nome, CNPJ, setor..." />

      {empresas.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Nenhuma empresa cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "Nova Empresa" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {empresas.map((empresa: any) => (
            <Card key={empresa.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#e8eef7' }}>
                      <Building2 className="h-6 w-6" style={{ color: '#0f2d5e' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-gray-900">{empresa.name}</span>
                        {empresa.sector && <Badge variant="secondary">{empresa.sector}</Badge>}
                      </div>
                      {empresa.tax_id && <p className="text-xs text-gray-400 mt-0.5">CNPJ: {empresa.tax_id}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={empresa.compliance_score ?? 0} className="w-24 h-1.5" />
                        <span className="text-xs font-medium text-gray-600">{empresa.compliance_score ?? 0}% adequada</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {empresa.slug && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/lgpd/${empresa.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    )}
                    <Link href={`/empresas/${empresa.id}`}>
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
