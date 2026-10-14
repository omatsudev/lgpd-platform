import { TrainingError } from './errors'
import { sample, shuffle, type RandomSource } from './random'
import type { ExamAttempt, ExamPaperQuestion, Question, TrainingTrack } from './types'

export type ExamBlueprintEntry = { moduleId: string; questionCount: number }

export function examBlueprint(track: TrainingTrack): ExamBlueprintEntry[] {
  return track.modules
    .filter((module) => module.finalExamQuestionCount > 0)
    .map((module) => ({ moduleId: module.id, questionCount: module.finalExamQuestionCount }))
}

/**
 * Draws a new paper for each attempt: a fixed number of questions per module,
 * with question and option order shuffled. The answer key is stored by option
 * id, so shuffling never changes which option is correct.
 */
export function drawExamPaper(
  bank: readonly Question[],
  blueprint: readonly ExamBlueprintEntry[],
  random: RandomSource,
): ExamPaperQuestion[] {
  const drawn = blueprint.flatMap(({ moduleId, questionCount }) => {
    const candidates = bank.filter(
      (question) => question.kind === 'final_exam' && question.moduleId === moduleId,
    )
    if (candidates.length < questionCount) {
      throw new TrainingError(
        'INSUFFICIENT_QUESTION_BANK',
        `Module ${moduleId} needs ${questionCount} questions but the bank has ${candidates.length}`,
      )
    }
    return sample(candidates, questionCount, random)
  })

  return shuffle(drawn, random).map((question) => ({
    questionId: question.id,
    optionIds: shuffle(
      question.options.map((option) => option.id),
      random,
    ),
  }))
}

export type ExamEligibility =
  | { canStart: true; remainingAttempts: number | null }
  | { canStart: false; reason: 'already_passed' | 'attempts_exhausted' }

export function examEligibility(
  submittedAttempts: readonly ExamAttempt[],
  maxAttempts: number | null,
): ExamEligibility {
  if (submittedAttempts.some((attempt) => attempt.passed)) {
    return { canStart: false, reason: 'already_passed' }
  }
  if (maxAttempts === null) return { canStart: true, remainingAttempts: null }
  const remainingAttempts = maxAttempts - submittedAttempts.length
  return remainingAttempts > 0
    ? { canStart: true, remainingAttempts }
    : { canStart: false, reason: 'attempts_exhausted' }
}

export function bestScore(attempts: readonly ExamAttempt[]): number | null {
  const scores = attempts
    .map((attempt) => attempt.scoreRatio)
    .filter((score): score is number => score !== null)
  return scores.length === 0 ? null : Math.max(...scores)
}
