'use client'

import { submitFinalExamAction } from '@/app/actions/training'
import type { FinalExamPaper } from '@/lib/training/application/use-cases/exam-paper-view'
import type { SubmitFinalExamResult } from '@/lib/training/application/use-cases/submit-final-exam'
import type { SubmittedAnswers } from '@/lib/training/domain/types'
import { Award, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useTransition } from 'react'
import { formatPercent } from './labels'
import { QuestionCard } from './question-card'
import { trackRoutes } from './routes'
import {
  TrackPanel,
  TrackProgressBar,
  trackButtonClass,
  trackSecondaryButtonClass,
} from './track-shell'

export function FinalExam({ paper }: { paper: FinalExamPaper }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<SubmittedAnswers>({})
  const [result, setResult] = useState<SubmitFinalExamResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const updateAnswer = (questionId: string, optionIds: string[]) =>
    setAnswers({ ...answers, [questionId]: optionIds })

  const total = paper.questions.length
  const answered = paper.questions.filter((question) => answers[question.id]?.length).length
  const question = paper.questions[index]

  const submit = () =>
    startTransition(async () => {
      const response = await submitFinalExamAction(paper.attemptId, answers)
      if (!response.ok) return setError(response.error)
      setResult(response.data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

  if (result) return <ExamResult result={result} />

  return (
    <TrackPanel className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-slate-300">
          <span>
            {answered} de {total} respondidas
          </span>
          <span>Aprovação: {paper.minimumCorrect} acertos</span>
        </div>
        <TrackProgressBar
          value={Math.round((answered / total) * 100)}
          label="Questões respondidas"
        />
      </div>

      <QuestionCard
        question={question}
        number={index + 1}
        total={total}
        selected={answers[question.id] ?? []}
        onChange={(optionIds) => updateAnswer(question.id, optionIds)}
      />

      {error && <p className="text-sm text-amber-300">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIndex(index - 1)}
          disabled={index === 0}
          className={trackSecondaryButtonClass}
        >
          Anterior
        </button>
        {index < total - 1 ? (
          <button type="button" onClick={() => setIndex(index + 1)} className={trackButtonClass}>
            Próxima
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={isPending || answered < total}
            className={trackButtonClass}
            title={answered < total ? 'Responda todas as questões para enviar' : undefined}
          >
            {isPending ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        )}
      </div>

      <nav aria-label="Ir para a questão" className="flex flex-wrap gap-1.5">
        {paper.questions.map((item, itemIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(itemIndex)}
            aria-current={itemIndex === index ? 'step' : undefined}
            aria-label={`Questão ${itemIndex + 1}${answers[item.id]?.length ? ', respondida' : ''}`}
            className={
              itemIndex === index
                ? 'h-8 w-8 rounded-md bg-[#1E9BFF] text-xs font-semibold'
                : answers[item.id]?.length
                  ? 'h-8 w-8 rounded-md bg-sky-400/20 text-xs text-sky-100'
                  : 'h-8 w-8 rounded-md border border-white/15 text-xs text-slate-300'
            }
          >
            {itemIndex + 1}
          </button>
        ))}
      </nav>
    </TrackPanel>
  )
}

function ExamResult({ result }: { result: SubmitFinalExamResult }) {
  return (
    <div className="space-y-6">
      <TrackPanel className="space-y-4 text-center">
        {result.passed ? (
          <Award className="mx-auto h-12 w-12 text-sky-300" />
        ) : (
          <XCircle className="mx-auto h-12 w-12 text-rose-400" />
        )}
        <div aria-live="polite" className="space-y-1">
          <h2 className="text-2xl font-bold">
            {result.passed
              ? 'Parabéns, você foi aprovado!'
              : 'Você ainda não atingiu a nota mínima'}
          </h2>
          <p className="text-slate-300">
            Nota {formatPercent(result.scoreRatio)}: {result.correctCount} de {result.totalCount}{' '}
            acertos (mínimo {result.minimumCorrect}).
          </p>
        </div>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          {result.passed ? (
            <Link href={trackRoutes.certificate} className={trackButtonClass}>
              Ver meu certificado
            </Link>
          ) : (
            <Link href={trackRoutes.exam} className={trackButtonClass}>
              Nova tentativa
            </Link>
          )}
          <Link href={trackRoutes.dashboard} className={trackSecondaryButtonClass}>
            Voltar para a trilha
          </Link>
        </div>
      </TrackPanel>

      <section aria-labelledby="review-title" className="space-y-3">
        <h2 id="review-title" className="text-lg font-semibold">
          Gabarito comentado
        </h2>
        {result.review.map((item, index) => (
          <TrackPanel key={item.questionId} className="space-y-3">
            <div className="flex items-start gap-2">
              {item.isCorrect ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-400"
                  aria-label="Acertou"
                />
              ) : (
                <XCircle
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-rose-400"
                  aria-label="Errou"
                />
              )}
              <p className="font-semibold">
                {index + 1}. {item.prompt}
              </p>
            </div>
            <ul className="space-y-1 text-sm">
              {item.options.map((option, optionIndex) => {
                const correct = item.correctOptionIds.includes(option.id)
                const chosen = item.selectedOptionIds.includes(option.id)
                return (
                  <li
                    key={option.id}
                    className={
                      correct
                        ? 'text-emerald-300'
                        : chosen
                          ? 'text-rose-300 line-through'
                          : 'text-slate-400'
                    }
                  >
                    {String.fromCharCode(65 + optionIndex)}) {option.label}
                    {correct && ' (correta)'}
                    {chosen && !correct && ' (sua resposta)'}
                  </li>
                )
              })}
            </ul>
            <p className="text-sm text-slate-200">{item.explanation}</p>
          </TrackPanel>
        ))}
      </section>
    </div>
  )
}
