import { Plus, Search, Building2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const empresasMock = [
  {
    id: '1',
    nome: 'Tech Solutions Ltda',
    cnpj: '12.345.678/0001-90',
    setor: 'Tecnologia',
    percentual_adequacao: 75,
    slug: 'tech-solutions',
  },
  {
    id: '2',
    nome: 'Comércio ABC',
    cnpj: '98.765.432/0001-10',
    setor: 'Varejo',
    percentual_adequacao: 40,
    slug: 'comercio-abc',
  },
  {
    id: '3',
    nome: 'Clínica Saúde Total',
    cnpj: '11.222.333/0001-44',
    setor: 'Saúde',
    percentual_adequacao: 90,
    slug: 'clinica-saude-total',
  },
]

export default function EmpresasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas Gerenciadas</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie todas as empresas sob sua responsabilidade como DPO</p>
        </div>
        <Link href="/empresas/novo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Empresa
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Buscar por nome, CNPJ, setor..." className="pl-9" />
      </div>

      <div className="grid gap-4">
        {empresasMock.map((empresa) => (
          <Card key={empresa.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{empresa.nome}</span>
                      <Badge variant="secondary">{empresa.setor}</Badge>
                    </div>
                    <p className="text-xs text-gray-400">CNPJ: {empresa.cnpj}</p>
                    <div className="flex items-center gap-2 pt-1">
                      <Progress value={empresa.percentual_adequacao} className="w-32 h-1.5" />
                      <span className="text-xs font-medium text-gray-600">{empresa.percentual_adequacao}% adequada</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/lgpd/${empresa.slug}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                  <Link href={`/empresas/${empresa.id}`}>
                    <Button size="sm">Acessar</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
