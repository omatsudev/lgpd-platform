import type { TrainingModule, TrainingTrack, TrainingVideo } from './types'

export type VideoStatus = 'locked' | 'available' | 'in_progress' | 'quiz_pending' | 'completed'
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed'
export type FinalExamStatus = 'locked' | 'available' | 'passed'

export type LearnerSnapshot = {
  /** Videos whose minimum watch ratio was reached. */
  watchedVideoIds: ReadonlySet<string>
  /** Videos with any recorded playback, even below the minimum. */
  startedVideoIds: ReadonlySet<string>
  passedQuizVideoIds: ReadonlySet<string>
  finalExamPassed: boolean
}

export type VideoState = { video: TrainingVideo; status: VideoStatus }
export type ModuleState = {
  module: TrainingModule
  status: ModuleStatus
  videos: VideoState[]
  completedVideos: number
}

export type NextStep =
  | { type: 'video'; videoId: string }
  | { type: 'quiz'; videoId: string }
  | { type: 'final_exam' }
  | { type: 'certificate' }

export type TrackProgress = {
  modules: ModuleState[]
  finalExamStatus: FinalExamStatus
  completionPercent: number
  nextStep: NextStep
}

export function publishedVideos(module: TrainingModule): TrainingVideo[] {
  return module.videos
    .filter((video) => video.status === 'published')
    .sort((a, b) => a.position - b.position)
}

function videoStatus(
  video: TrainingVideo,
  previousCompleted: boolean,
  snapshot: LearnerSnapshot,
): VideoStatus {
  if (!previousCompleted) return 'locked'
  const watched = snapshot.watchedVideoIds.has(video.id)
  if (watched && snapshot.passedQuizVideoIds.has(video.id)) return 'completed'
  if (watched) return 'quiz_pending'
  return snapshot.startedVideoIds.has(video.id) ? 'in_progress' : 'available'
}

function moduleStatus(videos: VideoState[]): ModuleStatus {
  if (videos.length === 0 || videos[0].status === 'locked') return 'locked'
  if (videos.every((state) => state.status === 'completed')) return 'completed'
  const started = videos.some((state) => state.status !== 'available' && state.status !== 'locked')
  return started ? 'in_progress' : 'available'
}

/**
 * Linear progression: each video unlocks only after the previous video was
 * watched and its quiz passed; the final exam unlocks after the last video.
 */
export function computeTrackProgress(
  track: TrainingTrack,
  snapshot: LearnerSnapshot,
): TrackProgress {
  let previousCompleted = true
  const modules = [...track.modules]
    .sort((a, b) => a.position - b.position)
    .map((module) => {
      const videos = publishedVideos(module).map((video) => {
        const status = videoStatus(video, previousCompleted, snapshot)
        previousCompleted = status === 'completed'
        return { video, status }
      })
      return {
        module,
        status: moduleStatus(videos),
        videos,
        completedVideos: videos.filter((state) => state.status === 'completed').length,
      }
    })

  const allVideos = modules.flatMap((module) => module.videos)
  const finalExamStatus: FinalExamStatus = snapshot.finalExamPassed
    ? 'passed'
    : previousCompleted
      ? 'available'
      : 'locked'

  return {
    modules,
    finalExamStatus,
    completionPercent: completionPercent(allVideos, snapshot),
    nextStep: nextStep(allVideos, finalExamStatus),
  }
}

function completionPercent(videos: VideoState[], snapshot: LearnerSnapshot): number {
  // Each video counts twice (watching + quiz) and the final exam once.
  const totalSteps = videos.length * 2 + 1
  const doneSteps =
    videos.filter(({ video }) => snapshot.watchedVideoIds.has(video.id)).length +
    videos.filter(({ video }) => snapshot.passedQuizVideoIds.has(video.id)).length +
    (snapshot.finalExamPassed ? 1 : 0)
  return Math.round((doneSteps / totalSteps) * 100)
}

function nextStep(videos: VideoState[], finalExamStatus: FinalExamStatus): NextStep {
  const pending = videos.find((state) => state.status !== 'completed')
  if (pending) {
    return pending.status === 'quiz_pending'
      ? { type: 'quiz', videoId: pending.video.id }
      : { type: 'video', videoId: pending.video.id }
  }
  return finalExamStatus === 'passed' ? { type: 'certificate' } : { type: 'final_exam' }
}

export function findVideoState(progress: TrackProgress, videoId: string): VideoState | undefined {
  return progress.modules
    .flatMap((module) => module.videos)
    .find((state) => state.video.id === videoId)
}

export function adjacentVideos(
  progress: TrackProgress,
  videoId: string,
): { previous: VideoState | null; next: VideoState | null } {
  const videos = progress.modules.flatMap((module) => module.videos)
  const index = videos.findIndex((state) => state.video.id === videoId)
  return {
    previous: index > 0 ? videos[index - 1] : null,
    next: index >= 0 && index < videos.length - 1 ? videos[index + 1] : null,
  }
}

export function isVideoContentAvailable(video: TrainingVideo): boolean {
  return video.videoUrl !== null && video.videoUrl.trim() !== ''
}
