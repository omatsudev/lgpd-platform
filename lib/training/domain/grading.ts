import type { AnswerKey, SubmittedAnswers } from './types'

export type GradedQuestion = {
  questionId: string
  selectedOptionIds: string[]
  correctOptionIds: string[]
  isCorrect: boolean
}

export type GradeResult = {
  questions: GradedQuestion[]
  correctCount: number
  totalCount: number
  scoreRatio: number
}

export function isAnswerCorrect(selected: readonly string[], correct: readonly string[]): boolean {
  if (selected.length !== correct.length || correct.length === 0) return false
  const expected = new Set(correct)
  return new Set(selected).size === selected.length && selected.every((id) => expected.has(id))
}

export function gradeAnswers(
  questionIds: readonly string[],
  answerKey: AnswerKey,
  answers: SubmittedAnswers,
): GradeResult {
  const questions = questionIds.map((questionId) => {
    const correctOptionIds = answerKey.get(questionId) ?? []
    const selectedOptionIds = answers[questionId] ?? []
    return {
      questionId,
      selectedOptionIds,
      correctOptionIds,
      isCorrect: isAnswerCorrect(selectedOptionIds, correctOptionIds),
    }
  })
  const correctCount = questions.filter((question) => question.isCorrect).length
  const totalCount = questions.length
  return {
    questions,
    correctCount,
    totalCount,
    scoreRatio: totalCount === 0 ? 0 : correctCount / totalCount,
  }
}

/** Minimum number of correct answers to pass, e.g. 3 of 4 at 75% or 11 of 15 at 70%. */
export function minimumCorrectAnswers(totalCount: number, passRatio: number): number {
  return Math.ceil(totalCount * passRatio - 1e-9)
}

export function hasPassed(correctCount: number, totalCount: number, passRatio: number): boolean {
  return totalCount > 0 && correctCount >= minimumCorrectAnswers(totalCount, passRatio)
}
