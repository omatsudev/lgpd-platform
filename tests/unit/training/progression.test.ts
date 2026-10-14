import {
  adjacentVideos,
  computeTrackProgress,
  findVideoState,
  type LearnerSnapshot,
} from '@/lib/training/domain/progression'
import { describe, expect, it } from 'vitest'
import { buildLgpdTrackFixture } from '../../support/training/lgpd-track-fixture'

const { track } = buildLgpdTrackFixture()
const videoIds = (count: number) => Array.from({ length: count }, (_, i) => `video-${i + 1}`)

const snapshot = (overrides: Partial<LearnerSnapshot> = {}): LearnerSnapshot => ({
  watchedVideoIds: new Set(),
  startedVideoIds: new Set(),
  passedQuizVideoIds: new Set(),
  finalExamPassed: false,
  ...overrides,
})

describe('computeTrackProgress', () => {
  it('starts with only the first video available', () => {
    const progress = computeTrackProgress(track, snapshot())
    const statuses = progress.modules.flatMap((m) => m.videos.map((v) => v.status))
    expect(statuses[0]).toBe('available')
    expect(statuses.slice(1).every((status) => status === 'locked')).toBe(true)
    expect(progress.modules.map((m) => m.status)).toEqual(['available', 'locked', 'locked'])
    expect(progress.finalExamStatus).toBe('locked')
    expect(progress.completionPercent).toBe(0)
    expect(progress.nextStep).toEqual({ type: 'video', videoId: 'video-1' })
  })

  it('asks for the quiz after watching, before unlocking the next video', () => {
    const progress = computeTrackProgress(
      track,
      snapshot({ watchedVideoIds: new Set(['video-1']), startedVideoIds: new Set(['video-1']) }),
    )
    expect(findVideoState(progress, 'video-1')!.status).toBe('quiz_pending')
    expect(findVideoState(progress, 'video-2')!.status).toBe('locked')
    expect(progress.nextStep).toEqual({ type: 'quiz', videoId: 'video-1' })
  })

  it('unlocks the next module after the last video of the module', () => {
    const done = new Set(videoIds(4))
    const progress = computeTrackProgress(
      track,
      snapshot({ watchedVideoIds: done, startedVideoIds: done, passedQuizVideoIds: done }),
    )
    expect(progress.modules.map((m) => m.status)).toEqual(['completed', 'available', 'locked'])
    expect(progress.modules[0].completedVideos).toBe(4)
    expect(progress.nextStep).toEqual({ type: 'video', videoId: 'video-5' })
  })

  it('a passed quiz without the watched video does not unlock anything', () => {
    const progress = computeTrackProgress(
      track,
      snapshot({ passedQuizVideoIds: new Set(['video-1']) }),
    )
    expect(findVideoState(progress, 'video-2')!.status).toBe('locked')
  })

  it('unlocks the final exam after all 12 videos and finishes with the certificate', () => {
    const done = new Set(videoIds(12))
    const all = { watchedVideoIds: done, startedVideoIds: done, passedQuizVideoIds: done }
    const beforeExam = computeTrackProgress(track, snapshot(all))
    expect(beforeExam.finalExamStatus).toBe('available')
    expect(beforeExam.nextStep).toEqual({ type: 'final_exam' })
    expect(beforeExam.completionPercent).toBe(96)

    const afterExam = computeTrackProgress(track, snapshot({ ...all, finalExamPassed: true }))
    expect(afterExam.finalExamStatus).toBe('passed')
    expect(afterExam.completionPercent).toBe(100)
    expect(afterExam.nextStep).toEqual({ type: 'certificate' })
  })

  it('ignores draft videos', () => {
    const withDraft = buildLgpdTrackFixture().track
    withDraft.modules[0].videos[1].status = 'draft'
    const progress = computeTrackProgress(withDraft, snapshot())
    expect(progress.modules[0].videos.map((v) => v.video.id)).toEqual([
      'video-1',
      'video-3',
      'video-4',
    ])
  })
})

describe('adjacentVideos', () => {
  it('crosses module boundaries', () => {
    const progress = computeTrackProgress(track, snapshot())
    const { previous, next } = adjacentVideos(progress, 'video-4')
    expect(previous?.video.id).toBe('video-3')
    expect(next?.video.id).toBe('video-5')
    expect(adjacentVideos(progress, 'video-12').next).toBeNull()
  })
})
