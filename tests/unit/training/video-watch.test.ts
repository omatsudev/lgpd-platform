import {
  clampSegment,
  hasReachedMinimumWatch,
  mergeSegments,
  watchedRatio,
  watchedSeconds,
} from '@/lib/training/domain/video-watch'
import { describe, expect, it } from 'vitest'

describe('mergeSegments', () => {
  it('merges overlapping and touching segments and sorts them', () => {
    expect(
      mergeSegments([
        { start: 30, end: 40 },
        { start: 0, end: 10 },
        { start: 5, end: 20 },
        { start: 20, end: 25 },
      ]),
    ).toEqual([
      { start: 0, end: 25 },
      { start: 30, end: 40 },
    ])
  })

  it('drops empty or inverted segments', () => {
    expect(
      mergeSegments([
        { start: 10, end: 10 },
        { start: 20, end: 5 },
      ]),
    ).toEqual([])
  })
})

describe('watched time', () => {
  it('counts rewatched parts only once', () => {
    expect(
      watchedSeconds([
        { start: 0, end: 30 },
        { start: 10, end: 40 },
      ]),
    ).toBe(40)
  })

  it('does not count a seek: jumping to the end leaves a gap', () => {
    const segments = [
      { start: 0, end: 5 },
      { start: 85, end: 90 },
    ]
    expect(watchedRatio(segments, 90)).toBeCloseTo(10 / 90)
    expect(hasReachedMinimumWatch(watchedRatio(segments, 90), 0.9)).toBe(false)
  })

  it('reaches the minimum at exactly 90% watched', () => {
    expect(hasReachedMinimumWatch(watchedRatio([{ start: 0, end: 81 }], 90), 0.9)).toBe(true)
    expect(hasReachedMinimumWatch(watchedRatio([{ start: 0, end: 80.9 }], 90), 0.9)).toBe(false)
  })

  it('never exceeds 100% and handles zero duration', () => {
    expect(watchedRatio([{ start: 0, end: 500 }], 90)).toBe(1)
    expect(watchedRatio([{ start: 0, end: 10 }], 0)).toBe(0)
  })
})

describe('clampSegment', () => {
  it('keeps segments inside the video duration', () => {
    expect(clampSegment({ start: -5, end: 200 }, 90)).toEqual({ start: 0, end: 90 })
  })

  it('rejects invalid segments', () => {
    expect(clampSegment({ start: Number.NaN, end: 10 }, 90)).toBeNull()
    expect(clampSegment({ start: 95, end: 120 }, 90)).toBeNull()
  })
})
