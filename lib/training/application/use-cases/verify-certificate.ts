import {
  isCertificateValid,
  maskLearnerName,
  normalizeVerificationCode,
} from '../../domain/certificate'
import type { TrainingDependencies } from '../ports'

export type CertificateVerification =
  | { status: 'not_found' }
  | {
      status: 'valid' | 'expired'
      verificationCode: string
      learnerName: string
      trackTitle: string
      workloadMinutes: number
      issuedAt: Date
      expiresAt: Date | null
    }

/** Public check: exposes only what proves the certificate is authentic. */
export class VerifyCertificate {
  constructor(private readonly deps: Pick<TrainingDependencies, 'learners' | 'clock'>) {}

  async execute(code: string): Promise<CertificateVerification> {
    const verificationCode = normalizeVerificationCode(code)
    if (!verificationCode) return { status: 'not_found' }

    const certificate = await this.deps.learners.findCertificateByCode(verificationCode)
    if (!certificate) return { status: 'not_found' }

    return {
      status: isCertificateValid(certificate.expiresAt, this.deps.clock.now())
        ? 'valid'
        : 'expired',
      verificationCode: certificate.verificationCode,
      learnerName: maskLearnerName(certificate.learnerName),
      trackTitle: certificate.trackTitle,
      workloadMinutes: certificate.workloadMinutes,
      issuedAt: certificate.issuedAt,
      expiresAt: certificate.expiresAt,
    }
  }
}
