import { invalidInput } from '../../domain/errors'
import { isAnswerCorrect } from '../../domain/grading'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'
import { loadAccessibleQuiz } from './video-quiz-access'

export type CheckVideoQuizAnswerInput = {
  videoId: string
  questionId: string
  optionIds: string[]
}

export type AnswerFeedback = {
  isCorrect: boolean
  correctOptionIds: string[]
  explanation: string
  optionFeedback: string | null
}

/** Immediate feedback after each answer of a video quiz. Nothing is persisted. */
export class CheckVideoQuizAnswer {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(
    context: LearnerContext,
    input: CheckVideoQuizAnswerInput,
  ): Promise<AnswerFeedback> {
    await loadAccessibleQuiz(this.deps, context, input.videoId)
    const questions = await this.deps.content.listVideoQuizQuestions(input.videoId)
    const question = questions.find((item) => item.id === input.questionId)
    if (!question) throw invalidInput('Question does not belong to this quiz')

    const key = await this.deps.content.getAnswerKey([question.id])
    const correctOptionIds = key.get(question.id) ?? []
    const selected = question.options.find((option) => option.id === input.optionIds[0])

    return {
      isCorrect: isAnswerCorrect(input.optionIds, correctOptionIds),
      correctOptionIds,
      explanation: question.explanation,
      optionFeedback: input.optionIds.length === 1 ? (selected?.feedback ?? null) : null,
    }
  }
}
