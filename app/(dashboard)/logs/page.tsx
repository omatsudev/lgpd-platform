import { Download, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'

const acaoMap: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  CREATE: 'success', UPDATE: 'default', DELETE: 'destructive', ACCESS: 'secondary',
}

export default async function LogsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { companyId, supabase } = await getUserCompany()
  const { q } = await searchParams

  let query = supabase.from('audit_logs').select('*').eq('company_id', companyId ?? '')
  if (q) query = query.or(`user_email.ilike.%${q}%,action.ilike.%${q}%,resource.ilike.%${q}%,details.ilike.%${q}%`)

  const { data: logs } = companyId
    ? await query.order('created_at', { ascending: false }).limit(200)
    : { data: [] }

  const itens = logs ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-sm text-gray-500 mt-0.5">Registro completo para fins jurídicos</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-1" /> Exportar
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-2 text-sm text-blue-700">
            <Shield className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span><span className="font-medium">Evidência Jurídica:</span> Registros imutáveis para comprovação de conformidade com a LGPD.</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <SearchInput defaultValue={q ?? ''} placeholder="Filtrar por usuário, ação, recurso..." />
        </CardHeader>
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-medium">Nenhum log registrado</p>
              <p className="text-sm text-gray-400 mt-1">As ações dos usuários serão registradas aqui</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ação</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Recurso</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Detalhes</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors font-mono text-xs">
                        <td className="py-3 px-4 text-gray-500">{formatDateTime(log.created_at)}</td>
                        <td className="py-3 px-4 text-gray-700">{log.user_email}</td>
                        <td className="py-3 px-4"><Badge variant={acaoMap[log.action] ?? 'secondary'}>{log.action}</Badge></td>
                        <td className="py-3 px-4 text-gray-600">{log.resource}</td>
                        <td className="py-3 px-4 text-gray-500">{log.details ?? '—'}</td>
                        <td className="py-3 px-4 text-gray-400">{log.ip ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-gray-100">
                {itens.map((log: any) => (
                  <div key={log.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={acaoMap[log.action] ?? 'secondary'} className="text-xs">{log.action}</Badge>
                      <span className="text-xs text-gray-400 font-mono">{formatDateTime(log.created_at)}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-700">{log.user_email}</p>
                    <p className="text-xs text-gray-500">{log.details ?? log.resource}</p>
                    {log.ip && <p className="text-xs text-gray-400 font-mono">IP: {log.ip}</p>}
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
