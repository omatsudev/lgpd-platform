import { Plus, Search, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const inventarioMock = [
  {
    id: '1',
    tipo_dado: 'Dados de identificação',
    finalidade: 'Cadastro de funcionários',
    base_legal: 'Execução de contrato',
    local_armazenamento: 'Sistema de RH interno',
    prazo_retencao: '5 anos',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    tipo_dado: 'Dados financeiros',
    finalidade: 'Processamento de folha de pagamento',
    base_legal: 'Cumprimento de obrigação legal',
    local_armazenamento: 'ERP Contábil',
    prazo_retencao: '10 anos',
    created_at: '2024-01-20',
  },
  {
    id: '3',
    tipo_dado: 'Dados de saúde',
    finalidade: 'Gestão de plano de saúde',
    base_legal: 'Tutela da saúde',
    local_armazenamento: 'Operadora de saúde',
    prazo_retencao: '20 anos',
    created_at: '2024-02-01',
  },
]

export default function InventarioPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventário de Dados</h1>
          <p className="text-sm text-gray-500 mt-1">Mapeamento de todos os dados pessoais tratados pela empresa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Link href="/inventario/novo">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Registro
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Buscar por tipo de dado, finalidade..." className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo de Dado</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Finalidade</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Base Legal</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Armazenamento</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Retenção</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventarioMock.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant="default">{item.tipo_dado}</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-700">{item.finalidade}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.base_legal}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.local_armazenamento}</td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{item.prazo_retencao}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/inventario/${item.id}`}>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </Link>
                    </td>
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
