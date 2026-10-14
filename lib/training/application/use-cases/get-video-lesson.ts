import { locked, notFound } from '../../domain/errors'
import {
  adjacentVideos,
  findVideoState,
  isVideoContentAvailable,
  type ModuleState,
  type VideoState,
} from '../../domain/progression'
import { loadJourney } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'

export type VideoLesson = {
  current: VideoState
  module: ModuleState
  number: number
  totalVideos: number
  previous: VideoState | null
  next: VideoState | null
  contentAvailable: boolean
  watchedRatio: number
  lastPositionSeconds: number
  canTakeQuiz: boolean
}

export class GetVideoLesson {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext, videoId: string): Promise<VideoLesson> {
    const { progress, videoProgress } = await loadJourney(this.deps, context)
    const current = findVideoState(progress, videoId)
    if (!current) throw notFound('Video')
    if (current.status === 'locked') throw locked('Video')

    const allVideos = progress.modules.flatMap((module) => module.videos)
    const moduleState = progress.modules.find((item) => item.module.id === current.video.moduleId)!
    const saved = videoProgress.get(videoId)

    return {
      current,
      module: moduleState,
      number: allVideos.indexOf(current) + 1,
      totalVideos: allVideos.length,
      ...adjacentVideos(progress, videoId),
      contentAvailable: isVideoContentAvailable(current.video),
      watchedRatio: saved?.watchedRatio ?? 0,
      lastPositionSeconds: saved?.lastPositionSeconds ?? 0,
      canTakeQuiz: current.status === 'quiz_pending' || current.status === 'completed',
    }
  }
}
