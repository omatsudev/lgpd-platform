import { addCollaborator, saveTraining } from '@/app/actions/trainings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowLeft, Download, Send } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const statusMap: Record<string, 'success' | 'warning' | 'secondary'> = {
  completed: 'success',
  in_progress: 'warning',
  not_started: 'secondary',
}
const statusLabel: Record<string, string> = {
  completed: 'Concluído',
  in_progress: 'Em andamento',
  not_started: 'Não iniciado',
}

export default async function TreinamentoFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'
  const { companyId, supabase } = await getUserCompany()

  let treinamento: any = null
  let employees: any[] = []

  if (!isNew) {
    const { data: t } = await supabase.from('trainings').select('*').eq('id', id).single()
    if (!t) notFound()
    treinamento = t

    const { data: colabs } = await supabase
      .from('training_employees')
      .select('*')
      .eq('training_id', id)
      .order('created_at', { ascending: false })
    employees = colabs ?? []
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/trainings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Novo Treinamento' : treinamento?.title}
          </h1>
          <p className="text-sm text-gray-500">Gerencie conteúdo e acompanhe employees</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo do Treinamento</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={saveTraining} className="space-y-4">
              <input type="hidden" name="id" value={isNew ? '' : id} />
              <input type="hidden" name="company_id" value={companyId ?? ''} />
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  name="title"
                  defaultValue={treinamento?.title ?? ''}
                  placeholder="Nome do treinamento"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  name="description"
                  rows={2}
                  defaultValue={treinamento?.description ?? ''}
                  placeholder="Descrição do treinamento"
                />
              </div>
              <div className="space-y-2">
                <Label>Vídeo (URL YouTube/Vimeo)</Label>
                <Input
                  name="video_url"
                  defaultValue={treinamento?.video_url ?? ''}
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Material PDF (URL)</Label>
                <Input
                  name="pdf_url"
                  defaultValue={treinamento?.pdf_url ?? ''}
                  placeholder="https://..."
                />
              </div>
              <Button type="submit" className="w-full">
                Salvar Treinamento
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Adicionar Colaborador */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Colaborador</CardTitle>
          </CardHeader>
          <CardContent>
            {isNew ? (
              <p className="text-sm text-gray-500">
                Salve o treinamento primeiro para adicionar employees.
              </p>
            ) : (
              <form action={addCollaborator} className="space-y-4">
                <input type="hidden" name="training_id" value={id} />
                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input name="name" placeholder="Nome do colaborador" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input name="email" type="email" placeholder="colaborador@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input name="whatsapp" placeholder="11999990000" />
                </div>
                <Button type="submit" className="w-full">
                  Adicionar Colaborador
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progresso dos employees */}
      {!isNew && employees.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Progresso dos Colaboradores ({employees.length})</CardTitle>
              <Button variant="outline" size="sm" disabled>
                <Download className="h-4 w-4 mr-1" /> Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employees.map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate block">
                          {c.employee_name}
                        </span>
                        {c.employee_whatsapp && (
                          <span className="text-xs text-gray-400">{c.employee_whatsapp}</span>
                        )}
                      </div>
                      <Badge variant={statusMap[c.status] ?? 'secondary'}>
                        {statusLabel[c.status] ?? c.status}
                      </Badge>
                    </div>
                    <Progress value={c.progress ?? 0} className="h-1.5" />
                  </div>
                  <Button variant="ghost" size="sm" disabled title="WhatsApp não configurado">
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isNew && employees.length === 0 && (
        <Card>
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-gray-500 text-sm">Nenhum colaborador adicionado ainda</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
