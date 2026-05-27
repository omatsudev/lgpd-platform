import { RiscoMatriz } from '@/components/risks/matriz'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { AlertTriangle, Plus } from 'lucide-react'
import Link from 'next/link'

const categoriaLabel: Record<string, string> = {
  privacy: 'Privacidade',
  security: 'Segurança',
  legal: 'Legal',
  operational: 'Operacional',
  reputational: 'Reputacional',
  technological: 'Tecnológico',
}

const estrategiaVariant: Record<string, 'destructive' | 'warning' | 'default' | 'success'> = {
  avoid: 'destructive',
  mitigate: 'warning',
  transfer: 'default',
  accept: 'success',
}

const statusVariant: Record<string, 'secondary' | 'warning' | 'default' | 'success'> = {
  identified: 'secondary',
  under_treatment: 'warning',
  monitoring: 'default',
  closed: 'success',
}

const statusLabel: Record<string, string> = {
  identified: 'Identificado',
  under_treatment: 'Em Tratamento',
  monitoring: 'Monitorando',
  closed: 'Encerrado',
}

function nivelRisco(prob: number, imp: number) {
  const score = prob * imp
  if (score >= 15) return { label: 'Crítico', variant: 'destructive' as const, color: 'bg-red-500' }
  if (score >= 9) return { label: 'Alto', variant: 'destructive' as const, color: 'bg-orange-400' }
  if (score >= 4) return { label: 'Médio', variant: 'warning' as const, color: 'bg-yellow-400' }
  return { label: 'Baixo', variant: 'success' as const, color: 'bg-green-400' }
}

export default async function RiscosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aba?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q, aba = 'lista' } = await searchParams

  let query = supabase
    .from('risks')
    .select('*')
    .eq('company_id', companyId ?? '')
  if (q)
    query = query.or(
      `title.ilike.%${q}%,description.ilike.%${q}%,responsible.ilike.%${q}%,category.ilike.%${q}%`,
    )

  const { data: riscos } = companyId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = riscos ?? []
  const criticos = itens.filter((r: any) => r.inherent_probability * r.inherent_impact >= 15).length
  const altos = itens.filter((r: any) => {
    const s = r.inherent_probability * r.inherent_impact
    return s >= 9 && s < 15
  }).length
  const abertos = itens.filter((r: any) => r.status !== 'closed').length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Riscos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Identificação, avaliação e tratamento de riscos LGPD
          </p>
        </div>
        <Link href="/risks/novo">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Risco
          </Button>
        </Link>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: itens.length, color: 'text-gray-900' },
          { label: 'Críticos', value: criticos, color: 'text-red-600' },
          { label: 'Altos', value: altos, color: 'text-orange-500' },
          { label: 'Abertos', value: abertos, color: 'text-blue-600' },
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
          { key: 'lista', label: 'Lista' },
          { key: 'matriz', label: 'Matriz de Riscos' },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/risks?aba=${tab.key}${q ? `&q=${q}` : ''}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              aba === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {aba === 'matriz' ? (
        <RiscoMatriz itens={itens} />
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <SearchInput
              defaultValue={q ?? ''}
              placeholder="Buscar por título, categoria, responsável..."
            />
          </CardHeader>
          <CardContent className="p-0">
            {itens.length === 0 ? (
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
                      {itens.map((item: any) => {
                        const inerente = nivelRisco(item.inherent_probability, item.inherent_impact)
                        const residual =
                          item.residual_probability && item.residual_impact
                            ? nivelRisco(item.residual_probability, item.residual_impact)
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
                              {categoriaLabel[item.category] ?? item.category}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2.5 h-2.5 rounded-full ${inerente.color}`} />
                                <Badge variant={inerente.variant} className="text-xs">
                                  {inerente.label}
                                </Badge>
                                <span className="text-xs text-gray-400">
                                  ({item.inherent_probability}×{item.inherent_impact})
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {residual ? (
                                <div className="flex items-center gap-1.5">
                                  <div className={`w-2.5 h-2.5 rounded-full ${residual.color}`} />
                                  <Badge variant={residual.variant} className="text-xs">
                                    {residual.label}
                                  </Badge>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {item.strategy ? (
                                <Badge
                                  variant={estrategiaVariant[item.strategy] ?? 'secondary'}
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
                                {statusLabel[item.status] ?? item.status}
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
                  {itens.map((item: any) => {
                    const inerente = nivelRisco(item.inherent_probability, item.inherent_impact)
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
                          <Badge variant={inerente.variant} className="text-xs">
                            {inerente.label}
                          </Badge>
                          <Badge
                            variant={statusVariant[item.status] ?? 'secondary'}
                            className="text-xs"
                          >
                            {statusLabel[item.status] ?? item.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          {categoriaLabel[item.category]}{' '}
                          {item.responsible ? `· ${item.responsible}` : ''}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
