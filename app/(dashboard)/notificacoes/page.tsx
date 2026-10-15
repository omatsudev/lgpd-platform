import { markAllNotificationsRead, markNotificationRead } from '@/app/actions/notifications'
import { LockedFeature } from '@/components/dashboard/locked-feature'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/ui/pagination'
import { countTotalPages, pageRange, parsePage } from '@/lib/pagination'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDateTime } from '@/lib/utils'
import { AlertTriangle, Bell, CheckCheck, Info, ShieldAlert } from 'lucide-react'
import Link from 'next/link'

const severityConfig: Record<
  string,
  { icon: typeof Info; iconClass: string; badge: 'secondary' | 'warning' | 'destructive' }
> = {
  info: { icon: Info, iconClass: 'text-blue-500', badge: 'secondary' },
  warning: { icon: AlertTriangle, iconClass: 'text-yellow-500', badge: 'warning' },
  critical: { icon: ShieldAlert, iconClass: 'text-red-500', badge: 'destructive' },
}

export default async function NotificacoesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const { companyId, role, supabase } = await getUserCompany()
  if (role === 'collaborator') return <LockedFeature moduleKey="notifications" reason="role" />

  const { filter, page: pageParam } = await searchParams
  const page = parsePage(pageParam)
  const onlyUnread = filter === 'unread'

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId ?? '')
  if (onlyUnread) query = query.is('read_at', null)

  const [from, to] = pageRange(page)
  const { data: notifications, count } = companyId
    ? await query.order('created_at', { ascending: false }).range(from, to)
    : { data: [], count: 0 }

  const items = notifications ?? []
  const totalPages = countTotalPages(count)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Notificações</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Incidentes, denúncias, solicitações e prazos que precisam de atenção
          </p>
        </div>
        <form action={markAllNotificationsRead}>
          <Button variant="outline" size="sm" type="submit">
            <CheckCheck className="h-4 w-4 mr-1" /> Marcar todas como lidas
          </Button>
        </form>
      </div>

      <div className="flex gap-2">
        <Link href="/notificacoes">
          <Button size="sm" variant={!onlyUnread ? 'default' : 'outline'}>
            Todas
          </Button>
        </Link>
        <Link href="/notificacoes?filter=unread">
          <Button size="sm" variant={onlyUnread ? 'default' : 'outline'}>
            Não lidas
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                {onlyUnread ? 'Nenhuma notificação não lida' : 'Nenhuma notificação ainda'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {items.map((n) => {
                const config = severityConfig[n.severity] ?? severityConfig.info
                const Icon = config.icon
                const unread = !n.read_at
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 ${unread ? 'bg-blue-50/40' : ''}`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${config.iconClass}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={n.link ?? '#'}
                          className="font-medium text-gray-900 text-sm hover:underline"
                        >
                          {n.title}
                        </Link>
                        {unread && (
                          <Badge variant={config.badge} className="text-xs">
                            Novo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                    </div>
                    {unread && (
                      <form action={markNotificationRead} className="flex-shrink-0">
                        <input type="hidden" name="id" value={n.id} />
                        <Button variant="ghost" size="sm" type="submit">
                          Marcar como lida
                        </Button>
                      </form>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/notificacoes"
          params={{ filter }}
        />
      </Card>
    </div>
  )
}
