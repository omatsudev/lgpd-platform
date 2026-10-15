import { deleteModule, moveVideo, setQuestionActive } from '@/app/actions/training-admin'
import { ConfirmSubmitForm } from '@/components/training-admin/confirm-submit-form'
import { ModuleForm } from '@/components/training-admin/module-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getModule,
  listModuleExamBank,
  listVideos,
} from '@/lib/training/infrastructure/supabase/training-content-admin'
import { isTrainingContentAdmin } from '@/lib/training/infrastructure/session'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowDown, ArrowLeft, ArrowUp, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ModuleAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ trackId?: string }>
}) {
  const { companyId, role } = await getUserCompany()
  if (!isTrainingContentAdmin(companyId, role)) notFound()

  const { id } = await params
  const isNew = id === 'new'
  const { trackId } = await searchParams

  if (isNew) {
    if (!trackId) notFound()
    return (
      <div className="space-y-6 max-w-3xl">
        <Header isNew />
        <Card>
          <CardContent className="pt-6">
            <ModuleForm
              module={{ trackId, title: '', objective: '', final_exam_question_count: 0 }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const module_ = await getModule(id)
  if (!module_) notFound()

  const [videos, examBank] = await Promise.all([listVideos(id), listModuleExamBank(id)])

  return (
    <div className="space-y-6 max-w-3xl">
      <Header isNew={false} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleForm
            module={{
              id: module_.id,
              trackId: module_.track_id,
              title: module_.title,
              objective: module_.objective,
              final_exam_question_count: module_.final_exam_question_count,
            }}
          />
        </CardContent>
        <CardContent className="pt-0">
          <ConfirmSubmitForm
            action={deleteModule}
            confirmMessage={`Excluir o módulo "${module_.title}" apaga também todos os seus vídeos e perguntas. Confirmar?`}
          >
            <input type="hidden" name="id" value={module_.id} />
            <Button variant="outline" size="sm" type="submit" className="text-red-600">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir módulo
            </Button>
          </ConfirmSubmitForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Vídeos ({videos.length})</CardTitle>
          <Link href={`/trainings/admin/videos/new?moduleId=${module_.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo vídeo
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {videos.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhum vídeo cadastrado</p>
          )}
          {videos.map((v, index) => (
            <div
              key={v.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900 text-sm">
                    {v.position}. {v.title}
                  </p>
                  <Badge variant={v.status === 'published' ? 'success' : 'secondary'}>
                    {v.status === 'published' ? 'Publicado' : 'Rascunho'}
                  </Badge>
                  {!v.video_url && (
                    <Badge variant="warning" className="text-xs">
                      Sem URL de vídeo
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <form action={moveVideo}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="moduleId" value={module_.id} />
                  <input type="hidden" name="direction" value="up" />
                  <Button variant="ghost" size="sm" disabled={index === 0} type="submit">
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <form action={moveVideo}>
                  <input type="hidden" name="id" value={v.id} />
                  <input type="hidden" name="moduleId" value={module_.id} />
                  <input type="hidden" name="direction" value="down" />
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={index === videos.length - 1}
                    type="submit"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </form>
                <Link href={`/trainings/admin/videos/${v.id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Banco de questões da avaliação final ({examBank.length})
          </CardTitle>
          <Link href={`/trainings/admin/questions/new?moduleId=${module_.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nova questão
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {examBank.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhuma questão cadastrada</p>
          )}
          {examBank.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-900 text-sm truncate max-w-md">
                    {q.prompt}
                  </p>
                  {!q.active && <Badge variant="secondary">Inativa</Badge>}
                  {q.difficulty && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {q.difficulty}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <form action={setQuestionActive}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="active" value={(!q.active).toString()} />
                  <input
                    type="hidden"
                    name="parentPath"
                    value={`/trainings/admin/modules/${module_.id}`}
                  />
                  <Button variant="ghost" size="sm" type="submit">
                    {q.active ? 'Desativar' : 'Reativar'}
                  </Button>
                </form>
                <Link href={`/trainings/admin/questions/${q.id}`}>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function Header({ isNew }: { isNew: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <Link href="/trainings/admin">
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {isNew ? 'Novo módulo' : 'Editar módulo'}
        </h1>
      </div>
    </div>
  )
}
