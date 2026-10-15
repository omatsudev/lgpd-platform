import { formatDuration, VIDEO_STATUS_LABELS } from '@/components/training/labels'
import { nextStepHref, trackRoutes } from '@/components/training/routes'
import { VideoStatusIcon } from '@/components/training/status-icon'
import { trackButtonClass, TrackPanel, TrackShell } from '@/components/training/track-shell'
import { requireLearnerContext } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import { cn } from '@/lib/utils'
import { PartyPopper } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

export default async function TrainingModulePage({
  params,
}: {
  params: Promise<{ moduleId: string }>
}) {
  const { moduleId } = await params
  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  const { progress } = await training.getTrackOverview.execute(context)

  const index = progress.modules.findIndex((item) => item.module.id === moduleId)
  if (index < 0) notFound()
  const state = progress.modules[index]
  if (state.status === 'locked') redirect(trackRoutes.dashboard)
  const nextModule = progress.modules[index + 1]

  return (
    <TrackShell backHref={trackRoutes.dashboard} backLabel="Voltar para a trilha">
      {state.status === 'completed' && (
        <TrackPanel className="flex flex-col gap-4 border-emerald-400/30 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <PartyPopper className="mt-0.5 h-6 w-6 text-emerald-300" />
            <div>
              <h2 className="font-semibold">Parabéns! Você concluiu este módulo.</h2>
              <p className="text-sm text-slate-300">
                {state.videos.length} vídeos assistidos e {state.videos.length} quizzes aprovados.
              </p>
            </div>
          </div>
          {nextModule ? (
            <Link href={trackRoutes.module(nextModule.module.id)} className={trackButtonClass}>
              Ir para o Módulo {nextModule.module.position}
            </Link>
          ) : (
            <Link href={nextStepHref(progress.nextStep)} className={trackButtonClass}>
              {progress.finalExamStatus === 'passed' ? 'Ver certificado' : 'Fazer avaliação final'}
            </Link>
          )}
        </TrackPanel>
      )}

      <TrackPanel className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-300">
          Módulo {state.module.position}
        </p>
        <h1 className="text-2xl font-bold">{state.module.title}</h1>
        <p className="text-slate-300">
          <span className="font-semibold text-white">Objetivo: </span>
          {state.module.objective}
        </p>
      </TrackPanel>

      <ol className="space-y-2">
        {state.videos.map(({ video, status }) => {
          const isLocked = status === 'locked'
          const row = (
            <div
              className={cn(
                'flex items-center gap-4 rounded-xl border px-4 py-3',
                isLocked
                  ? 'border-white/10 bg-white/[0.02] opacity-60'
                  : 'border-sky-400/20 bg-white/[0.04] hover:border-sky-300/60',
              )}
            >
              <VideoStatusIcon status={status} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">Vídeo {video.position}</p>
                <p className="font-medium">{video.title}</p>
              </div>
              <div className="text-right text-xs text-slate-400">
                <p>{formatDuration(video.durationSeconds)}</p>
                <p>{VIDEO_STATUS_LABELS[status]}</p>
              </div>
            </div>
          )
          return (
            <li key={video.id}>
              {isLocked ? (
                row
              ) : (
                <Link
                  href={
                    status === 'quiz_pending'
                      ? trackRoutes.quiz(video.id)
                      : trackRoutes.video(video.id)
                  }
                  className="block rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
                >
                  {row}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </TrackShell>
  )
}
