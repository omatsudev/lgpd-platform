import type { Question, QuestionType } from '../domain/types'

/** A question as shown to the learner: no answer key, options in the given order. */
export type QuestionView = {
  id: string
  type: QuestionType
  prompt: string
  options: { id: string; label: string }[]
}

export function toQuestionView(question: Question, optionOrder?: readonly string[]): QuestionView {
  const optionsById = new Map(question.options.map((option) => [option.id, option]))
  const orderedIds =
    optionOrder ??
    [...question.options].sort((a, b) => a.position - b.position).map((option) => option.id)
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    options: orderedIds.flatMap((id) => {
      const option = optionsById.get(id)
      return option ? [{ id: option.id, label: option.label }] : []
    }),
  }
}
