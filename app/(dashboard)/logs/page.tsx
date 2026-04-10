import { Search, Download, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'

const logsMock = [
  {
    id: '1',
    user_email: 'admin@empresa.com',
    acao: 'CREATE',
    recurso: 'Inventário',
    detalhes: 'Criou registro: Dados de identificação',
    ip: '192.168.1.100',
    created_at: '2024-03-25T14:23:00Z',
  },
  {
    id: '2',
    user_email: 'dpo@empresa.com',
    acao: 'UPDATE',
    recurso: 'Denúncia #3',
    detalhes: 'Status alterado para: resolvido',
    ip: '10.0.0.5',
    created_at: '2024-03-25T11:15:00Z',
  },
  {
    id: '3',
    user_email: 'colaborador@empresa.com',
    acao: 'ACCESS',
    recurso: 'Treinamento',
    detalhes: 'Concluiu treinamento: Introdução à LGPD',
    ip: '172.16.0.20',
    created_at: '2024-03-24T16:40:00Z',
  },
  {
    id: '4',
    user_email: 'admin@empresa.com',
    acao: 'DELETE',
    recurso: 'Inventário',
    detalhes: 'Excluiu registro ID: inv-legacy-001',
    ip: '192.168.1.100',
    created_at: '2024-03-24T09:00:00Z',
  },
]

const acaoMap: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  CREATE: 'success',
  UPDATE: 'default',
  DELETE: 'destructive',
  ACCESS: 'secondary',
}

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoria</h1>
          <p className="text-sm text-gray-500 mt-1">Registro completo de ações para fins jurídicos</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Evidência Jurídica:</span>
            <span>Todos os registros são imutáveis e podem ser usados como prova de conformidade com a LGPD.</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Filtrar por usuário, ação, recurso..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Data/Hora</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ação</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Recurso</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Detalhes</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logsMock.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors font-mono text-xs">
                    <td className="py-3 px-4 text-gray-500">{formatDateTime(log.created_at)}</td>
                    <td className="py-3 px-4 text-gray-700">{log.user_email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={acaoMap[log.acao] || 'secondary'}>{log.acao}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{log.recurso}</td>
                    <td className="py-3 px-4 text-gray-500">{log.detalhes}</td>
                    <td className="py-3 px-4 text-gray-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
