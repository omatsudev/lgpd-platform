import { formatWorkload } from '@/lib/training/domain/certificate'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import { CheckCircle2, SearchX, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Verificar certificado | Serra Privacy',
  description: 'Confira a autenticidade de um certificado do Treinamento LGPD da Serra Privacy.',
  robots: { index: false },
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

export default async function VerifyCertificatePage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>
}) {
  const { code } = await searchParams
  const training = code ? await createTrainingModule() : null
  const verification = code && training ? await training.verifyCertificate.execute(code) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061433] to-[#030B1F] px-4 py-10 text-white">
      <main className="mx-auto max-w-xl space-y-6">
        <Link href="/" className="inline-flex items-center gap-3">
          <Image
            src="/logo-serra-privacy.png"
            alt="Serra Privacy"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="font-bold">Serra Privacy</span>
        </Link>
        <h1 className="text-2xl font-bold">Verificar certificado</h1>

        <form className="flex flex-col gap-2 sm:flex-row" action="/certificates/verify">
          <label htmlFor="code" className="sr-only">
            Código de verificação
          </label>
          <input
            id="code"
            name="code"
            defaultValue={code ?? ''}
            placeholder="SP-XXXX-XXXX-XXXX"
            autoComplete="off"
            className="flex-1 rounded-lg border border-sky-400/40 bg-white/5 px-3 py-2.5 font-mono uppercase text-white placeholder:text-slate-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
          />
          <button
            type="submit"
            className="rounded-lg bg-[#1E9BFF] px-4 py-2.5 text-sm font-semibold hover:bg-[#2BB3FF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
          >
            Verificar
          </button>
        </form>

        {verification?.status === 'not_found' && (
          <div className="flex gap-3 rounded-xl border border-rose-400/40 bg-rose-400/10 p-4">
            <SearchX className="h-5 w-5 flex-shrink-0 text-rose-300" />
            <p>Nenhum certificado encontrado com este código.</p>
          </div>
        )}

        {verification && verification.status !== 'not_found' && (
          <div
            className={
              verification.status === 'valid'
                ? 'space-y-3 rounded-xl border border-emerald-400/40 bg-emerald-400/10 p-5'
                : 'space-y-3 rounded-xl border border-amber-400/40 bg-amber-400/10 p-5'
            }
          >
            <div className="flex items-center gap-2 font-semibold">
              {verification.status === 'valid' ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-300" />
              )}
              {verification.status === 'valid' ? 'Certificado válido' : 'Certificado expirado'}
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              <dt className="text-slate-300">Titular</dt>
              <dd>{verification.learnerName}</dd>
              <dt className="text-slate-300">Trilha</dt>
              <dd>{verification.trackTitle}</dd>
              <dt className="text-slate-300">Carga horária</dt>
              <dd>{formatWorkload(verification.workloadMinutes)}</dd>
              <dt className="text-slate-300">Emitido em</dt>
              <dd>{formatDate(verification.issuedAt)}</dd>
              {verification.expiresAt && (
                <>
                  <dt className="text-slate-300">Validade</dt>
                  <dd>{formatDate(verification.expiresAt)}</dd>
                </>
              )}
              <dt className="text-slate-300">Código</dt>
              <dd className="font-mono">{verification.verificationCode}</dd>
            </dl>
            <p className="text-xs text-slate-400">
              Por privacidade, exibimos apenas o primeiro nome e as iniciais do titular.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
