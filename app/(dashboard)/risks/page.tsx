import { LockedFeature } from '@/components/dashboard/locked-feature'
import { RiskMatrix } from '@/components/risks/matrix'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { SearchInput } from '@/components/ui/search-input'
import { countTotalPages, pageRange, parsePage } from '@/lib/pagination'
import { calculateRiskLevel, RISK_LEVEL_LABELS, RISK_LEVEL_VARIANTS } from '@/lib/risk-scoring'
import {
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  RISK_STRATEGY_VARIANTS,
} from '@/lib/status-labels'
import { getUserCompany } from '@/lib/supabase/queries'
import { AlertTriangle, Plus } from 'lucide-react'
import Link from 'next/link'

const statusVariant: Record<string, 'secondary' | 'warning' | 'default' | 'success'> = {
  identified: 'secondary',
  under_treatment: 'warning',
  monitoring: 'default',
  closed: 'success',
}

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tab?: string; page?: string }>
}) {
  const { companyId, company, role, supabase } = await getUserCompany()
  if (role === 'collaborator') return <LockedFeature moduleKey="risks" reason="role" />
  if (company?.plan === 'basic') return <LockedFeature moduleKey="risks" reason="plan" />

  const { q, tab = 'list', page: pageParam } = await searchParams
  const page = parsePage(pageParam)

  const applyFilter = <T,>(query: T): T => {
    if (!q) return query
    return (query as any).or(
      `title.ilike.%${q}%,description.ilike.%${q}%,responsible.ilike.%${q}%,category.ilike.%${q}%`,
    )
  }

  // Busca enxuta com todos os riscos do filtro atual: alimenta os cards de
  // resumo e a matriz (que precisa ver todos os pontos, não só uma página).
  const { data: allRisks } = companyId
    ? await applyFilter(
        supabase
          .from('risks')
          .select('id, title, inherent_probability, inherent_impact, status')
          .eq('company_id', companyId),
      )
    : { data: [] }

  const [from, to] = pageRange(page)
  const { data: risksData, count } = companyId
    ? await applyFilter(
        supabase.from('risks').select('*', { count: 'exact' }).eq('company_id', companyId),
      )
        .order('created_at', { ascending: false })
        .range(from, to)
    : { data: [], count: 0 }

  const items = risksData ?? []
  const matrixItems = allRisks ?? []
  const totalPages = countTotalPages(count)
  const criticalItems = matrixItems.filter(
    (r: any) => r.inherent_probability * r.inherent_impact >= 15,
  ).length
  const highItems = matrixItems.filter((r: any) => {
    const s = r.inherent_probability * r.inherent_impact
    return s >= 9 && s < 15
  }).length
  const openItems = matrixItems.filter((r: any) => r.status !== 'closed').length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Riscos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Identificação, avaliação e tratamento de riscos LGPD
          </p>
        </div>
        <Link href="/risks/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Risco
          </Button>
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: matrixItems.length, color: 'text-gray-900' },
          { label: 'Críticos', value: criticalItems, color: 'text-red-600' },
          { label: 'Altos', value: highItems, color: 'text-orange-500' },
          { label: 'Abertos', value: openItems, color: 'text-blue-600' },
        ].map((m) => (
          <Card key={m.label}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'list', label: 'Lista' },
          { key: 'matrix', label: 'Matriz de Riscos' },
        ].map((navTab) => (
          <Link
            key={navTab.key}
            href={`/risks?tab=${navTab.key}${q ? `&q=${q}` : ''}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === navTab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {navTab.label}
          </Link>
        ))}
      </div>

      {tab === 'matrix' ? (
        <RiskMatrix items={matrixItems} />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <SearchInput
              defaultValue={q ?? ''}
              placeholder="Buscar por título, categoria, responsável..."
            />
          </CardHeader>
          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="py-12 text-center">
                <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Nenhum risco cadastrado</p>
                <p className="text-sm text-gray-400 mt-1">
                  Registre e acompanhe os riscos identificados
                </p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Risco
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Categoria
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Inerente
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Residual
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Estratégia
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item: any) => {
                        const inherentLevel = calculateRiskLevel(
                          item.inherent_probability,
                          item.inherent_impact,
                        )
                        const residualLevel =
                          item.residual_probability && item.residual_impact
                            ? calculateRiskLevel(item.residual_probability, item.residual_impact)
                            : null
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-medium text-gray-900 max-w-[200px] truncate">
                                {item.title}
                              </p>
                              {item.responsible && (
                                <p className="text-xs text-gray-400">{item.responsible}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-600 text-xs">
                              {RISK_CATEGORY_LABELS[item.category] ?? item.category}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <Badge
                                  variant={RISK_LEVEL_VARIANTS[inherentLevel]}
                                  className="text-xs"
                                >
                                  {RISK_LEVEL_LABELS[inherentLevel]}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  ({item.inherent_probability}×{item.inherent_impact})
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {residualLevel ? (
                                <div className="flex items-center gap-1.5">
                                  <Badge
                                    variant={RISK_LEVEL_VARIANTS[residualLevel]}
                                    className="text-xs"
                                  >
                                    {RISK_LEVEL_LABELS[residualLevel]}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {item.strategy ? (
                                <Badge
                                  variant={RISK_STRATEGY_VARIANTS[item.strategy] ?? 'secondary'}
                                  className="capitalize text-xs"
                                >
                                  {item.strategy}
                                </Badge>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={statusVariant[item.status] ?? 'secondary'}
                                className="text-xs"
                              >
                                {RISK_STATUS_LABELS[item.status] ?? item.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link href={`/risks/${item.id}`}>
                                <Button variant="ghost" size="sm">
                                  Editar
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-gray-100">
                  {items.map((item: any) => {
                    const inherentLevel = calculateRiskLevel(
                      item.inherent_probability,
                      item.inherent_impact,
                    )
                    return (
                      <div key={item.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                          <Link href={`/risks/${item.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Editar
                            </Button>
                          </Link>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant={RISK_LEVEL_VARIANTS[inherentLevel]} className="text-xs">
                            {RISK_LEVEL_LABELS[inherentLevel]}
                          </Badge>
                          <Badge
                            variant={statusVariant[item.status] ?? 'secondary'}
                            className="text-xs"
                          >
                            {RISK_STATUS_LABELS[item.status] ?? item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {RISK_CATEGORY_LABELS[item.category]}{' '}
                          {item.responsible ? `· ${item.responsible}` : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/risks"
            params={{ q, tab: tab !== 'list' ? tab : undefined }}
          />
        </Card>
      )}
    </div>
  )
}
