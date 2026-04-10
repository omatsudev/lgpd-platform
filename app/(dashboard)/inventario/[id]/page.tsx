import { ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function InventarioFormPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'novo'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/inventario">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Novo Registro' : 'Editar Registro'}
          </h1>
          <p className="text-sm text-gray-500">Inventário de dados pessoais</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados do Tratamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_dado">Tipo de Dado *</Label>
              <Input id="tipo_dado" placeholder="Ex: Dados de identificação" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="base_legal">Base Legal *</Label>
              <Input id="base_legal" placeholder="Ex: Consentimento do titular" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="finalidade">Finalidade do Tratamento *</Label>
            <Textarea id="finalidade" placeholder="Descreva para qual finalidade os dados são tratados..." rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="local_armazenamento">Local de Armazenamento *</Label>
              <Input id="local_armazenamento" placeholder="Ex: Servidor interno, AWS S3..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazo_retencao">Prazo de Retenção</Label>
              <Input id="prazo_retencao" placeholder="Ex: 5 anos, Indefinido..." />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável pelo Tratamento</Label>
            <Input id="responsavel" placeholder="Nome ou setor responsável" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medidas_seguranca">Medidas de Segurança</Label>
            <Textarea id="medidas_seguranca" placeholder="Descreva as medidas técnicas e organizacionais adotadas..." rows={3} />
          </div>

          <div className="flex justify-between pt-4">
            {!isNew && (
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Link href="/inventario">
                <Button variant="outline">Cancelar</Button>
              </Link>
              <Button>Salvar Registro</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
