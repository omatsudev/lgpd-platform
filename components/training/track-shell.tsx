import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

/**
 * Dark visual identity of the training track ("Conheça o Serra Privacy"):
 * very dark navy background with electric blue/cyan accents.
 */
export function TrackShell({
  children,
  backHref,
  backLabel,
  className,
}: {
  children: React.ReactNode
  backHref?: string
  backLabel?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        '-m-4 md:-m-6 min-h-[calc(100vh-4rem)] bg-[#030B1F] bg-gradient-to-b from-[#061433] to-[#030B1F] p-4 md:p-8 text-white',
        className,
      )}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {backHref && (
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-sm text-sky-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-400 rounded"
          >
            <ArrowLeft className="h-4 w-4" /> {backLabel ?? 'Voltar'}
          </Link>
        )}
        {children}
      </div>
    </div>
  )
}

export function TrackPanel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sky-400/20 bg-white/[0.04] p-5 md:p-6 shadow-[0_0_40px_-20px_rgba(43,179,255,0.6)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function GlowDivider() {
  return (
    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#2BB3FF] to-transparent" />
  )
}

export function TrackProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-white/10"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#1E9BFF] to-[#2BB3FF] shadow-[0_0_12px_rgba(43,179,255,0.8)] transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

export const trackButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#1E9BFF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2BB3FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-40'

export const trackSecondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-sky-400/40 px-4 py-2.5 text-sm font-semibold text-sky-200 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-40'
