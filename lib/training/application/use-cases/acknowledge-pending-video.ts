import { invalidInput, locked, notFound } from '../../domain/errors'
import { findVideoState, isVideoContentAvailable } from '../../domain/progression'
import { auditEvent, loadJourney } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'

/**
 * While a video is not recorded yet, the lesson shows its key message and
 * transcript instead, and the learner confirms the reading to move on. Once a
 * video URL is registered, watch tracking takes over and this is rejected.
 */
export class AcknowledgePendingVideo {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext, videoId: string): Promise<void> {
    const { enrollment, progress, videoProgress } = await loadJourney(this.deps, context)
    const state = findVideoState(progress, videoId)
    if (!state) throw notFound('Video')
    if (state.status === 'locked') throw locked('Video')
    if (isVideoContentAvailable(state.video)) {
      throw invalidInput('Video content is available and must be watched')
    }
    if (videoProgress.get(videoId)?.completedAt) return

    const { durationSeconds } = state.video
    await this.deps.learners.saveVideoProgress({
      enrollmentId: enrollment.id,
      videoId,
      watchedSegments: [{ start: 0, end: durationSeconds }],
      lastPositionSeconds: durationSeconds,
      watchedRatio: 1,
      completedAt: this.deps.clock.now(),
    })
    await this.deps.audit.log(
      auditEvent(context, 'training.video_completed', `${state.video.title} (conteúdo provisório)`),
    )
  }
}
