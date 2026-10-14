import { formatWorkload } from '@/lib/training/domain/certificate'
import type { Certificate } from '@/lib/training/domain/types'
import Image from 'next/image'
import { formatDate } from './labels'

/** Printable certificate (A4 landscape) with the data required by the spec. */
export function CertificateDocument({
  certificate,
  verificationUrl,
}: {
  certificate: Certificate
  verificationUrl: string
}) {
  return (
    <article className="training-certificate mx-auto aspect-[297/210] w-full max-w-4xl overflow-hidden rounded-2xl border border-sky-400/40 bg-[#030B1F] bg-gradient-to-br from-[#061433] to-[#030B1F] p-[4%] text-white shadow-[0_0_60px_-20px_rgba(43,179,255,0.8)] print:max-w-none print:rounded-none print:border-0 print:shadow-none [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      <div className="flex h-full flex-col justify-between rounded-xl border border-sky-400/30 p-[4%]">
        <header className="flex items-center justify-between">
          <Image
            src="/logo-serra-privacy.png"
            alt="Serra Privacy"
            width={64}
            height={64}
            className="object-contain"
          />
          <span className="text-[clamp(9px,1.4vw,13px)] font-semibold uppercase tracking-[0.3em] text-sky-300">
            Certificado de conclusão
          </span>
        </header>

        <div className="space-y-[2%] text-center">
          <p className="text-[clamp(10px,1.6vw,15px)] text-slate-300">Certificamos que</p>
          <p className="text-[clamp(18px,3.6vw,36px)] font-bold">{certificate.learnerName}</p>
          <p className="text-[clamp(10px,1.6vw,15px)] text-slate-300">
            colaborador(a) de{' '}
            <span className="font-semibold text-white">{certificate.companyName}</span>, concluiu a
            trilha
          </p>
          <p className="text-[clamp(14px,2.6vw,26px)] font-bold text-[#2BB3FF]">
            {certificate.trackTitle}
          </p>
          <p className="text-[clamp(10px,1.6vw,15px)] text-slate-300">
            com carga horária de {formatWorkload(certificate.workloadMinutes)}, concluída em{' '}
            {formatDate(certificate.issuedAt)}.
          </p>
          <div className="mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-[#2BB3FF] to-transparent" />
          <p className="text-[clamp(10px,1.5vw,14px)] italic text-sky-100">
            Serra Privacy: proteger dados é respeitar pessoas.
          </p>
        </div>

        <footer className="flex flex-col gap-1 text-[clamp(8px,1.2vw,11px)] text-slate-400 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p>
              Código de verificação:{' '}
              <span className="font-mono font-semibold text-white">
                {certificate.verificationCode}
              </span>
            </p>
            <p>Verifique em {verificationUrl}</p>
          </div>
          {certificate.expiresAt && <p>Válido até {formatDate(certificate.expiresAt)}</p>}
        </footer>
      </div>
    </article>
  )
}
