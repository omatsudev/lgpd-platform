import { LockedFeature } from '@/components/dashboard/locked-feature'
import { formatPercent } from '@/components/training/labels'
import { ModuleCard } from '@/components/training/module-card'
import { nextStepHref, trackRoutes } from '@/components/training/routes'
import {
  GlowDivider,
  TrackPanel,
  TrackProgressBar,
  TrackShell,
  trackButtonClass,
  trackSecondaryButtonClass,
} from '@/components/training/track-shell'
import { getUserCompany } from '@/lib/supabase/queries'
import { requireLearnerContext } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import { Award, GraduationCap, Lock, PlayCircle } from 'lucide-react'
import Link from 'next/link'

export default async function TrainingTrackPage() {
  const { company } = await getUserCompany()
  if (company?.plan === 'basico') return <LockedFeature moduleKey="trainings" reason="plan" />

  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  const { track, progress, examEligibility, bestExamScore, certificate } =
    await training.getTrackOverview.execute(context)

  const started = progress.completionPercent > 0
  const examTitle =
    progress.finalExamStatus === 'passed'
      ? 'Avaliação final concluída'
      : progress.finalExamStatus === 'available'
        ? 'Avaliação final liberada'
        : 'Avaliação final'

  return (
    <TrackShell>
      <TrackPanel className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-sky-400/40 bg-sky-400/10 p-2.5 shadow-[0_0_20px_rgba(43,179,255,0.45)]">
            <GraduationCap className="h-6 w-6 text-sky-300" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-300">
              Serra Privacy
            </p>
            <h1 className="text-2xl font-bold md:text-3xl">{track.title}</h1>
          </div>
        </div>
        <p className="max-w-2xl text-slate-300">{track.description}</p>
        <GlowDivider />
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Progresso geral</span>
            <span className="font-semibold text-sky-200">{progress.completionPercent}%</span>
          </div>
          <TrackProgressBar value={progress.completionPercent} label="Progresso geral da trilha" />
        </div>
        <Link href={nextStepHref(progress.nextStep)} className={trackButtonClass}>
          <PlayCircle className="h-4 w-4" />
          {progress.nextStep.type === 'certificate'
            ? 'Ver meu certificado'
            : started
              ? 'Continuar de onde parei'
              : 'Começar treinamento'}
        </Link>
      </TrackPanel>

      <section aria-labelledby="modules-title" className="space-y-3">
        <h2 id="modules-title" className="text-lg font-semibold">
          Módulos
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {progress.modules.map((state) => (
            <ModuleCard key={state.module.id} state={state} />
          ))}
        </div>
      </section>

      <TrackPanel className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          {progress.finalExamStatus === 'locked' ? (
            <Lock className="mt-0.5 h-5 w-5 text-slate-400" />
          ) : (
            <Award className="mt-0.5 h-5 w-5 text-sky-300" />
          )}
          <div className="space-y-1">
            <h2 className="font-semibold">{examTitle}</h2>
            <p className="text-sm text-slate-300">
              {progress.finalExamStatus === 'locked'
                ? 'Liberada após concluir os 3 módulos.'
                : `15 questões sorteadas. Aprovação com ${formatPercent(track.finalExamPassRatio)} de acertos.`}
              {bestExamScore !== null && ` Sua melhor nota: ${formatPercent(bestExamScore)}.`}
            </p>
          </div>
        </div>
        {certificate ? (
          <Link href={trackRoutes.certificate} className={trackSecondaryButtonClass}>
            Ver certificado
          </Link>
        ) : (
          progress.finalExamStatus === 'available' &&
          examEligibility.canStart && (
            <Link href={trackRoutes.exam} className={trackButtonClass}>
              Fazer avaliação final
            </Link>
          )
        )}
      </TrackPanel>
    </TrackShell>
  )
}
