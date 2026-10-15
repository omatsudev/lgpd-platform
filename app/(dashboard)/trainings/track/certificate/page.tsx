import { CertificateDocument } from '@/components/training/certificate-document'
import { CertificatePrintButton } from '@/components/training/certificate-print-button'
import { trackRoutes } from '@/components/training/routes'
import { TrackShell, trackSecondaryButtonClass } from '@/components/training/track-shell'
import { requireLearnerContext } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import { certificateVerificationUrl } from '@/lib/training/infrastructure/urls'
import { ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TrainingCertificatePage() {
  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  const certificate = await training.getLearnerCertificate.execute(context)
  if (!certificate) redirect(trackRoutes.dashboard)

  return (
    <TrackShell
      backHref={trackRoutes.dashboard}
      backLabel="Voltar para a trilha"
      className="print:m-0 print:min-h-0 print:bg-none print:p-0"
    >
      <div className="training-certificate-actions flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Seu certificado</h1>
        <div className="flex flex-wrap gap-2">
          <CertificatePrintButton />
          <Link
            href={certificateVerificationUrl(certificate.verificationCode)}
            className={trackSecondaryButtonClass}
            target="_blank"
          >
            <ShieldCheck className="h-4 w-4" /> Página de verificação
          </Link>
        </div>
      </div>
      <CertificateDocument
        certificate={certificate}
        verificationUrl={certificateVerificationUrl()}
      />
      <p className="training-certificate-actions text-sm text-slate-400">
        Para salvar em PDF, use &quot;Baixar PDF&quot; e escolha &quot;Salvar como PDF&quot; na
        janela de impressão. O envio automático por e-mail será ativado quando o provedor de e-mail
        da plataforma for configurado.
      </p>
    </TrackShell>
  )
}
