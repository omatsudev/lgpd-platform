import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  EnrollmentRecord,
  ExamSubmission,
  LearnerRepository,
  NewCertificate,
  NewEnrollment,
  NewExamAttempt,
  NewQuizAttempt,
} from '../../application/ports'
import type {
  Certificate,
  Enrollment,
  ExamAttempt,
  QuizAttempt,
  VideoProgress,
} from '../../domain/types'
import {
  firstOrNull,
  toCertificate,
  toEnrollment,
  toExamAttempt,
  toQuizAttempt,
  toVideoProgress,
} from './row-mappers'

const QUIZ_ATTEMPT_COLUMNS =
  'id, enrollment_id, video_id, correct_count, total_count, passed, created_at'

export class SupabaseLearnerRepository implements LearnerRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findEnrollment(trackId: string, companyId: string, userId: string) {
    const { data, error } = await this.client
      .from('training_enrollments')
      .select('*')
      .eq('track_id', trackId)
      .eq('company_id', companyId)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    return data ? toEnrollment(data) : null
  }

  async createEnrollment(enrollment: NewEnrollment): Promise<Enrollment> {
    // Upsert keeps concurrent first visits from failing on the unique key.
    const { data, error } = await this.client
      .from('training_enrollments')
      .upsert(
        {
          track_id: enrollment.trackId,
          company_id: enrollment.companyId,
          user_id: enrollment.userId,
          learner_name: enrollment.learnerName,
          learner_email: enrollment.learnerEmail,
          started_at: enrollment.startedAt.toISOString(),
        },
        { onConflict: 'track_id,company_id,user_id', ignoreDuplicates: false },
      )
      .select('*')
      .single()
    if (error) throw error
    return toEnrollment(data)
  }

  async markEnrollmentCompleted(enrollmentId: string, completedAt: Date): Promise<void> {
    const { error } = await this.client
      .from('training_enrollments')
      .update({ completed_at: completedAt.toISOString() })
      .eq('id', enrollmentId)
    if (error) throw error
  }

  async listVideoProgress(enrollmentId: string): Promise<VideoProgress[]> {
    const { data, error } = await this.client
      .from('training_video_progress')
      .select('*')
      .eq('enrollment_id', enrollmentId)
    if (error) throw error
    return data.map(toVideoProgress)
  }

  async saveVideoProgress(progress: VideoProgress): Promise<void> {
    const { error } = await this.client.from('training_video_progress').upsert(
      {
        enrollment_id: progress.enrollmentId,
        video_id: progress.videoId,
        watched_segments: progress.watchedSegments,
        last_position_seconds: progress.lastPositionSeconds,
        watched_ratio: progress.watchedRatio,
        completed_at: progress.completedAt?.toISOString() ?? null,
      },
      { onConflict: 'enrollment_id,video_id' },
    )
    if (error) throw error
  }

  async listQuizAttempts(enrollmentId: string): Promise<QuizAttempt[]> {
    const { data, error } = await this.client
      .from('training_quiz_attempts')
      .select(QUIZ_ATTEMPT_COLUMNS)
      .eq('enrollment_id', enrollmentId)
      .order('created_at')
    if (error) throw error
    return data.map(toQuizAttempt)
  }

  async createQuizAttempt(attempt: NewQuizAttempt): Promise<QuizAttempt> {
    const { data, error } = await this.client
      .from('training_quiz_attempts')
      .insert({
        enrollment_id: attempt.enrollmentId,
        video_id: attempt.videoId,
        answers: attempt.answers,
        correct_count: attempt.correctCount,
        total_count: attempt.totalCount,
        passed: attempt.passed,
        created_at: attempt.createdAt.toISOString(),
      })
      .select(QUIZ_ATTEMPT_COLUMNS)
      .single()
    if (error) throw error
    return toQuizAttempt(data)
  }

  async listExamAttempts(enrollmentId: string): Promise<ExamAttempt[]> {
    const { data, error } = await this.client
      .from('training_exam_attempts')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .order('started_at')
    if (error) throw error
    return data.map(toExamAttempt)
  }

  async createExamAttempt(attempt: NewExamAttempt): Promise<ExamAttempt> {
    const { data, error } = await this.client
      .from('training_exam_attempts')
      .insert({
        enrollment_id: attempt.enrollmentId,
        paper: attempt.paper,
        total_count: attempt.paper.length,
        started_at: attempt.startedAt.toISOString(),
      })
      .select('*')
      .single()
    if (error) throw error
    return toExamAttempt(data)
  }

  async submitExamAttempt(submission: ExamSubmission): Promise<ExamAttempt> {
    // The submitted_at filter makes a double submission update nothing.
    const { data, error } = await this.client
      .from('training_exam_attempts')
      .update({
        answers: submission.answers,
        correct_count: submission.correctCount,
        score_ratio: submission.scoreRatio,
        passed: submission.passed,
        submitted_at: submission.submittedAt.toISOString(),
      })
      .eq('id', submission.attemptId)
      .is('submitted_at', null)
      .select('*')
      .single()
    if (error) throw error
    return toExamAttempt(data)
  }

  async findCertificateByEnrollment(enrollmentId: string): Promise<Certificate | null> {
    const { data, error } = await this.client
      .from('training_certificates')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .maybeSingle()
    if (error) throw error
    return data ? toCertificate(data) : null
  }

  async findCertificateByCode(verificationCode: string): Promise<Certificate | null> {
    const { data, error } = await this.client
      .from('training_certificates')
      .select('*')
      .eq('verification_code', verificationCode)
      .maybeSingle()
    if (error) throw error
    return data ? toCertificate(data) : null
  }

  async createCertificate(certificate: NewCertificate): Promise<Certificate> {
    const { data, error } = await this.client
      .from('training_certificates')
      .insert({
        enrollment_id: certificate.enrollmentId,
        verification_code: certificate.verificationCode,
        learner_name: certificate.learnerName,
        company_name: certificate.companyName,
        track_title: certificate.trackTitle,
        workload_minutes: certificate.workloadMinutes,
        issued_at: certificate.issuedAt.toISOString(),
        expires_at: certificate.expiresAt?.toISOString() ?? null,
      })
      .select('*')
      .single()
    if (error) throw error
    return toCertificate(data)
  }

  async listCompanyEnrollments(trackId: string, companyId: string): Promise<EnrollmentRecord[]> {
    const { data, error } = await this.client
      .from('training_enrollments')
      .select(
        `*, training_video_progress(*), training_quiz_attempts(${QUIZ_ATTEMPT_COLUMNS}),
         training_exam_attempts(*), training_certificates(*)`,
      )
      .eq('track_id', trackId)
      .eq('company_id', companyId)
    if (error) throw error
    return data.map((row) => {
      const certificate = firstOrNull(row.training_certificates)
      return {
        enrollment: toEnrollment(row),
        videoProgress: (row.training_video_progress ?? []).map(toVideoProgress),
        quizAttempts: (row.training_quiz_attempts ?? []).map(toQuizAttempt),
        examAttempts: (row.training_exam_attempts ?? []).map(toExamAttempt),
        certificate: certificate ? toCertificate(certificate) : null,
      }
    })
  }
}
