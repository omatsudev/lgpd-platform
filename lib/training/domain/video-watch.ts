import type { WatchSegment } from './types'

/**
 * Only real playback counts as watched: the player reports contiguous
 * segments and seeking starts a new one, so skipping ahead never fills the gap.
 */
export function mergeSegments(segments: readonly WatchSegment[]): WatchSegment[] {
  const sorted = segments
    .filter((segment) => segment.end > segment.start)
    .map((segment) => ({ ...segment }))
    .sort((a, b) => a.start - b.start)

  const merged: WatchSegment[] = []
  for (const segment of sorted) {
    const last = merged[merged.length - 1]
    if (last && segment.start <= last.end) {
      last.end = Math.max(last.end, segment.end)
    } else {
      merged.push(segment)
    }
  }
  return merged
}

export function clampSegment(segment: WatchSegment, durationSeconds: number): WatchSegment | null {
  if (!Number.isFinite(segment.start) || !Number.isFinite(segment.end)) return null
  const start = Math.max(0, Math.min(segment.start, durationSeconds))
  const end = Math.max(0, Math.min(segment.end, durationSeconds))
  return end > start ? { start, end } : null
}

export function watchedSeconds(segments: readonly WatchSegment[]): number {
  return mergeSegments(segments).reduce(
    (total, segment) => total + (segment.end - segment.start),
    0,
  )
}

export function watchedRatio(segments: readonly WatchSegment[], durationSeconds: number): number {
  if (durationSeconds <= 0) return 0
  return Math.min(1, watchedSeconds(segments) / durationSeconds)
}

export function hasReachedMinimumWatch(ratio: number, minWatchRatio: number): boolean {
  // Tolerance absorbs floating point noise from the player's timestamps.
  return ratio + 1e-9 >= minWatchRatio
}
