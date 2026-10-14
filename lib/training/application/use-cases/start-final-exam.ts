import { TrainingError, locked } from '../../domain/errors'
import { drawExamPaper, examBlueprint, examEligibility } from '../../domain/exam'
import type { ExamAttempt } from '../../domain/types'
import { auditEvent, loadJourney, type Journey } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'
import { toFinalExamPaper, type FinalExamPaper } from './exam-paper-view'

export type { FinalExamPaper } from './exam-paper-view'

export class StartFinalExam {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext): Promise<FinalExamPaper> {
    const journey = await loadJourney(this.deps, context)
    if (journey.progress.finalExamStatus !== 'available') throw locked('Final exam')

    const submitted = journey.examAttempts.filter((attempt) => attempt.submittedAt !== null)
    const eligibility = examEligibility(submitted, journey.track.finalExamMaxAttempts)
    if (!eligibility.canStart) {
      throw new TrainingError('ATTEMPTS_EXHAUSTED', `Final exam unavailable: ${eligibility.reason}`)
    }

    // Starting again resumes the open attempt instead of drawing a new paper.
    const attempt =
      journey.examAttempts.find((item) => item.submittedAt === null) ??
      (await this.createAttempt(context, journey))

    return toFinalExamPaper(this.deps, journey.track, attempt, eligibility)
  }

  private async createAttempt(context: LearnerContext, journey: Journey): Promise<ExamAttempt> {
    const bank = await this.deps.content.listFinalExamBank(journey.track.id)
    const paper = drawExamPaper(bank, examBlueprint(journey.track), this.deps.random)
    const attempt = await this.deps.learners.createExamAttempt({
      enrollmentId: journey.enrollment.id,
      paper,
      startedAt: this.deps.clock.now(),
    })
    await this.deps.audit.log(auditEvent(context, 'training.final_exam_started'))
    return attempt
  }
}
