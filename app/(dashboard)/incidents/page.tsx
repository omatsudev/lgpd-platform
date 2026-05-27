import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { Plus, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

const severidadeVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  low: 'success',
  medium: 'warning',
  high: 'destructive',
  critical: 'destructive',
}

const severidadeLabel: Record<string, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  critical: 'Crítica',
}

const statusVariant: Record<string, 'secondary' | 'warning' | 'default' | 'success'> = {
  identified: 'secondary',
  under_investigation: 'warning',
  contained: 'default',
  resolved: 'success',
  closed: 'secondary',
}

const statusLabel: Record<string, string> = {
  identified: 'Identificado',
  under_investigation: 'Em Investigação',
  contained: 'Contido',
  resolved: 'Resolvido',
  closed: 'Encerrado',
}

const tipoLabel: Record<string, string> = {
  data_breach: 'Vazamento de Dados',
  unauthorized_access: 'Acesso Não Autorizado',
  data_loss: 'Perda de Dados',
  improper_modification: 'Alteração Indevida',
  misuse: 'Uso Indevido',
  ransomware: 'Ransomware',
  phishing: 'Phishing',
  other: 'Outro',
}

export default async function IncidentesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q } = await searchParams

  let query = supabase
    .from('incidents')
    .select('*')
    .eq('company_id', companyId ?? '')
  if (q)
    query = query.or(
      `title.ilike.%${q}%,type.ilike.%${q}%,description.ilike.%${q}%,responsible.ilike.%${q}%`,
    )

  const { data: incidentes } = companyId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = incidentes ?? []
  const abertos = itens.filter((i: any) => !['resolved', 'closed'].includes(i.status)).length
  const criticos = itens.filter((i: any) => i.severity === 'critical').length

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestão de Incidentes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Registro e resposta a incidentes de segurança (LGPD Art. 48)
          </p>
        </div>
        <Link href="/incidents/novo">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Registrar Incidente
          </Button>
        </Link>
      </div>

      {(abertos > 0 || criticos > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start gap-2 text-sm text-red-700">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-medium">Atenção: </span>
                {abertos > 0 && (
                  <>
                    {abertos} incidente{abertos > 1 ? 's' : ''} em aberto.{' '}
                  </>
                )}
                {criticos > 0 && <>{criticos} de severidade crítica.</>}
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
              <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum incidente registrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Registre incidentes de segurança para manter conformidade
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
                        Severidade
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Descoberto em
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        ANPD
                      </th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-gray-600 text-xs">
                          {tipoLabel[item.type] ?? item.type}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={severidadeVariant[item.severity] ?? 'secondary'}>
                            {severidadeLabel[item.severity] ?? item.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusVariant[item.status] ?? 'secondary'}>
                            {statusLabel[item.status] ?? item.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {item.discovery_date ? formatDate(item.discovery_date) : '—'}
                        </td>
                        <td className="py-3 px-4">
                          {item.notified_anpd ? (
                            <Badge variant="success" className="text-xs">
                              Notificado
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Pendente
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link href={`/incidents/${item.id}`}>
                            <Button variant="ghost" size="sm">
                              Ver
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-gray-100">
                {itens.map((item: any) => (
                  <div key={item.id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                      <Link href={`/incidents/${item.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Ver
                        </Button>
                      </Link>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge
                        variant={severidadeVariant[item.severity] ?? 'secondary'}
                        className="text-xs"
                      >
                        {severidadeLabel[item.severity] ?? item.severity}
                      </Badge>
                      <Badge
                        variant={statusVariant[item.status] ?? 'secondary'}
                        className="text-xs"
                      >
                        {statusLabel[item.status] ?? item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">{tipoLabel[item.type] ?? item.type}</p>
                    {item.discovery_date && (
                      <p className="text-xs text-gray-400">
                        Descoberto: {formatDate(item.discovery_date)}
                      </p>
                    )}
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
