import { bestScore } from '../../domain/exam'
import { computeTrackProgress } from '../../domain/progression'
import { loadTrack } from '../journey'
import type { EnrollmentRecord, TrainingDependencies } from '../ports'

export type LearnerReportStatus = 'not_started' | 'in_progress' | 'completed'

export type LearnerReportRow = {
  enrollmentId: string
  learnerName: string
  learnerEmail: string
  status: LearnerReportStatus
  completionPercent: number
  completedModules: number
  totalModules: number
  examAttempts: number
  bestExamScore: number | null
  startedAt: Date
  completedAt: Date | null
  certificateCode: string | null
}

export type CompanyTrainingReport = {
  trackTitle: string
  rows: LearnerReportRow[]
  summary: { enrolled: number; inProgress: number; completed: number; averageScore: number | null }
}

export class GetCompanyTrainingReport {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(companyId: string): Promise<CompanyTrainingReport> {
    const track = await loadTrack(this.deps)
    const records = await this.deps.learners.listCompanyEnrollments(track.id, companyId)
    const rows = records
      .map((record) => toRow(track, record))
      .sort((a, b) => a.learnerName.localeCompare(b.learnerName, 'pt-BR'))

    const scores = rows
      .map((row) => row.bestExamScore)
      .filter((score): score is number => score !== null)

    return {
      trackTitle: track.title,
      rows,
      summary: {
        enrolled: rows.length,
        inProgress: rows.filter((row) => row.status === 'in_progress').length,
        completed: rows.filter((row) => row.status === 'completed').length,
        averageScore:
          scores.length === 0
            ? null
            : scores.reduce((sum, score) => sum + score, 0) / scores.length,
      },
    }
  }
}

function toRow(
  track: Parameters<typeof computeTrackProgress>[0],
  record: EnrollmentRecord,
): LearnerReportRow {
  const submittedExams = record.examAttempts.filter((attempt) => attempt.submittedAt !== null)
  const progress = computeTrackProgress(track, {
    watchedVideoIds: new Set(
      record.videoProgress.filter((item) => item.completedAt).map((item) => item.videoId),
    ),
    startedVideoIds: new Set(record.videoProgress.map((item) => item.videoId)),
    passedQuizVideoIds: new Set(
      record.quizAttempts.filter((attempt) => attempt.passed).map((attempt) => attempt.videoId),
    ),
    finalExamPassed: submittedExams.some((attempt) => attempt.passed),
  })
  const hasActivity =
    record.videoProgress.length > 0 || record.quizAttempts.length > 0 || submittedExams.length > 0

  return {
    enrollmentId: record.enrollment.id,
    learnerName: record.enrollment.learnerName,
    learnerEmail: record.enrollment.learnerEmail,
    status: record.certificate ? 'completed' : hasActivity ? 'in_progress' : 'not_started',
    completionPercent: progress.completionPercent,
    completedModules: progress.modules.filter((module) => module.status === 'completed').length,
    totalModules: progress.modules.length,
    examAttempts: submittedExams.length,
    bestExamScore: bestScore(submittedExams),
    startedAt: record.enrollment.startedAt,
    completedAt: record.enrollment.completedAt,
    certificateCode: record.certificate?.verificationCode ?? null,
  }
}
