import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { AlertCircle, Globe, Plus, Scale, Truck } from 'lucide-react'
import Link from 'next/link'

const categoriaLabel: Record<string, string> = {
  technology: 'Tecnologia',
  healthcare: 'Saúde',
  financial: 'Financeiro',
  hr: 'RH',
  marketing: 'Marketing',
  legal: 'Jurídico',
  accounting: 'Contabilidade',
  logistics: 'Logística',
  other: 'Outro',
}

const tipoAcessoLabel: Record<string, string> = {
  processor: 'Operador',
  joint_controller: 'Controlador Conjunto',
  sub_processor: 'Suboperador',
  no_data_access: 'Sem acesso a dados',
}

const riscoVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

const diligenciaVariant: Record<string, 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'secondary',
  under_review: 'warning',
  approved: 'success',
  rejected: 'destructive',
  expired: 'destructive',
}

const diligenciaLabel: Record<string, string> = {
  pending: 'Pendente',
  under_review: 'Em Análise',
  approved: 'Aprovado',
  rejected: 'Reprovado',
  expired: 'Expirado',
}

export default async function FornecedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q } = await searchParams

  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('company_id', companyId ?? '')
  if (q)
    query = query.or(
      `name.ilike.%${q}%,tax_id.ilike.%${q}%,category.ilike.%${q}%,contact_email.ilike.%${q}%`,
    )

  const { data: fornecedores } = companyId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = fornecedores ?? []
  const hoje = new Date()

  const semDPA = itens.filter((f: any) => f.access_type !== 'no_data_access' && !f.has_dpa).length
  const avaliacaoVencida = itens.filter(
    (f: any) => f.next_assessment_date && new Date(f.next_assessment_date) < hoje,
  ).length
  const internacionais = itens.filter((f: any) => f.international_transfer).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Mapeamento e due diligence de fornecedores com acesso a dados
          </p>
        </div>
        <Link href="/suppliers/novo">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Fornecedor
          </Button>
        </Link>
      </div>

      {/* Alertas */}
      {(semDPA > 0 || avaliacaoVencida > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start gap-2 text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                {semDPA > 0 && (
                  <>
                    <span className="font-medium">
                      {semDPA} fornecedor{semDPA > 1 ? 'es' : ''} sem DPA assinado.
                    </span>{' '}
                  </>
                )}
                {avaliacaoVencida > 0 && <>{avaliacaoVencida} com avaliação vencida.</>}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-gray-900">{itens.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-red-600">{semDPA}</p>
            <p className="text-xs text-gray-500 mt-0.5">Sem DPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Globe className="h-4 w-4 text-blue-500" />
              <p className="text-2xl font-bold text-gray-900">{internacionais}</p>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Internacionais</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <SearchInput defaultValue={q ?? ''} placeholder="Buscar por nome, CNPJ, categoria..." />
        </CardHeader>
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="py-12 text-center">
              <Truck className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum fornecedor cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Mapeie fornecedores que acessam dados pessoais
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
                        Fornecedor
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Categoria
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Tipo de Acesso
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        DPA
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Risco
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Diligência
                      </th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item: any) => {
                      const vencida =
                        item.next_assessment_date && new Date(item.next_assessment_date) < hoje
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {item.international_transfer && (
                                <Globe
                                  className="h-3.5 w-3.5 text-blue-400 shrink-0"
                                  aria-label="Transferência internacional"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.name}</p>
                                {item.tax_id && (
                                  <p className="text-xs text-gray-400">{item.tax_id}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {categoriaLabel[item.category] ?? item.category}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {tipoAcessoLabel[item.access_type] ?? item.access_type}
                          </td>
                          <td className="py-3 px-4">
                            {item.access_type === 'no_data_access' ? (
                              <span className="text-xs text-gray-400">N/A</span>
                            ) : item.has_dpa ? (
                              <Badge variant="success" className="text-xs">
                                Assinado
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-xs">
                                Pendente
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={riscoVariant[item.risk_level] ?? 'secondary'}
                              className="capitalize text-xs"
                            >
                              {item.risk_level}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={diligenciaVariant[item.due_diligence_status] ?? 'secondary'}
                              className="text-xs"
                            >
                              {diligenciaLabel[item.due_diligence_status] ??
                                item.due_diligence_status}
                            </Badge>
                            {vencida && (
                              <p className="text-xs text-red-500 mt-0.5">
                                Venceu {formatDate(item.next_assessment_date)}
                              </p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <a
                                href={`https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(item.tax_id ?? item.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Consultar no Jusbrasil"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <Scale className="h-3.5 w-3.5 mr-1" /> Jusbrasil
                                </Button>
                              </a>
                              <Link href={`/suppliers/${item.id}`}>
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

              {/* Mobile */}
              <div className="md:hidden divide-y divide-gray-100">
                {itens.map((item: any) => (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {item.international_transfer && (
                            <Globe className="h-3.5 w-3.5 text-blue-400" />
                          )}
                          <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                        </div>
                        {item.tax_id && <p className="text-xs text-gray-400">{item.tax_id}</p>}
                      </div>
                      <div className="flex gap-1">
                        <a
                          href={`https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(item.tax_id ?? item.name)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-blue-600">
                            <Scale className="h-3 w-3 mr-1" /> Jusbrasil
                          </Button>
                        </a>
                        <Link href={`/suppliers/${item.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Editar
                          </Button>
                        </Link>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        variant={riscoVariant[item.risk_level] ?? 'secondary'}
                        className="capitalize text-xs"
                      >
                        {item.risk_level}
                      </Badge>
                      <Badge
                        variant={diligenciaVariant[item.due_diligence_status] ?? 'secondary'}
                        className="text-xs"
                      >
                        {diligenciaLabel[item.due_diligence_status] ?? item.due_diligence_status}
                      </Badge>
                      {item.access_type !== 'no_data_access' &&
                        (item.has_dpa ? (
                          <Badge variant="success" className="text-xs">
                            DPA ok
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Sem DPA
                          </Badge>
                        ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      {categoriaLabel[item.category]} · {tipoAcessoLabel[item.access_type]}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
