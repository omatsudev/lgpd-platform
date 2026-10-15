import type { LearnerContext } from '@/lib/training/application/learner-context'
import type { TrainingDependencies } from '@/lib/training/application/ports'
import type { SubmittedAnswers, TrainingTrack } from '@/lib/training/domain/types'
import {
  FixedClock,
  InMemoryLearnerRepository,
  InMemoryTrainingContentRepository,
  RecordingAuditLogger,
  RecordingCertificateNotifier,
} from './in-memory-repositories'
import { buildLgpdTrackFixture } from './lgpd-track-fixture'
import { seededRandom } from './seeded-random'

export const learner: LearnerContext = {
  userId: 'user-ana',
  email: 'ana.souza@acme.com.br',
  name: 'Ana Paula Souza',
  companyId: 'company-acme',
  companyName: 'Acme Ltda',
}

export function createTrainingTestKit(trackOverrides: Partial<TrainingTrack> = {}) {
  const fixture = buildLgpdTrackFixture(trackOverrides)
  const learners = new InMemoryLearnerRepository()
  const audit = new RecordingAuditLogger()
  const notifier = new RecordingCertificateNotifier()
  const clock = new FixedClock(new Date('2026-10-14T12:00:00Z'))
  const deps: TrainingDependencies = {
    trackSlug: fixture.track.slug,
    content: new InMemoryTrainingContentRepository(
      fixture.track,
      fixture.questions,
      fixture.answerKey,
    ),
    learners,
    audit,
    notifier,
    clock,
    random: seededRandom(42),
  }

  const correctAnswers = (questionIds: string[]): SubmittedAnswers =>
    Object.fromEntries(questionIds.map((id) => [id, fixture.answerKey.get(id)!]))

  const wrongAnswers = (questionIds: string[]): SubmittedAnswers =>
    Object.fromEntries(
      questionIds.map((id) => {
        const question = fixture.questions.find((q) => q.id === id)!
        const wrong = question.options.find((o) => !fixture.answerKey.get(id)!.includes(o.id))!
        return [id, [wrong.id]]
      }),
    )

  const videoQuestionIds = (videoId: string) =>
    fixture.questions.filter((q) => q.videoId === videoId).map((q) => q.id)

  return {
    fixture,
    deps,
    learners,
    audit,
    notifier,
    clock,
    correctAnswers,
    wrongAnswers,
    videoQuestionIds,
  }
}
