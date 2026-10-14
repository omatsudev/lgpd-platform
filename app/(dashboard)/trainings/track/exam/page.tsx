import { startFinalExamAction } from '@/app/actions/training'
import { FinalExam } from '@/components/training/final-exam'
import { formatPercent } from '@/components/training/labels'
import { trackRoutes } from '@/components/training/routes'
import { TrackPanel, TrackShell, trackButtonClass } from '@/components/training/track-shell'
import { requireLearnerContext } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TrainingFinalExamPage() {
  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  const exam = await training.getFinalExam.execute(context)

  if (exam.status === 'locked') redirect(trackRoutes.dashboard)
  if (exam.status === 'passed') redirect(trackRoutes.certificate)

  return (
    <TrackShell backHref={trackRoutes.dashboard} backLabel="Voltar para a trilha">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-sky-300">Avaliação final</p>
        <h1 className="text-2xl font-bold md:text-3xl">Treinamento LGPD</h1>
      </div>

      {exam.openPaper ? (
        <FinalExam paper={exam.openPaper} />
      ) : exam.eligibility.canStart ? (
        <TrackPanel className="space-y-4">
          <ul className="list-disc space-y-1.5 pl-5 text-slate-200">
            <li>{exam.questionCount} questões sorteadas do banco, de todos os módulos.</li>
            <li>
              Aprovação com {exam.minimumCorrect} acertos ({formatPercent(exam.passRatio)}).
            </li>
            <li>O gabarito e as explicações aparecem só ao final.</li>
            <li>
              {exam.eligibility.remainingAttempts === null
                ? 'Tentativas ilimitadas; cada nova tentativa sorteia outras questões.'
                : `Tentativas restantes: ${exam.eligibility.remainingAttempts}. Cada tentativa sorteia outras questões.`}
            </li>
            <li>Aprovado, seu certificado é gerado na hora.</li>
          </ul>
          <form action={startFinalExamAction}>
            <button type="submit" className={trackButtonClass}>
              {exam.submittedAttempts > 0 ? 'Iniciar nova tentativa' : 'Iniciar avaliação'}
            </button>
          </form>
        </TrackPanel>
      ) : (
        <TrackPanel className="space-y-3">
          <p className="text-slate-200">
            Você usou todas as tentativas disponíveis da avaliação final. Fale com o gestor da sua
            empresa para liberar uma nova tentativa.
          </p>
          <Link href={trackRoutes.dashboard} className={trackButtonClass}>
            Voltar para a trilha
          </Link>
        </TrackPanel>
      )}
    </TrackShell>
  )
}
