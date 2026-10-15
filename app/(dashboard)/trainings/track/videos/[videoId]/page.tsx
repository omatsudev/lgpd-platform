import { LessonTabs } from '@/components/training/lesson-tabs'
import { PendingVideoNotice } from '@/components/training/pending-video-notice'
import { trackRoutes } from '@/components/training/routes'
import {
  TrackPanel,
  TrackShell,
  trackSecondaryButtonClass,
} from '@/components/training/track-shell'
import { VideoPlayer } from '@/components/training/video-player'
import { guardTrainingPage } from '@/lib/training/infrastructure/page-guards'
import { requireLearnerContext } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function TrainingVideoPage({
  params,
}: {
  params: Promise<{ videoId: string }>
}) {
  const { videoId } = await params
  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  const lesson = await guardTrainingPage(() => training.getVideoLesson.execute(context, videoId))
  const { video, status } = lesson.current
  const watched = status === 'quiz_pending' || status === 'completed'

  return (
    <TrackShell
      backHref={trackRoutes.module(lesson.module.module.id)}
      backLabel={`Módulo ${lesson.module.module.position}: ${lesson.module.module.title}`}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-sky-300">
          Vídeo {lesson.number} de {lesson.totalVideos}
        </p>
        <h1 className="text-2xl font-bold md:text-3xl">{video.title}</h1>
      </div>

      {lesson.contentAvailable ? (
        <VideoPlayer
          videoId={video.id}
          src={video.videoUrl!}
          captionsUrl={video.captionsUrl}
          title={video.title}
          startAtSeconds={lesson.lastPositionSeconds}
          initialWatchedRatio={lesson.watchedRatio}
          initiallyCompleted={watched}
          minWatchRatio={video.minWatchRatio}
          quizHref={trackRoutes.quiz(video.id)}
        />
      ) : (
        <PendingVideoNotice
          videoId={video.id}
          keyMessage={video.keyMessage}
          alreadyCompleted={watched}
          quizHref={trackRoutes.quiz(video.id)}
        />
      )}

      <TrackPanel>
        <LessonTabs
          tabs={[
            {
              key: 'message',
              label: 'Mensagem principal',
              content: <p className="text-lg font-medium text-sky-100">{video.keyMessage}</p>,
            },
            {
              key: 'transcript',
              label: 'Transcrição',
              content: video.transcript ? (
                <div className="whitespace-pre-line text-sm leading-relaxed text-slate-200">
                  {video.transcript}
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  A transcrição será publicada junto com o vídeo.
                </p>
              ),
            },
          ]}
        />
      </TrackPanel>

      <nav aria-label="Navegação entre vídeos" className="flex justify-between gap-3">
        {lesson.previous ? (
          <Link
            href={trackRoutes.video(lesson.previous.video.id)}
            className={trackSecondaryButtonClass}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Link>
        ) : (
          <span />
        )}
        {lesson.next && lesson.next.status !== 'locked' ? (
          <Link
            href={trackRoutes.video(lesson.next.video.id)}
            className={trackSecondaryButtonClass}
          >
            Próximo <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={trackSecondaryButtonClass}
            title="Aprovação no quiz libera o próximo vídeo"
          >
            Próximo <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </nav>
    </TrackShell>
  )
}
