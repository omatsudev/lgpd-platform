import { Plus, Truck, AlertCircle, Globe } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'

const categoriaLabel: Record<string, string> = {
  tecnologia: 'Tecnologia', saude: 'Saúde', financeiro: 'Financeiro',
  rh: 'RH', marketing: 'Marketing', juridico: 'Jurídico',
  contabilidade: 'Contabilidade', logistica: 'Logística', outro: 'Outro',
}

const tipoAcessoLabel: Record<string, string> = {
  operador: 'Operador', controlador_conjunto: 'Controlador Conjunto',
  suboperador: 'Suboperador', sem_acesso_dados: 'Sem acesso a dados',
}

const riscoVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  baixo: 'success', medio: 'warning', alto: 'destructive', critico: 'destructive',
}

const diligenciaVariant: Record<string, 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pendente: 'secondary', em_analise: 'warning', aprovado: 'success',
  reprovado: 'destructive', expirado: 'destructive',
}

const diligenciaLabel: Record<string, string> = {
  pendente: 'Pendente', em_analise: 'Em Análise', aprovado: 'Aprovado',
  reprovado: 'Reprovado', expirado: 'Expirado',
}

export default async function FornecedoresPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { empresaId, supabase } = await getUserEmpresa()
  const { q } = await searchParams

  let query = supabase.from('fornecedores').select('*').eq('empresa_id', empresaId ?? '')
  if (q) query = query.or(`nome.ilike.%${q}%,cnpj.ilike.%${q}%,categoria.ilike.%${q}%,contato_email.ilike.%${q}%`)

  const { data: fornecedores } = empresaId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = fornecedores ?? []
  const hoje = new Date()

  const semDPA = itens.filter((f: any) => f.tipo_acesso !== 'sem_acesso_dados' && !f.possui_dpa).length
  const avaliacaoVencida = itens.filter((f: any) =>
    f.data_proxima_avaliacao && new Date(f.data_proxima_avaliacao) < hoje
  ).length
  const internacionais = itens.filter((f: any) => f.transferencia_internacional).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Mapeamento e due diligence de fornecedores com acesso a dados</p>
        </div>
        <Link href="/fornecedores/novo">
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
                {semDPA > 0 && <><span className="font-medium">{semDPA} fornecedor{semDPA > 1 ? 'es' : ''} sem DPA assinado.</span> </>}
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
              <p className="text-sm text-gray-400 mt-1">Mapeie fornecedores que acessam dados pessoais</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Fornecedor</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Categoria</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tipo de Acesso</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">DPA</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Risco</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Diligência</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item: any) => {
                      const vencida = item.data_proxima_avaliacao && new Date(item.data_proxima_avaliacao) < hoje
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              {item.transferencia_internacional && (
                                <Globe className="h-3.5 w-3.5 text-blue-400 shrink-0" aria-label="Transferência internacional" />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">{item.nome}</p>
                                {item.cnpj && <p className="text-xs text-gray-400">{item.cnpj}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{categoriaLabel[item.categoria] ?? item.categoria}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{tipoAcessoLabel[item.tipo_acesso] ?? item.tipo_acesso}</td>
                          <td className="py-3 px-4">
                            {item.tipo_acesso === 'sem_acesso_dados'
                              ? <span className="text-xs text-gray-400">N/A</span>
                              : item.possui_dpa
                                ? <Badge variant="success" className="text-xs">Assinado</Badge>
                                : <Badge variant="destructive" className="text-xs">Pendente</Badge>}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={riscoVariant[item.nivel_risco] ?? 'secondary'} className="capitalize text-xs">
                              {item.nivel_risco}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={diligenciaVariant[item.status_diligencia] ?? 'secondary'} className="text-xs">
                              {diligenciaLabel[item.status_diligencia] ?? item.status_diligencia}
                            </Badge>
                            {vencida && (
                              <p className="text-xs text-red-500 mt-0.5">Venceu {formatDate(item.data_proxima_avaliacao)}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/fornecedores/${item.id}`}>
                              <Button variant="ghost" size="sm">Editar</Button>
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
                {itens.map((item: any) => (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          {item.transferencia_internacional && <Globe className="h-3.5 w-3.5 text-blue-400" />}
                          <p className="font-medium text-gray-900 text-sm">{item.nome}</p>
                        </div>
                        {item.cnpj && <p className="text-xs text-gray-400">{item.cnpj}</p>}
                      </div>
                      <Link href={`/fornecedores/${item.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">Editar</Button>
                      </Link>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={riscoVariant[item.nivel_risco] ?? 'secondary'} className="capitalize text-xs">{item.nivel_risco}</Badge>
                      <Badge variant={diligenciaVariant[item.status_diligencia] ?? 'secondary'} className="text-xs">
                        {diligenciaLabel[item.status_diligencia] ?? item.status_diligencia}
                      </Badge>
                      {item.tipo_acesso !== 'sem_acesso_dados' && (
                        item.possui_dpa
                          ? <Badge variant="success" className="text-xs">DPA ok</Badge>
                          : <Badge variant="destructive" className="text-xs">Sem DPA</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{categoriaLabel[item.categoria]} · {tipoAcessoLabel[item.tipo_acesso]}</p>
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
