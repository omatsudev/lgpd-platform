import { GetCompanyTrainingReport } from '@/lib/training/application/use-cases/get-company-training-report'
import { GetTrackOverview } from '@/lib/training/application/use-cases/get-track-overview'
import { describe, expect, it } from 'vitest'
import { createTrainingTestKit, learner } from '../../support/training/training-test-kit'
import { passVideoQuiz, watchWholeVideo } from './helpers'

describe('company training report', () => {
  it('lists only learners of the requested company', async () => {
    const kit = createTrainingTestKit()
    const bruno = { ...learner, userId: 'user-bruno', name: 'Bruno Lima', email: 'bruno@acme.com' }
    const outsider = {
      ...learner,
      userId: 'user-carla',
      name: 'Carla Dias',
      email: 'carla@other.com',
      companyId: 'company-other',
    }

    await new GetTrackOverview(kit.deps).execute(learner)
    await watchWholeVideo(kit, bruno, 1)
    await passVideoQuiz(kit, bruno, 1)
    await new GetTrackOverview(kit.deps).execute(outsider)

    const report = await new GetCompanyTrainingReport(kit.deps).execute('company-acme')
    expect(report.rows.map((row) => [row.learnerName, row.status, row.completionPercent])).toEqual([
      ['Ana Paula Souza', 'not_started', 0],
      ['Bruno Lima', 'in_progress', 8],
    ])
    expect(report.summary).toEqual({ enrolled: 2, inProgress: 1, completed: 0, averageScore: null })
  })

  it('keeps the same learner separate per company', async () => {
    const kit = createTrainingTestKit()
    await watchWholeVideo(kit, learner, 1)
    await new GetTrackOverview(kit.deps).execute({ ...learner, companyId: 'company-other' })
    expect(kit.learners.enrollments).toHaveLength(2)

    const other = await new GetCompanyTrainingReport(kit.deps).execute('company-other')
    expect(other.rows[0].status).toBe('not_started')
  })
})
