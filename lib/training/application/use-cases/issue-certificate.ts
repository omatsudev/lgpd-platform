import { certificateExpiry, generateVerificationCode } from '../../domain/certificate'
import type { Certificate } from '../../domain/types'
import { auditEvent, type Journey } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'

/** Issues the certificate once per enrollment and notifies the learner. */
export class IssueCertificate {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext, journey: Journey): Promise<Certificate> {
    const existing = await this.deps.learners.findCertificateByEnrollment(journey.enrollment.id)
    if (existing) return existing

    const issuedAt = this.deps.clock.now()
    const certificate = await this.deps.learners.createCertificate({
      enrollmentId: journey.enrollment.id,
      verificationCode: generateVerificationCode(this.deps.random),
      learnerName: journey.enrollment.learnerName,
      companyName: context.companyName,
      trackTitle: journey.track.title,
      workloadMinutes: journey.track.workloadMinutes,
      issuedAt,
      expiresAt: certificateExpiry(issuedAt, journey.track.certificateValidityMonths),
    })
    await this.deps.learners.markEnrollmentCompleted(journey.enrollment.id, issuedAt)
    await this.deps.audit.log(
      auditEvent(context, 'training.certificate_issued', certificate.verificationCode),
    )
    await this.deps.notifier.certificateIssued(certificate, journey.enrollment.learnerEmail)
    return certificate
  }
}
