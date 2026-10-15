'use client'

import type { QuestionView } from '@/lib/training/application/views'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle } from 'lucide-react'

type Reveal = { correctOptionIds: string[] }

/** One question with its options; after `reveal`, marks right and wrong choices. */
export function QuestionCard({
  question,
  number,
  total,
  selected,
  onChange,
  reveal,
}: {
  question: QuestionView
  number: number
  total: number
  selected: string[]
  onChange: (optionIds: string[]) => void
  reveal?: Reveal
}) {
  const multiple = question.type === 'multiple_choice'
  const toggle = (optionId: string) => {
    if (reveal) return
    if (!multiple) return onChange([optionId])
    onChange(
      selected.includes(optionId)
        ? selected.filter((id) => id !== optionId)
        : [...selected, optionId],
    )
  }

  return (
    <fieldset className="space-y-4">
      <legend className="space-y-1">
        <span className="block text-sm font-semibold text-sky-300">
          Pergunta {number} de {total}
        </span>
        <span className="block text-lg font-semibold text-white">{question.prompt}</span>
        {multiple && (
          <span className="block text-xs text-slate-400">
            Marque todas as alternativas corretas.
          </span>
        )}
      </legend>
      <div className="space-y-2">
        {question.options.map((option, index) => {
          const isSelected = selected.includes(option.id)
          const isCorrect = reveal?.correctOptionIds.includes(option.id)
          return (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-sky-300',
                !reveal && isSelected && 'border-[#2BB3FF] bg-sky-400/10',
                !reveal && !isSelected && 'border-white/15 hover:border-sky-300/60',
                reveal && isCorrect && 'border-emerald-400/70 bg-emerald-400/10',
                reveal && !isCorrect && isSelected && 'border-rose-400/70 bg-rose-400/10',
                reveal && !isCorrect && !isSelected && 'border-white/10 opacity-60',
                reveal && 'cursor-default',
              )}
            >
              <input
                type={multiple ? 'checkbox' : 'radio'}
                name={question.id}
                value={option.id}
                checked={isSelected}
                disabled={Boolean(reveal)}
                onChange={() => toggle(option.id)}
                className="mt-0.5 accent-[#1E9BFF]"
              />
              <span className="font-semibold text-sky-300">{String.fromCharCode(65 + index)})</span>
              <span className="flex-1 text-slate-100">{option.label}</span>
              {reveal && isCorrect && (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-label="Correta" />
              )}
              {reveal && !isCorrect && isSelected && (
                <XCircle className="h-5 w-5 text-rose-400" aria-label="Sua resposta" />
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
