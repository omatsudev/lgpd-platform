import { Plus, FileText, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'

const tipoLabel: Record<string, string> = {
  politica_privacidade: 'Política de Privacidade',
  aviso_privacidade: 'Aviso de Privacidade',
  politica_seguranca: 'Política de Segurança',
  termo_consentimento: 'Termo de Consentimento',
  contrato_dpa: 'Contrato DPA',
  ripd: 'RIPD',
  procedimento_interno: 'Procedimento Interno',
  relatorio_auditoria: 'Relatório de Auditoria',
  outro: 'Outro',
}

const statusVariant: Record<string, 'secondary' | 'warning' | 'default' | 'success' | 'destructive'> = {
  rascunho: 'secondary',
  em_revisao: 'warning',
  aprovado: 'default',
  publicado: 'success',
  obsoleto: 'destructive',
}

const statusLabel: Record<string, string> = {
  rascunho: 'Rascunho',
  em_revisao: 'Em Revisão',
  aprovado: 'Aprovado',
  publicado: 'Publicado',
  obsoleto: 'Obsoleto',
}

export default async function DocumentosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { empresaId, supabase } = await getUserEmpresa()
  const { q } = await searchParams

  let query = supabase.from('documentos').select('*').eq('empresa_id', empresaId ?? '')
  if (q) query = query.or(`titulo.ilike.%${q}%,tipo.ilike.%${q}%,descricao.ilike.%${q}%,responsavel.ilike.%${q}%`)

  const { data: documentos } = empresaId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = documentos ?? []
  const hoje = new Date()
  const expirados = itens.filter((d: any) => d.data_expiracao && new Date(d.data_expiracao) < hoje).length
  const vencendoEm30 = itens.filter((d: any) => {
    if (!d.data_expiracao) return false
    const diff = (new Date(d.data_expiracao).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  }).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Documentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Políticas, termos e documentos de conformidade LGPD</p>
        </div>
        <Link href="/documentos/novo">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Documento
          </Button>
        </Link>
      </div>

      {(expirados > 0 || vencendoEm30 > 0) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start gap-2 text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                {expirados > 0 && <><span className="font-medium">{expirados} documento{expirados > 1 ? 's' : ''} expirado{expirados > 1 ? 's' : ''}.</span> </>}
                {vencendoEm30 > 0 && <>{vencendoEm30} vencendo nos próximos 30 dias.</>}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <SearchInput defaultValue={q ?? ''} placeholder="Buscar por título, tipo, responsável..." />
        </CardHeader>
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum documento cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">Adicione políticas, termos e documentos de conformidade</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Título</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Versão</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Revisão</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Expiração</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item: any) => {
                      const expirado = item.data_expiracao && new Date(item.data_expiracao) < hoje
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">{item.titulo}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{tipoLabel[item.tipo] ?? item.tipo}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs font-mono">v{item.versao}</td>
                          <td className="py-3 px-4">
                            <Badge variant={statusVariant[item.status] ?? 'secondary'}>
                              {statusLabel[item.status] ?? item.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{item.data_revisao ? formatDate(item.data_revisao) : '—'}</td>
                          <td className="py-3 px-4 text-xs">
                            {item.data_expiracao ? (
                              <span className={expirado ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                {formatDate(item.data_expiracao)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/documentos/${item.id}`}>
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
                {itens.map((item: any) => {
                  const expirado = item.data_expiracao && new Date(item.data_expiracao) < hoje
                  return (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{item.titulo}</p>
                        <Link href={`/documentos/${item.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">Editar</Button>
                        </Link>
                      </div>
                      <div className="flex gap-2 flex-wrap items-center">
                        <Badge variant={statusVariant[item.status] ?? 'secondary'} className="text-xs">
                          {statusLabel[item.status] ?? item.status}
                        </Badge>
                        <span className="text-xs text-gray-500 font-mono">v{item.versao}</span>
                      </div>
                      <p className="text-xs text-gray-500">{tipoLabel[item.tipo] ?? item.tipo}</p>
                      {item.data_expiracao && (
                        <p className={`text-xs ${expirado ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                          Expira: {formatDate(item.data_expiracao)}
                        </p>
                      )}
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
