import { invalidInput, locked, notFound } from '../../domain/errors'
import { findVideoState, isVideoContentAvailable } from '../../domain/progression'
import type { WatchSegment } from '../../domain/types'
import {
  clampSegment,
  hasReachedMinimumWatch,
  mergeSegments,
  watchedRatio,
} from '../../domain/video-watch'
import { auditEvent, loadJourney } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'

export type RecordVideoWatchInput = {
  videoId: string
  segments: WatchSegment[]
  positionSeconds: number
}

export type RecordVideoWatchResult = { watchedRatio: number; completed: boolean }

export class RecordVideoWatch {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(
    context: LearnerContext,
    input: RecordVideoWatchInput,
  ): Promise<RecordVideoWatchResult> {
    const { enrollment, progress, videoProgress } = await loadJourney(this.deps, context)
    const state = findVideoState(progress, input.videoId)
    if (!state) throw notFound('Video')
    if (state.status === 'locked') throw locked('Video')
    if (!isVideoContentAvailable(state.video)) throw invalidInput('Video content is not available')

    const { video } = state
    const previous = videoProgress.get(video.id)
    const incoming = input.segments
      .map((segment) => clampSegment(segment, video.durationSeconds))
      .filter((segment): segment is WatchSegment => segment !== null)
    const segments = mergeSegments([...(previous?.watchedSegments ?? []), ...incoming])
    const ratio = watchedRatio(segments, video.durationSeconds)
    const wasCompleted = previous?.completedAt != null
    const completed = wasCompleted || hasReachedMinimumWatch(ratio, video.minWatchRatio)

    await this.deps.learners.saveVideoProgress({
      enrollmentId: enrollment.id,
      videoId: video.id,
      watchedSegments: segments,
      lastPositionSeconds: Math.max(0, Math.min(input.positionSeconds, video.durationSeconds)),
      watchedRatio: ratio,
      completedAt: previous?.completedAt ?? (completed ? this.deps.clock.now() : null),
    })

    if (!previous) {
      await this.deps.audit.log(auditEvent(context, 'training.video_started', video.title))
    }
    if (completed && !wasCompleted) {
      await this.deps.audit.log(auditEvent(context, 'training.video_completed', video.title))
    }

    return { watchedRatio: ratio, completed }
  }
}
