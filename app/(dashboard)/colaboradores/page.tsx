import { Plus, Search, Send, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const colaboradoresMock = [
  { id: '1', nome: 'Ana Paula', email: 'ana@empresa.com', whatsapp: '11999990001', treinamentos_concluidos: 3, total_treinamentos: 3 },
  { id: '2', nome: 'Bruno Costa', email: 'bruno@empresa.com', whatsapp: '11999990002', treinamentos_concluidos: 1, total_treinamentos: 3 },
  { id: '3', nome: 'Carla Dias', email: 'carla@empresa.com', whatsapp: '11999990003', treinamentos_concluidos: 0, total_treinamentos: 3 },
  { id: '4', nome: 'Diego Lima', email: 'diego@empresa.com', whatsapp: '11999990004', treinamentos_concluidos: 2, total_treinamentos: 3 },
]

export default function ColaboradoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie os colaboradores e envie treinamentos via WhatsApp</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Colaborador
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar colaboradores..." className="pl-9" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Lista de Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Treinamentos</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {colaboradoresMock.map((c) => {
                  const completo = c.treinamentos_concluidos === c.total_treinamentos
                  const parcial = c.treinamentos_concluidos > 0
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900">{c.nome}</td>
                      <td className="py-3 px-4 text-gray-500">{c.email}</td>
                      <td className="py-3 px-4 text-gray-500">{c.whatsapp}</td>
                      <td className="py-3 px-4">
                        <Badge variant={completo ? 'success' : parcial ? 'warning' : 'secondary'}>
                          {c.treinamentos_concluidos}/{c.total_treinamentos} concluídos
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Send className="h-3 w-3" />
                          Enviar WhatsApp
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
