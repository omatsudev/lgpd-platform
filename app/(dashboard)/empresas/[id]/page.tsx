import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

export default function EmpresaFormPage({ params }: { params: { id: string } }) {
  const isNew = params.id === 'novo'
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/empresas">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isNew ? 'Nova Empresa' : 'Tech Solutions Ltda'}</h1>
          <p className="text-sm text-gray-500">{isNew ? 'Cadastrar empresa para gerenciar' : 'Gerenciar adequação LGPD'}</p>
        </div>
      </div>

      {!isNew && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-800">Adequação LGPD</span>
              <span className="text-xl font-bold text-blue-600">75%</span>
            </div>
            <Progress value={75} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5" /> Dados da Empresa</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Razão Social</Label>
              <Input defaultValue={isNew ? '' : 'Tech Solutions Ltda'} placeholder="Nome da empresa" />
            </div>
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <Input defaultValue={isNew ? '' : '12.345.678/0001-90'} placeholder="00.000.000/0001-00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Setor</Label>
              <Input defaultValue={isNew ? '' : 'Tecnologia'} placeholder="Ex: Saúde, Varejo..." />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL pública)</Label>
              <Input defaultValue={isNew ? '' : 'tech-solutions'} placeholder="nome-da-empresa" />
            </div>
          </div>
          <Button>{isNew ? 'Criar Empresa' : 'Salvar Alterações'}</Button>
        </CardContent>
      </Card>

      {!isNew && (
        <Card>
          <CardHeader><CardTitle>Acesso Rápido aos Módulos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Inventário de Dados', href: '/inventario' },
                { label: 'Treinamentos', href: '/treinamentos' },
                { label: 'Canal de Denúncias', href: '/denuncias' },
                { label: 'Direitos dos Titulares', href: '/titulares' },
              ].map((m) => (
                <Link key={m.href} href={m.href}>
                  <Button variant="outline" className="w-full justify-start">{m.label}</Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
