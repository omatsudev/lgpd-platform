import type { Certificate } from '../../domain/types'
import { loadJourney } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'

export class GetLearnerCertificate {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext): Promise<Certificate | null> {
    const { enrollment } = await loadJourney(this.deps, context)
    return this.deps.learners.findCertificateByEnrollment(enrollment.id)
  }
}
