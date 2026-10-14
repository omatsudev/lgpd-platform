import type { ExamEligibility } from '../../domain/exam'
import { minimumCorrectAnswers } from '../../domain/grading'
import type { ExamAttempt, TrainingTrack } from '../../domain/types'
import type { TrainingDependencies } from '../ports'
import { toQuestionView, type QuestionView } from '../views'

export type FinalExamPaper = {
  attemptId: string
  questions: QuestionView[]
  minimumCorrect: number
  passRatio: number
  remainingAttempts: number | null
}

/** The open attempt as shown to the learner: drawn questions, options in drawn order, no key. */
export async function toFinalExamPaper(
  deps: TrainingDependencies,
  track: TrainingTrack,
  attempt: ExamAttempt,
  eligibility: Extract<ExamEligibility, { canStart: true }>,
): Promise<FinalExamPaper> {
  const questions = await deps.content.getQuestionsByIds(
    attempt.paper.map((item) => item.questionId),
  )
  const questionsById = new Map(questions.map((question) => [question.id, question]))
  return {
    attemptId: attempt.id,
    questions: attempt.paper.map((item) =>
      toQuestionView(questionsById.get(item.questionId)!, item.optionIds),
    ),
    minimumCorrect: minimumCorrectAnswers(attempt.totalCount, track.finalExamPassRatio),
    passRatio: track.finalExamPassRatio,
    remainingAttempts: eligibility.remainingAttempts,
  }
}
