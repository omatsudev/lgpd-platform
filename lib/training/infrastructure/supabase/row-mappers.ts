import type {
  Certificate,
  Enrollment,
  ExamAttempt,
  ExamPaperQuestion,
  Question,
  QuizAttempt,
  SubmittedAnswers,
  TrainingModule,
  TrainingTrack,
  TrainingVideo,
  VideoProgress,
  WatchSegment,
} from '../../domain/types'

/* eslint-disable @typescript-eslint/no-explicit-any -- rows come untyped from PostgREST */
type Row = Record<string, any>

const toDate = (value: string | null | undefined) => (value ? new Date(value) : null)
const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position

export function toVideo(row: Row): TrainingVideo {
  return {
    id: row.id,
    moduleId: row.module_id,
    position: row.position,
    title: row.title,
    keyMessage: row.key_message,
    durationSeconds: row.duration_seconds,
    videoUrl: row.video_url,
    captionsUrl: row.captions_url,
    transcript: row.transcript,
    status: row.status,
    minWatchRatio: Number(row.min_watch_ratio),
  }
}

export function toModule(row: Row): TrainingModule {
  return {
    id: row.id,
    position: row.position,
    title: row.title,
    objective: row.objective,
    finalExamQuestionCount: row.final_exam_question_count,
    videos: ((row.training_videos ?? []) as Row[]).map(toVideo).sort(byPosition),
  }
}

export function toTrack(row: Row): TrainingTrack {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    videoQuizPassRatio: Number(row.video_quiz_pass_ratio),
    finalExamPassRatio: Number(row.final_exam_pass_ratio),
    finalExamMaxAttempts: row.final_exam_max_attempts,
    workloadMinutes: row.workload_minutes,
    certificateValidityMonths: row.certificate_validity_months,
    modules: ((row.training_modules ?? []) as Row[]).map(toModule).sort(byPosition),
  }
}

export function toQuestion(row: Row): Question {
  return {
    id: row.id,
    code: row.code,
    kind: row.kind,
    type: row.type,
    videoId: row.video_id,
    moduleId: row.module_id,
    difficulty: row.difficulty,
    prompt: row.prompt,
    explanation: row.explanation,
    options: ((row.training_question_options ?? []) as Row[])
      .map((option) => ({
        id: option.id,
        position: option.position,
        label: option.label,
        feedback: option.feedback,
      }))
      .sort(byPosition),
  }
}

export function toEnrollment(row: Row): Enrollment {
  return {
    id: row.id,
    trackId: row.track_id,
    companyId: row.company_id,
    userId: row.user_id,
    learnerName: row.learner_name,
    learnerEmail: row.learner_email,
    startedAt: new Date(row.started_at),
    completedAt: toDate(row.completed_at),
  }
}

export function toVideoProgress(row: Row): VideoProgress {
  return {
    enrollmentId: row.enrollment_id,
    videoId: row.video_id,
    watchedSegments: (row.watched_segments ?? []) as WatchSegment[],
    lastPositionSeconds: Number(row.last_position_seconds),
    watchedRatio: Number(row.watched_ratio),
    completedAt: toDate(row.completed_at),
  }
}

export function toQuizAttempt(row: Row): QuizAttempt {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    videoId: row.video_id,
    correctCount: row.correct_count,
    totalCount: row.total_count,
    passed: row.passed,
    createdAt: new Date(row.created_at),
  }
}

export function toExamAttempt(row: Row): ExamAttempt {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    paper: row.paper as ExamPaperQuestion[],
    answers: (row.answers ?? null) as SubmittedAnswers | null,
    correctCount: row.correct_count,
    totalCount: row.total_count,
    scoreRatio: row.score_ratio === null ? null : Number(row.score_ratio),
    passed: row.passed,
    startedAt: new Date(row.started_at),
    submittedAt: toDate(row.submitted_at),
  }
}

export function toCertificate(row: Row): Certificate {
  return {
    id: row.id,
    enrollmentId: row.enrollment_id,
    verificationCode: row.verification_code,
    learnerName: row.learner_name,
    companyName: row.company_name,
    trackTitle: row.track_title,
    workloadMinutes: row.workload_minutes,
    issuedAt: new Date(row.issued_at),
    expiresAt: toDate(row.expires_at),
  }
}

/** PostgREST embeds one-to-one relations as an object and one-to-many as an array. */
export function firstOrNull(value: Row | Row[] | null | undefined): Row | null {
  if (Array.isArray(value)) return value[0] ?? null
  return value ?? null
}
