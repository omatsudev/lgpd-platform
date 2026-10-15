import { QuestionForm } from '@/components/training-admin/question-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  getAdminTrack,
  getQuestion,
} from '@/lib/training/infrastructure/supabase/training-content-admin'
import { isTrainingContentAdmin } from '@/lib/training/infrastructure/session'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function QuestionAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ videoId?: string; moduleId?: string }>
}) {
  const { companyId, role } = await getUserCompany()
  if (!isTrainingContentAdmin(companyId, role)) notFound()

  const { id } = await params
  const isNew = id === 'new'
  const { videoId, moduleId } = await searchParams

  if (isNew) {
    if (!videoId && !moduleId) notFound()
    const track = await getAdminTrack()
    if (!track) notFound()

    const kind = videoId ? 'video_quiz' : 'final_exam'
    const backHref = videoId
      ? `/trainings/admin/videos/${videoId}`
      : `/trainings/admin/modules/${moduleId}`

    return (
      <div className="space-y-6 max-w-3xl">
        <Header backHref={backHref} isNew />
        <Card>
          <CardContent className="pt-6">
            <QuestionForm
              question={{
                trackId: track.id,
                kind,
                videoId: videoId ?? null,
                moduleId: moduleId ?? null,
                type: 'single_choice',
                difficulty: kind === 'final_exam' ? 'medium' : null,
                prompt: '',
                explanation: '',
                options: [
                  { label: '', feedback: '', correct: false },
                  { label: '', feedback: '', correct: false },
                  { label: '', feedback: '', correct: false },
                  { label: '', feedback: '', correct: false },
                ],
              }}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = await getQuestion(id)
  if (!question) notFound()

  const backHref =
    question.kind === 'video_quiz'
      ? `/trainings/admin/videos/${question.video_id}`
      : `/trainings/admin/modules/${question.module_id}`

  return (
    <div className="space-y-6 max-w-3xl">
      <Header backHref={backHref} isNew={false} />
      <Card>
        <CardContent className="pt-6">
          <QuestionForm
            question={{
              id: question.id,
              trackId: question.track_id,
              kind: question.kind,
              videoId: question.video_id,
              moduleId: question.module_id,
              type: question.type,
              difficulty: question.difficulty,
              prompt: question.prompt,
              explanation: question.explanation,
              options: question.options.map((o) => ({
                id: o.id,
                label: o.label,
                feedback: o.feedback ?? '',
                correct: question.correctOptionIds.includes(o.id),
              })),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function Header({ backHref, isNew }: { backHref: string; isNew: boolean }) {
  return (
    <div className="flex items-center gap-4">
      <Link href={backHref}>
        <Button variant="ghost" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <div>
        <h1 className="text-xl font-bold text-gray-900">
          {isNew ? 'Nova pergunta' : 'Editar pergunta'}
        </h1>
      </div>
    </div>
  )
}
