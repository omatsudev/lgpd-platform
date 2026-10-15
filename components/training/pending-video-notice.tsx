import { acknowledgePendingVideoAction } from '@/app/actions/training'
import { CheckCircle2, Clapperboard } from 'lucide-react'
import Link from 'next/link'
import { trackButtonClass } from './track-shell'

/** Placeholder shown while the recorded video is not available yet. */
export function PendingVideoNotice({
  videoId,
  keyMessage,
  alreadyCompleted,
  quizHref,
}: {
  videoId: string
  keyMessage: string
  alreadyCompleted: boolean
  quizHref: string
}) {
  return (
    <div className="space-y-4">
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-sky-400/40 bg-[#061433] p-6 text-center">
        <Clapperboard className="h-10 w-10 text-sky-300" />
        <div className="space-y-2">
          <p className="text-lg font-semibold">Vídeo em produção</p>
          <p className="mx-auto max-w-lg text-sm text-slate-300">
            Este vídeo ainda não foi publicado. Enquanto isso, leia a mensagem principal abaixo e
            confirme a leitura para seguir para o quiz.
          </p>
        </div>
        <blockquote className="max-w-xl text-base font-medium text-sky-100">
          “{keyMessage}”
        </blockquote>
      </div>
      <div className="flex justify-end">
        {alreadyCompleted ? (
          <Link href={quizHref} className={trackButtonClass}>
            Fazer quiz
          </Link>
        ) : (
          <form action={acknowledgePendingVideoAction}>
            <input type="hidden" name="video_id" value={videoId} />
            <button type="submit" className={trackButtonClass}>
              <CheckCircle2 className="h-4 w-4" /> Li a mensagem principal, ir para o quiz
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
