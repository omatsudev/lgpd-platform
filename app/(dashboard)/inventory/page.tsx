import { ExportButton } from '@/components/inventory/export-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { Plus } from 'lucide-react'
import Link from 'next/link'

const riskVariant: Record<string, 'destructive' | 'warning' | 'success'> = {
  high: 'destructive',
  alto: 'destructive',
  medium: 'warning',
  medio: 'warning',
  low: 'success',
  baixo: 'success',
}

const statusVariant: Record<string, 'default' | 'secondary'> = {
  complete: 'default',
  draft: 'secondary',
}

const riskLabel: Record<string, string> = {
  high: 'Alto',
  alto: 'Alto',
  medium: 'Médio',
  medio: 'Médio',
  low: 'Baixo',
  baixo: 'Baixo',
}

const statusLabel: Record<string, string> = {
  complete: 'Completo',
  draft: 'Rascunho',
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q } = await searchParams

  let query = supabase
    .from('data_inventory')
    .select('*')
    .eq('company_id', companyId ?? '')
  if (q)
    query = query.or(
      `process_name.ilike.%${q}%,data_type.ilike.%${q}%,purpose.ilike.%${q}%,legal_basis.ilike.%${q}%,responsible_department.ilike.%${q}%`,
    )

  const { data: inventoryData } = companyId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const items = inventoryData ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Inventário de Dados</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Mapeamento de dados pessoais tratados pela empresa
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton items={items} />
          <Link href="/inventory/novo">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <SearchInput
            defaultValue={q ?? ''}
            placeholder="Buscar por processo, finalidade, base legal, setor..."
          />
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-medium">Nenhum registro cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Clique em "+ Novo" para mapear dados pessoais
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Processo
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Setor
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Base Legal
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Risco
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item: any) => {
                      const displayName = item.process_name || item.data_type || '—'
                      const risk = item.risk_level ?? 'low'
                      const status = item.record_status ?? 'draft'
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                            {displayName}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {item.responsible_department ?? '—'}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs max-w-[160px] truncate">
                            {item.legal_basis ?? '—'}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={riskVariant[risk] ?? 'secondary'}>
                              {riskLabel[risk] ?? risk}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={statusVariant[status] ?? 'secondary'}>
                              {statusLabel[status] ?? status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Link href={`/inventory/${item.id}/view`}>
                                <Button variant="ghost" size="sm">
                                  Ver
                                </Button>
                              </Link>
                              <Link href={`/inventory/${item.id}`}>
                                <Button variant="ghost" size="sm">
                                  Editar
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {items.map((item: any) => {
                  const displayName = item.process_name || item.data_type || '—'
                  const risk = item.risk_level ?? 'low'
                  const status = item.record_status ?? 'draft'
                  return (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{displayName}</p>
                        <div className="flex gap-1">
                          <Link href={`/inventory/${item.id}/view`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Ver
                            </Button>
                          </Link>
                          <Link href={`/inventory/${item.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={riskVariant[risk] ?? 'secondary'} className="text-xs">
                          {riskLabel[risk] ?? risk}
                        </Badge>
                        <Badge variant={statusVariant[status] ?? 'secondary'} className="text-xs">
                          {statusLabel[status] ?? status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {item.responsible_department && (
                          <p>
                            <span className="font-medium">Setor:</span>{' '}
                            {item.responsible_department}
                          </p>
                        )}
                        {item.legal_basis && (
                          <p>
                            <span className="font-medium">Base legal:</span> {item.legal_basis}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
