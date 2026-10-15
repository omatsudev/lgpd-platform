'use client'

import { recordVideoWatchAction } from '@/app/actions/training'
import type { WatchSegment } from '@/lib/training/domain/types'
import { HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { TrackProgressBar, trackButtonClass } from './track-shell'

const FLUSH_INTERVAL_MS = 15_000
// A jump bigger than this between two timeupdate events is a seek, not playback.
const MAX_PLAYBACK_STEP_SECONDS = 1.5

type Props = {
  videoId: string
  src: string
  captionsUrl: string | null
  title: string
  startAtSeconds: number
  initialWatchedRatio: number
  initiallyCompleted: boolean
  minWatchRatio: number
  quizHref: string
}

/**
 * Records only real playback: each contiguous stretch becomes a segment and
 * seeking closes it, so skipping ahead does not count as watched. Progress is
 * sent periodically and on pause/end, and the resume point is saved with it.
 */
export function VideoPlayer(props: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const segmentStart = useRef<number | null>(null)
  const lastTime = useRef(0)
  const pending = useRef<WatchSegment[]>([])
  const [watchedRatio, setWatchedRatio] = useState(props.initialWatchedRatio)
  const [completed, setCompleted] = useState(props.initiallyCompleted)
  const [error, setError] = useState<string | null>(null)

  const closeSegment = useCallback(() => {
    if (segmentStart.current !== null && lastTime.current > segmentStart.current) {
      pending.current.push({ start: segmentStart.current, end: lastTime.current })
    }
    segmentStart.current = null
  }, [])

  const flush = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    const isPlaying = segmentStart.current !== null
    closeSegment()
    if (isPlaying) segmentStart.current = video.currentTime
    const segments = pending.current.splice(0)
    if (segments.length === 0) return

    const result = await recordVideoWatchAction(props.videoId, segments, video.currentTime)
    if (result.ok) {
      setWatchedRatio(result.data.watchedRatio)
      if (result.data.completed) setCompleted(true)
      setError(null)
    } else {
      pending.current.unshift(...segments)
      setError(result.error)
    }
  }, [closeSegment, props.videoId])

  useEffect(() => {
    const interval = setInterval(() => void flush(), FLUSH_INTERVAL_MS)
    const onHide = () => {
      if (document.visibilityState === 'hidden') void flush()
    }
    document.addEventListener('visibilitychange', onHide)
    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [flush])

  const handleLoadedMetadata = () => {
    const video = videoRef.current
    if (video && props.startAtSeconds > 0 && props.startAtSeconds < video.duration - 2) {
      video.currentTime = props.startAtSeconds
    }
    lastTime.current = video?.currentTime ?? 0
  }

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video || segmentStart.current === null) return
    if (Math.abs(video.currentTime - lastTime.current) > MAX_PLAYBACK_STEP_SECONDS) {
      closeSegment()
      segmentStart.current = video.currentTime
    }
    lastTime.current = video.currentTime
  }

  const handlePlaying = () => {
    const video = videoRef.current
    if (!video) return
    lastTime.current = video.currentTime
    segmentStart.current = video.currentTime
  }

  const handleSeeking = () => closeSegment()

  const handleSeeked = () => {
    const video = videoRef.current
    if (!video) return
    lastTime.current = video.currentTime
    if (!video.paused) segmentStart.current = video.currentTime
  }

  const handleStop = () => void flush().then(() => (segmentStart.current = null))

  const percent = Math.round(watchedRatio * 100)
  const required = Math.round(props.minWatchRatio * 100)

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-sky-400/30 bg-black shadow-[0_0_40px_-15px_rgba(43,179,255,0.7)]">
        <video
          ref={videoRef}
          className="aspect-video w-full"
          controls
          controlsList="nodownload"
          preload="metadata"
          onContextMenu={(event) => event.preventDefault()}
          onLoadedMetadata={handleLoadedMetadata}
          onPlaying={handlePlaying}
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onSeeked={handleSeeked}
          onPause={handleStop}
          onEnded={handleStop}
          aria-label={props.title}
        >
          <source src={props.src} />
          {props.captionsUrl && (
            <track
              kind="captions"
              src={props.captionsUrl}
              srcLang="pt-BR"
              label="Português"
              default
            />
          )}
        </video>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-300">
            <span>
              Assistido: {percent}% {completed ? '· concluído' : `(mínimo ${required}%)`}
            </span>
          </div>
          <TrackProgressBar value={percent} label="Percentual do vídeo assistido" />
          {error && <p className="text-xs text-amber-300">{error}</p>}
        </div>
        {completed ? (
          <Link href={props.quizHref} className={trackButtonClass}>
            <HelpCircle className="h-4 w-4" /> Fazer quiz
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className={trackButtonClass}
            title={`Assista a pelo menos ${required}% do vídeo`}
          >
            <HelpCircle className="h-4 w-4" /> Fazer quiz
          </button>
        )}
      </div>
    </div>
  )
}
