import { bestScore, examEligibility, type ExamEligibility } from '../../domain/exam'
import type { TrackProgress } from '../../domain/progression'
import type { Certificate, TrainingTrack } from '../../domain/types'
import { loadJourney } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'

export type TrackOverview = {
  track: TrainingTrack
  progress: TrackProgress
  examEligibility: ExamEligibility
  bestExamScore: number | null
  certificate: Certificate | null
}

export class GetTrackOverview {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext): Promise<TrackOverview> {
    const journey = await loadJourney(this.deps, context)
    const submitted = journey.examAttempts.filter((attempt) => attempt.submittedAt !== null)
    return {
      track: journey.track,
      progress: journey.progress,
      examEligibility: examEligibility(submitted, journey.track.finalExamMaxAttempts),
      bestExamScore: bestScore(submitted),
      certificate: await this.deps.learners.findCertificateByEnrollment(journey.enrollment.id),
    }
  }
}
