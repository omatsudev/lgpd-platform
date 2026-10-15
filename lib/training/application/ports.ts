import type { RandomSource } from '../domain/random'
import type {
  AnswerKey,
  Certificate,
  Enrollment,
  ExamAttempt,
  ExamPaperQuestion,
  Question,
  QuizAttempt,
  SubmittedAnswers,
  TrainingTrack,
  VideoProgress,
} from '../domain/types'

export interface TrainingContentRepository {
  /** Returns the track with its modules and videos ordered by position. */
  getTrackBySlug(slug: string): Promise<TrainingTrack | null>
  listVideoQuizQuestions(videoId: string): Promise<Question[]>
  listFinalExamBank(trackId: string): Promise<Question[]>
  getQuestionsByIds(questionIds: readonly string[]): Promise<Question[]>
  getAnswerKey(questionIds: readonly string[]): Promise<AnswerKey>
}

export type NewEnrollment = Omit<Enrollment, 'id' | 'completedAt'>
export type NewQuizAttempt = Omit<QuizAttempt, 'id'> & { answers: SubmittedAnswers }
export type NewExamAttempt = { enrollmentId: string; paper: ExamPaperQuestion[]; startedAt: Date }
export type ExamSubmission = {
  attemptId: string
  answers: SubmittedAnswers
  correctCount: number
  scoreRatio: number
  passed: boolean
  submittedAt: Date
}
export type NewCertificate = Omit<Certificate, 'id'>

export type EnrollmentRecord = {
  enrollment: Enrollment
  videoProgress: VideoProgress[]
  quizAttempts: QuizAttempt[]
  examAttempts: ExamAttempt[]
  certificate: Certificate | null
}

export interface LearnerRepository {
  findEnrollment(trackId: string, companyId: string, userId: string): Promise<Enrollment | null>
  createEnrollment(enrollment: NewEnrollment): Promise<Enrollment>
  markEnrollmentCompleted(enrollmentId: string, completedAt: Date): Promise<void>

  listVideoProgress(enrollmentId: string): Promise<VideoProgress[]>
  saveVideoProgress(progress: VideoProgress): Promise<void>

  listQuizAttempts(enrollmentId: string): Promise<QuizAttempt[]>
  createQuizAttempt(attempt: NewQuizAttempt): Promise<QuizAttempt>

  listExamAttempts(enrollmentId: string): Promise<ExamAttempt[]>
  createExamAttempt(attempt: NewExamAttempt): Promise<ExamAttempt>
  submitExamAttempt(submission: ExamSubmission): Promise<ExamAttempt>

  findCertificateByEnrollment(enrollmentId: string): Promise<Certificate | null>
  findCertificateByCode(verificationCode: string): Promise<Certificate | null>
  createCertificate(certificate: NewCertificate): Promise<Certificate>

  listCompanyEnrollments(trackId: string, companyId: string): Promise<EnrollmentRecord[]>
}

export type AuditEvent = {
  userId: string
  userEmail: string
  companyId: string
  action: string
  resource: string
  details?: string
}

export interface AuditLogger {
  log(event: AuditEvent): Promise<void>
}

export interface CertificateNotifier {
  certificateIssued(certificate: Certificate, recipientEmail: string): Promise<void>
}

export interface Clock {
  now(): Date
}

export type TrainingDependencies = {
  trackSlug: string
  content: TrainingContentRepository
  learners: LearnerRepository
  audit: AuditLogger
  notifier: CertificateNotifier
  clock: Clock
  random: RandomSource
}
