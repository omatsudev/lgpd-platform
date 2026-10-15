import type { ModuleState } from '@/lib/training/domain/progression'
import { cn } from '@/lib/utils'
import { CheckCircle2, Lock } from 'lucide-react'
import Link from 'next/link'
import { formatDuration, MODULE_STATUS_LABELS } from './labels'
import { trackRoutes } from './routes'
import { TrackProgressBar } from './track-shell'

export function ModuleCard({ state }: { state: ModuleState }) {
  const { module, status, videos, completedVideos } = state
  const isLocked = status === 'locked'
  const duration = videos.reduce((sum, item) => sum + item.video.durationSeconds, 0)
  const percent = videos.length === 0 ? 0 : Math.round((completedVideos / videos.length) * 100)

  const content = (
    <div
      className={cn(
        'flex h-full flex-col gap-4 rounded-2xl border p-5 transition-colors',
        isLocked
          ? 'border-white/10 bg-white/[0.02] opacity-60'
          : 'border-sky-400/30 bg-white/[0.04] hover:border-sky-300/70 hover:bg-white/[0.07]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-widest text-sky-300">
          Módulo {module.position}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            status === 'completed' && 'bg-emerald-400/15 text-emerald-300',
            status === 'in_progress' && 'bg-sky-400/15 text-sky-200',
            status === 'available' && 'bg-sky-400/15 text-sky-200',
            isLocked && 'bg-white/10 text-slate-300',
          )}
        >
          {isLocked && <Lock className="h-3 w-3" />}
          {status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
          {MODULE_STATUS_LABELS[status]}
        </span>
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold leading-snug">{module.title}</h3>
        <p className="text-sm text-slate-300">{module.objective}</p>
      </div>
      <div className="mt-auto space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>
            {completedVideos} de {videos.length} vídeos · {formatDuration(duration)}
          </span>
          <span>{percent}%</span>
        </div>
        <TrackProgressBar value={percent} label={`Progresso do módulo ${module.position}`} />
      </div>
    </div>
  )

  if (isLocked) return <div aria-disabled="true">{content}</div>
  return (
    <Link
      href={trackRoutes.module(module.id)}
      className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
    >
      {content}
    </Link>
  )
}
