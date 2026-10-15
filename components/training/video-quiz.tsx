'use client'

import { checkVideoQuizAnswerAction, submitVideoQuizAction } from '@/app/actions/training'
import type { AnswerFeedback } from '@/lib/training/application/use-cases/check-video-quiz-answer'
import type { SubmitVideoQuizResult } from '@/lib/training/application/use-cases/submit-video-quiz'
import type { QuestionView } from '@/lib/training/application/views'
import type { SubmittedAnswers } from '@/lib/training/domain/types'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { QuestionCard } from './question-card'
import { trackRoutes } from './routes'
import { TrackPanel, trackButtonClass, trackSecondaryButtonClass } from './track-shell'

export function VideoQuiz({
  videoId,
  moduleId,
  questions,
  minimumCorrect,
}: {
  videoId: string
  moduleId: string
  questions: QuestionView[]
  minimumCorrect: number
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<SubmittedAnswers>({})
  const [feedback, setFeedback] = useState<AnswerFeedback | null>(null)
  const [result, setResult] = useState<SubmitVideoQuizResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const question = questions[index]
  const selected = answers[question?.id] ?? []
  const isLast = index === questions.length - 1

  const confirm = () =>
    startTransition(async () => {
      const response = await checkVideoQuizAnswerAction(videoId, question.id, selected)
      if (response.ok) setFeedback(response.data)
      setError(response.ok ? null : response.error)
    })

  const advance = () => {
    if (!isLast) {
      setFeedback(null)
      setIndex(index + 1)
      return
    }
    startTransition(async () => {
      const response = await submitVideoQuizAction(videoId, answers)
      if (response.ok) setResult(response.data)
      setError(response.ok ? null : response.error)
    })
  }

  const restart = () => {
    setIndex(0)
    setAnswers({})
    setFeedback(null)
    setResult(null)
  }

  if (result) {
    return (
      <TrackPanel className="space-y-5 text-center">
        {result.passed ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-rose-400" />
        )}
        <div className="space-y-1" aria-live="polite">
          <h2 className="text-xl font-bold">{result.passed ? 'Quiz aprovado!' : 'Quase lá!'}</h2>
          <p className="text-slate-300">
            Você acertou {result.correctCount} de {result.totalCount}.{' '}
            {result.passed
              ? 'O próximo conteúdo foi liberado.'
              : `São necessários ${result.minimumCorrect} acertos. Revise o vídeo e tente de novo.`}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {result.passed ? (
            <>
              {result.moduleCompleted || result.finalExamUnlocked ? (
                <Link href={trackRoutes.module(moduleId)} className={trackButtonClass}>
                  Concluir módulo
                </Link>
              ) : (
                result.nextVideoId && (
                  <Link href={trackRoutes.video(result.nextVideoId)} className={trackButtonClass}>
                    Próximo vídeo
                  </Link>
                )
              )}
              <Link href={trackRoutes.dashboard} className={trackSecondaryButtonClass}>
                Voltar para a trilha
              </Link>
            </>
          ) : (
            <>
              <button type="button" onClick={restart} className={trackButtonClass}>
                <RotateCcw className="h-4 w-4" /> Refazer quiz
              </button>
              <Link href={trackRoutes.video(videoId)} className={trackSecondaryButtonClass}>
                Rever o vídeo
              </Link>
            </>
          )}
        </div>
      </TrackPanel>
    )
  }

  return (
    <TrackPanel className="space-y-5">
      <QuestionCard
        question={question}
        number={index + 1}
        total={questions.length}
        selected={selected}
        onChange={(optionIds) => setAnswers({ ...answers, [question.id]: optionIds })}
        reveal={feedback ? { correctOptionIds: feedback.correctOptionIds } : undefined}
      />

      {feedback && (
        <div
          aria-live="polite"
          className={
            feedback.isCorrect
              ? 'rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-4 text-sm'
              : 'rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-sm'
          }
        >
          <p className="font-semibold">
            {feedback.isCorrect ? 'Resposta correta!' : 'Resposta incorreta.'}
          </p>
          <p className="mt-1 text-slate-200">{feedback.optionFeedback ?? feedback.explanation}</p>
        </div>
      )}

      {error && <p className="text-sm text-amber-300">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400">
          Aprovação: {minimumCorrect} de {questions.length} acertos
        </span>
        {feedback ? (
          <button type="button" onClick={advance} disabled={isPending} className={trackButtonClass}>
            {isLast ? 'Ver resultado' : 'Próxima pergunta'}
          </button>
        ) : (
          <button
            type="button"
            onClick={confirm}
            disabled={isPending || selected.length === 0}
            className={trackButtonClass}
          >
            Confirmar resposta
          </button>
        )}
      </div>
    </TrackPanel>
  )
}
