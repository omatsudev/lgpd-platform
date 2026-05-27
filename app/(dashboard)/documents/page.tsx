import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { AlertCircle, FileText, Plus } from 'lucide-react'
import Link from 'next/link'

const tipoLabel: Record<string, string> = {
  privacy_policy: 'Política de Privacidade',
  privacy_notice: 'Aviso de Privacidade',
  security_policy: 'Política de Segurança',
  consent_form: 'Termo de Consentimento',
  dpa_contract: 'Contrato DPA',
  dpia: 'RIPD',
  internal_procedure: 'Procedimento Interno',
  audit_report: 'Relatório de Auditoria',
  other: 'Outro',
}

const statusVariant: Record<
  string,
  'secondary' | 'warning' | 'default' | 'success' | 'destructive'
> = {
  draft: 'secondary',
  under_review: 'warning',
  approved: 'default',
  published: 'success',
  obsolete: 'destructive',
}

const statusLabel: Record<string, string> = {
  draft: 'Rascunho',
  under_review: 'Em Revisão',
  approved: 'Aprovado',
  published: 'Publicado',
  obsolete: 'Obsoleto',
}

export default async function DocumentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q } = await searchParams

  let query = supabase
    .from('documents')
    .select('*')
    .eq('company_id', companyId ?? '')
  if (q)
    query = query.or(
      `title.ilike.%${q}%,type.ilike.%${q}%,description.ilike.%${q}%,responsible.ilike.%${q}%`,
    )

  const { data: documentos } = companyId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = documentos ?? []
  const hoje = new Date()
  const expirados = itens.filter(
    (d: any) => d.expiration_date && new Date(d.expiration_date) < hoje,
  ).length
  const vencendoEm30 = itens.filter((d: any) => {
    if (!d.expiration_date) return false
    const diff = (new Date(d.expiration_date).getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 30
  }).length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Documentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Políticas, termos e documentos de conformidade LGPD
          </p>
        </div>
        <Link href="/documents/novo">
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
                {expirados > 0 && (
                  <>
                    <span className="font-medium">
                      {expirados} documento{expirados > 1 ? 's' : ''} expirado
                      {expirados > 1 ? 's' : ''}.
                    </span>{' '}
                  </>
                )}
                {vencendoEm30 > 0 && <>{vencendoEm30} vencendo nos próximos 30 dias.</>}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <SearchInput
            defaultValue={q ?? ''}
            placeholder="Buscar por título, tipo, responsável..."
          />
        </CardHeader>
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum documento cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Adicione políticas, termos e documentos de conformidade
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
                        Título
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Tipo
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Versão
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Revisão
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Expiração
                      </th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item: any) => {
                      const expirado = item.expiration_date && new Date(item.expiration_date) < hoje
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                            {item.title}
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs">
                            {tipoLabel[item.type] ?? item.type}
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs font-mono">
                            v{item.version}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={statusVariant[item.status] ?? 'secondary'}>
                              {statusLabel[item.status] ?? item.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-gray-500 text-xs">
                            {item.review_date ? formatDate(item.review_date) : '—'}
                          </td>
                          <td className="py-3 px-4 text-xs">
                            {item.expiration_date ? (
                              <span
                                className={expirado ? 'text-red-600 font-medium' : 'text-gray-500'}
                              >
                                {formatDate(item.expiration_date)}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/documents/${item.id}`}>
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
                  const expirado = item.expiration_date && new Date(item.expiration_date) < hoje
                  return (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                        <Link href={`/documents/${item.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            Editar
                          </Button>
                        </Link>
                      </div>
                      <div className="flex gap-2 flex-wrap items-center">
                        <Badge
                          variant={statusVariant[item.status] ?? 'secondary'}
                          className="text-xs"
                        >
                          {statusLabel[item.status] ?? item.status}
                        </Badge>
                        <span className="text-xs text-gray-500 font-mono">v{item.version}</span>
                      </div>
                      <p className="text-xs text-gray-500">{tipoLabel[item.type] ?? item.type}</p>
                      {item.expiration_date && (
                        <p
                          className={`text-xs ${expirado ? 'text-red-600 font-medium' : 'text-gray-400'}`}
                        >
                          Expira: {formatDate(item.expiration_date)}
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
