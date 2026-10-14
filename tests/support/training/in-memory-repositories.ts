import type {
  AuditEvent,
  AuditLogger,
  CertificateNotifier,
  EnrollmentRecord,
  ExamSubmission,
  LearnerRepository,
  NewCertificate,
  NewEnrollment,
  NewExamAttempt,
  NewQuizAttempt,
  TrainingContentRepository,
} from '@/lib/training/application/ports'
import type {
  AnswerKey,
  Certificate,
  Enrollment,
  ExamAttempt,
  Question,
  QuizAttempt,
  TrainingTrack,
  VideoProgress,
} from '@/lib/training/domain/types'

let sequence = 0
const nextId = (prefix: string) => `${prefix}-${++sequence}`

export class InMemoryTrainingContentRepository implements TrainingContentRepository {
  constructor(
    private readonly track: TrainingTrack,
    private readonly questions: Question[],
    private readonly answerKey: AnswerKey,
  ) {}

  async getTrackBySlug(slug: string) {
    return this.track.slug === slug ? this.track : null
  }

  async listVideoQuizQuestions(videoId: string) {
    return this.questions.filter((q) => q.kind === 'video_quiz' && q.videoId === videoId)
  }

  async listFinalExamBank() {
    return this.questions.filter((q) => q.kind === 'final_exam')
  }

  async getQuestionsByIds(questionIds: readonly string[]) {
    return this.questions.filter((q) => questionIds.includes(q.id))
  }

  async getAnswerKey(questionIds: readonly string[]): Promise<AnswerKey> {
    return new Map(questionIds.map((id) => [id, this.answerKey.get(id) ?? []]))
  }
}

export class InMemoryLearnerRepository implements LearnerRepository {
  readonly enrollments: Enrollment[] = []
  readonly videoProgress: VideoProgress[] = []
  readonly quizAttempts: QuizAttempt[] = []
  readonly examAttempts: ExamAttempt[] = []
  readonly certificates: Certificate[] = []

  async findEnrollment(trackId: string, companyId: string, userId: string) {
    return (
      this.enrollments.find(
        (e) => e.trackId === trackId && e.companyId === companyId && e.userId === userId,
      ) ?? null
    )
  }

  async createEnrollment(enrollment: NewEnrollment) {
    const created = { ...enrollment, id: nextId('enrollment'), completedAt: null }
    this.enrollments.push(created)
    return created
  }

  async markEnrollmentCompleted(enrollmentId: string, completedAt: Date) {
    const enrollment = this.enrollments.find((e) => e.id === enrollmentId)
    if (enrollment) enrollment.completedAt = completedAt
  }

  async listVideoProgress(enrollmentId: string) {
    return this.videoProgress.filter((p) => p.enrollmentId === enrollmentId)
  }

  async saveVideoProgress(progress: VideoProgress) {
    const index = this.videoProgress.findIndex(
      (p) => p.enrollmentId === progress.enrollmentId && p.videoId === progress.videoId,
    )
    if (index >= 0) this.videoProgress[index] = progress
    else this.videoProgress.push(progress)
  }

  async listQuizAttempts(enrollmentId: string) {
    return this.quizAttempts.filter((a) => a.enrollmentId === enrollmentId)
  }

  async createQuizAttempt({ answers: _answers, ...attempt }: NewQuizAttempt) {
    const created = { ...attempt, id: nextId('quiz-attempt') }
    this.quizAttempts.push(created)
    return created
  }

  async listExamAttempts(enrollmentId: string) {
    return this.examAttempts.filter((a) => a.enrollmentId === enrollmentId)
  }

  async createExamAttempt(attempt: NewExamAttempt) {
    const created: ExamAttempt = {
      ...attempt,
      id: nextId('exam-attempt'),
      answers: null,
      correctCount: null,
      totalCount: attempt.paper.length,
      scoreRatio: null,
      passed: null,
      submittedAt: null,
    }
    this.examAttempts.push(created)
    return created
  }

  async submitExamAttempt(submission: ExamSubmission) {
    const attempt = this.examAttempts.find((a) => a.id === submission.attemptId)
    if (!attempt || attempt.submittedAt) throw new Error('Attempt not open')
    Object.assign(attempt, {
      answers: submission.answers,
      correctCount: submission.correctCount,
      scoreRatio: submission.scoreRatio,
      passed: submission.passed,
      submittedAt: submission.submittedAt,
    })
    return attempt
  }

  async findCertificateByEnrollment(enrollmentId: string) {
    return this.certificates.find((c) => c.enrollmentId === enrollmentId) ?? null
  }

  async findCertificateByCode(code: string) {
    return this.certificates.find((c) => c.verificationCode === code) ?? null
  }

  async createCertificate(certificate: NewCertificate) {
    const created = { ...certificate, id: nextId('certificate') }
    this.certificates.push(created)
    return created
  }

  async listCompanyEnrollments(trackId: string, companyId: string): Promise<EnrollmentRecord[]> {
    return this.enrollments
      .filter((e) => e.trackId === trackId && e.companyId === companyId)
      .map((enrollment) => ({
        enrollment,
        videoProgress: this.videoProgress.filter((p) => p.enrollmentId === enrollment.id),
        quizAttempts: this.quizAttempts.filter((a) => a.enrollmentId === enrollment.id),
        examAttempts: this.examAttempts.filter((a) => a.enrollmentId === enrollment.id),
        certificate: this.certificates.find((c) => c.enrollmentId === enrollment.id) ?? null,
      }))
  }
}

export class RecordingAuditLogger implements AuditLogger {
  readonly events: AuditEvent[] = []
  async log(event: AuditEvent) {
    this.events.push(event)
  }
  actions() {
    return this.events.map((event) => event.action)
  }
}

export class RecordingCertificateNotifier implements CertificateNotifier {
  readonly sent: { certificate: Certificate; email: string }[] = []
  async certificateIssued(certificate: Certificate, email: string) {
    this.sent.push({ certificate, email })
  }
}

export class FixedClock {
  constructor(private current: Date) {}
  now() {
    return new Date(this.current)
  }
  advance(milliseconds: number) {
    this.current = new Date(this.current.getTime() + milliseconds)
  }
}
