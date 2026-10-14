import type { VideoStatus } from '@/lib/training/domain/progression'
import { cn } from '@/lib/utils'
import { CheckCircle2, CircleDot, HelpCircle, Lock, PlayCircle } from 'lucide-react'
import { VIDEO_STATUS_LABELS } from './labels'

const ICONS = {
  locked: Lock,
  available: PlayCircle,
  in_progress: CircleDot,
  quiz_pending: HelpCircle,
  completed: CheckCircle2,
} satisfies Record<VideoStatus, unknown>

const COLORS: Record<VideoStatus, string> = {
  locked: 'text-slate-500',
  available: 'text-sky-400',
  in_progress: 'text-sky-300',
  quiz_pending: 'text-amber-300',
  completed: 'text-emerald-400',
}

export function VideoStatusIcon({
  status,
  className,
}: {
  status: VideoStatus
  className?: string
}) {
  const Icon = ICONS[status]
  return (
    <Icon
      className={cn('h-5 w-5 flex-shrink-0', COLORS[status], className)}
      aria-label={VIDEO_STATUS_LABELS[status]}
    />
  )
}
