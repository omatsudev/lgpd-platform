import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { RETENTION_STATUS_LABELS, RETENTION_STATUS_VARIANTS } from '@/lib/status-labels'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, Clock, Lock, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

const statusIcon: Record<string, any> = {
  regular: CheckCircle2,
  expiring_soon: AlertTriangle,
  overdue: Trash2,
  hold: Lock,
}

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'regular', label: 'Regular' },
  { value: 'expiring_soon', label: 'Próx. vencimento' },
  { value: 'overdue', label: 'Vencido' },
  { value: 'hold', label: 'Bloqueado' },
]

export default async function RetentionDisposalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q, status } = await searchParams

  let query = supabase
    .from('retention_disposals')
    .select('*')
    .eq('company_id', companyId ?? '')

  if (q) {
    query = query.or(`data_type.ilike.%${q}%,category.ilike.%${q}%`)
  }
  if (status) {
    query = query.eq('calculated_status', status)
  }

  const { data: retentionData } = companyId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const items = retentionData ?? []
  const overdueItems = items.filter((i: any) => i.calculated_status === 'overdue').length
  const expiringSoon = items.filter((i: any) => i.calculated_status === 'expiring_soon').length
  const holdItems = items.filter((i: any) => i.calculated_status === 'hold').length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Retenção e Descarte</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Controle de prazos de guarda e ciclo de vida dos dados (LGPD Art. 16)
          </p>
        </div>
        <Link href="/retention-disposal/novo">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" /> Novo Registro
          </Button>
        </Link>
      </div>

      {/* Alertas */}
      {(overdueItems > 0 || expiringSoon > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {overdueItems > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <Trash2 className="h-4 w-4 flex-shrink-0" />
                  <span>
                    <span className="font-semibold">{overdueItems}</span> registro
                    {overdueItems > 1 ? 's' : ''} com prazo vencido — descarte necessário.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {expiringSoon > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    <span className="font-semibold">{expiringSoon}</span> registro
                    {expiringSoon > 1 ? 's' : ''} vence{expiringSoon === 1 ? '' : 'm'} em até 60
                    dias.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: items.length, color: 'text-gray-900' },
          {
            label: 'Regulares',
            value: items.filter((i: any) => i.calculated_status === 'regular').length,
            color: 'text-green-700',
          },
          { label: 'Vencidos', value: overdueItems, color: 'text-red-700' },
          { label: 'Bloqueados', value: holdItems, color: 'text-gray-700' },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros e busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput placeholder="Buscar por tipo ou categoria..." defaultValue={q} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <Link key={f.value} href={f.value ? `?status=${f.value}` : '/retention-disposal'}>
              <Button
                size="sm"
                variant={status === f.value || (!status && !f.value) ? 'default' : 'outline'}
                className="text-xs"
              >
                {f.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              {q || status
                ? 'Nenhum registro encontrado.'
                : 'Nenhum registro de retenção cadastrado ainda.'}
            </p>
            {!q && !status && (
              <Link href="/retention-disposal/novo">
                <Button size="sm" className="mt-4">
                  <Plus className="h-4 w-4 mr-1" /> Criar primeiro registro
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item: any) => {
            const StatusIcon = statusIcon[item.calculated_status] ?? CheckCircle2
            return (
              <Link key={item.id} href={`/retention-disposal/${item.id}`}>
                <Card className="hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {item.data_type}
                          </p>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {item.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {item.retention_period}
                          </span>
                          <span className="text-xs text-gray-500">
                            Início: {item.start_event}
                          </span>
                          {item.expiration_date && (
                            <span className="text-xs text-gray-500">
                              Venc.: {formatDate(item.expiration_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={RETENTION_STATUS_VARIANTS[item.calculated_status] ?? 'secondary'}
                        className="shrink-0 flex items-center gap-1"
                      >
                        <StatusIcon className="h-3 w-3" />
                        {RETENTION_STATUS_LABELS[item.calculated_status] ?? item.calculated_status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
