import { deleteVideo, setQuestionActive } from '@/app/actions/training-admin'
import { ConfirmSubmitForm } from '@/components/training-admin/confirm-submit-form'
import { VideoForm } from '@/components/training-admin/video-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  getVideo,
  listVideoQuestions,
} from '@/lib/training/infrastructure/supabase/training-content-admin'
import { isTrainingContentAdmin } from '@/lib/training/infrastructure/session'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function VideoAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ moduleId?: string }>
}) {
  const { companyId, role } = await getUserCompany()
  if (!isTrainingContentAdmin(companyId, role)) notFound()

  const { id } = await params
  const isNew = id === 'new'
  const { moduleId } = await searchParams

  if (isNew) {
    if (!moduleId) notFound()
    return (
      <div className="space-y-6 max-w-3xl">
        <Header isNew moduleId={moduleId} />
        <Card>
          <CardContent className="pt-6">
            <VideoForm
              video={{
                moduleId,
                title: '',
                key_message: '',
                duration_seconds: 300,
                video_url: '',
                captions_url: '',
                transcript: '',
                status: 'draft',
                min_watch_ratio: 0.9,
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const video = await getVideo(id)
  if (!video) notFound()

  const questions = await listVideoQuestions(id)

  return (
    <div className="space-y-6 max-w-3xl">
      <Header isNew={false} moduleId={video.module_id} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do vídeo</CardTitle>
        </CardHeader>
        <CardContent>
          <VideoForm
            video={{
              id: video.id,
              moduleId: video.module_id,
              title: video.title,
              key_message: video.key_message,
              duration_seconds: video.duration_seconds,
              video_url: video.video_url ?? '',
              captions_url: video.captions_url ?? '',
              transcript: video.transcript ?? '',
              status: video.status,
              min_watch_ratio: video.min_watch_ratio,
            }}
          />
        </CardContent>
        <CardContent className="pt-0">
          <ConfirmSubmitForm
            action={deleteVideo}
            confirmMessage={`Excluir o vídeo "${video.title}" apaga também suas perguntas de quiz. Confirmar?`}
          >
            <input type="hidden" name="id" value={video.id} />
            <input type="hidden" name="moduleId" value={video.module_id} />
            <Button variant="outline" size="sm" type="submit" className="text-red-600">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir vídeo
            </Button>
          </ConfirmSubmitForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Perguntas do quiz ({questions.length})</CardTitle>
          <Link href={`/trainings/admin/questions/new?videoId=${video.id}`}>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Nova pergunta
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions.length === 0 && (
            <p className="text-sm text-gray-400 py-4 text-center">Nenhuma pergunta cadastrada</p>
          )}
          {questions.map((q) => (
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
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <form action={setQuestionActive}>
                  <input type="hidden" name="id" value={q.id} />
                  <input type="hidden" name="active" value={(!q.active).toString()} />
                  <input
                    type="hidden"
                    name="parentPath"
                    value={`/trainings/admin/videos/${video.id}`}
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

function Header({ isNew, moduleId }: { isNew: boolean; moduleId: string }) {
  return (
    <div className="flex items-center gap-4">
      <Link href={`/trainings/admin/modules/${moduleId}`}>
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {isNew ? 'Novo vídeo' : 'Editar vídeo'}
        </h1>
      </div>
    </div>
  )
}
