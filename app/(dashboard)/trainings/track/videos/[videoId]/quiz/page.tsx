import { trackRoutes } from '@/components/training/routes'
import { TrackShell } from '@/components/training/track-shell'
import { VideoQuiz } from '@/components/training/video-quiz'
import { guardTrainingPage } from '@/lib/training/infrastructure/page-guards'
import { requireLearnerContext } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'

export default async function TrainingVideoQuizPage({
  params,
}: {
  params: Promise<{ videoId: string }>
}) {
  const { videoId } = await params
  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  const quiz = await guardTrainingPage(() => training.getVideoQuiz.execute(context, videoId))
  const { video } = quiz.video

  return (
    <TrackShell backHref={trackRoutes.video(video.id)} backLabel="Voltar para o vídeo">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-sky-300">Quiz do vídeo {video.position}</p>
        <h1 className="text-2xl font-bold">{video.title}</h1>
        {quiz.passed && (
          <p className="text-sm text-emerald-300">
            Você já foi aprovado neste quiz. Pode refazer para revisar.
          </p>
        )}
      </div>
      <VideoQuiz
        videoId={video.id}
        moduleId={video.moduleId}
        questions={quiz.questions}
        minimumCorrect={quiz.minimumCorrect}
      />
    </TrackShell>
  )
}
