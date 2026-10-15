import type { CertificateNotifier } from '../application/ports'
import type { Certificate } from '../domain/types'

/**
 * The platform has no transactional e-mail provider yet. Until one is chosen,
 * issuing a certificate only logs the pending delivery; the learner still
 * sees and downloads the certificate on the certificate page.
 */
export class PendingEmailCertificateNotifier implements CertificateNotifier {
  async certificateIssued(certificate: Certificate): Promise<void> {
    console.info(
      `[training] certificate ${certificate.verificationCode} issued; e-mail delivery pending provider setup`,
    )
  }
}
