import { examBlueprint, examEligibility, type ExamEligibility } from '../../domain/exam'
import { minimumCorrectAnswers } from '../../domain/grading'
import type { FinalExamStatus } from '../../domain/progression'
import { loadJourney } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'
import { toFinalExamPaper, type FinalExamPaper } from './exam-paper-view'

export type FinalExamOverview = {
  status: FinalExamStatus
  eligibility: ExamEligibility
  questionCount: number
  minimumCorrect: number
  passRatio: number
  submittedAttempts: number
  openPaper: FinalExamPaper | null
}

/** Read-only view of the final exam; starting an attempt is a separate command. */
export class GetFinalExam {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext): Promise<FinalExamOverview> {
    const { track, progress, examAttempts } = await loadJourney(this.deps, context)
    const submitted = examAttempts.filter((attempt) => attempt.submittedAt !== null)
    const eligibility = examEligibility(submitted, track.finalExamMaxAttempts)
    const questionCount = examBlueprint(track).reduce((sum, entry) => sum + entry.questionCount, 0)
    const open = examAttempts.find((attempt) => attempt.submittedAt === null)

    return {
      status: progress.finalExamStatus,
      eligibility,
      questionCount,
      minimumCorrect: minimumCorrectAnswers(questionCount, track.finalExamPassRatio),
      passRatio: track.finalExamPassRatio,
      submittedAttempts: submitted.length,
      openPaper:
        open && eligibility.canStart && progress.finalExamStatus === 'available'
          ? await toFinalExamPaper(this.deps, track, open, eligibility)
          : null,
    }
  }
}
