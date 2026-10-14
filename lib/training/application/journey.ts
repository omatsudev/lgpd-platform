import { notFound } from '../domain/errors'
import { computeTrackProgress, type TrackProgress } from '../domain/progression'
import type {
  Enrollment,
  ExamAttempt,
  QuizAttempt,
  TrainingTrack,
  VideoProgress,
} from '../domain/types'
import type { LearnerContext } from './learner-context'
import type { TrainingDependencies } from './ports'

export type Journey = {
  track: TrainingTrack
  enrollment: Enrollment
  videoProgress: Map<string, VideoProgress>
  quizAttempts: QuizAttempt[]
  examAttempts: ExamAttempt[]
  progress: TrackProgress
}

export const AUDIT_RESOURCE = 'training'

export async function loadTrack(deps: TrainingDependencies): Promise<TrainingTrack> {
  const track = await deps.content.getTrackBySlug(deps.trackSlug)
  if (!track) throw notFound('Training track')
  return track
}

async function ensureEnrollment(
  deps: TrainingDependencies,
  track: TrainingTrack,
  context: LearnerContext,
): Promise<Enrollment> {
  const existing = await deps.learners.findEnrollment(track.id, context.companyId, context.userId)
  if (existing) return existing

  const enrollment = await deps.learners.createEnrollment({
    trackId: track.id,
    companyId: context.companyId,
    userId: context.userId,
    learnerName: context.name,
    learnerEmail: context.email,
    startedAt: deps.clock.now(),
  })
  await deps.audit.log({
    userId: context.userId,
    userEmail: context.email,
    companyId: context.companyId,
    action: 'training.enrolled',
    resource: AUDIT_RESOURCE,
    details: track.title,
  })
  return enrollment
}

/** Loads everything needed to evaluate the learner's position in the track. */
export async function loadJourney(
  deps: TrainingDependencies,
  context: LearnerContext,
): Promise<Journey> {
  const track = await loadTrack(deps)
  const enrollment = await ensureEnrollment(deps, track, context)
  const [progressList, quizAttempts, examAttempts] = await Promise.all([
    deps.learners.listVideoProgress(enrollment.id),
    deps.learners.listQuizAttempts(enrollment.id),
    deps.learners.listExamAttempts(enrollment.id),
  ])

  const videoProgress = new Map(progressList.map((progress) => [progress.videoId, progress]))
  const progress = computeTrackProgress(track, {
    watchedVideoIds: new Set(
      progressList.filter((item) => item.completedAt !== null).map((item) => item.videoId),
    ),
    startedVideoIds: new Set(
      progressList
        .filter((item) => item.watchedRatio > 0 || item.lastPositionSeconds > 0)
        .map((item) => item.videoId),
    ),
    passedQuizVideoIds: new Set(
      quizAttempts.filter((attempt) => attempt.passed).map((attempt) => attempt.videoId),
    ),
    finalExamPassed: examAttempts.some((attempt) => attempt.passed === true),
  })

  return { track, enrollment, videoProgress, quizAttempts, examAttempts, progress }
}

export function auditEvent(context: LearnerContext, action: string, details?: string) {
  return {
    userId: context.userId,
    userEmail: context.email,
    companyId: context.companyId,
    action,
    resource: AUDIT_RESOURCE,
    details,
  }
}
