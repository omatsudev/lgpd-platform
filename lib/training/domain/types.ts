export type QuestionType = 'single_choice' | 'true_false' | 'multiple_choice'
export type QuestionKind = 'video_quiz' | 'final_exam'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type PublicationStatus = 'draft' | 'published'

export type TrainingTrack = {
  id: string
  slug: string
  title: string
  description: string
  videoQuizPassRatio: number
  finalExamPassRatio: number
  /** null means unlimited attempts. */
  finalExamMaxAttempts: number | null
  workloadMinutes: number
  /** null means the certificate never expires. */
  certificateValidityMonths: number | null
  modules: TrainingModule[]
}

export type TrainingModule = {
  id: string
  position: number
  title: string
  objective: string
  finalExamQuestionCount: number
  videos: TrainingVideo[]
}

export type TrainingVideo = {
  id: string
  moduleId: string
  /** Global order inside the track (1..N). */
  position: number
  title: string
  keyMessage: string
  durationSeconds: number
  /** null while the recorded video is not available yet. */
  videoUrl: string | null
  captionsUrl: string | null
  transcript: string | null
  status: PublicationStatus
  minWatchRatio: number
}

export type QuestionOption = {
  id: string
  position: number
  label: string
  feedback: string | null
}

export type Question = {
  id: string
  code: string
  kind: QuestionKind
  type: QuestionType
  videoId: string | null
  moduleId: string | null
  difficulty: QuestionDifficulty | null
  prompt: string
  explanation: string
  options: QuestionOption[]
}

/** Correct option ids indexed by question id. Never sent to the browser before grading. */
export type AnswerKey = Map<string, string[]>

/** Selected option ids indexed by question id. */
export type SubmittedAnswers = Record<string, string[]>

export type WatchSegment = { start: number; end: number }

export type Enrollment = {
  id: string
  trackId: string
  companyId: string
  userId: string
  learnerName: string
  learnerEmail: string
  startedAt: Date
  completedAt: Date | null
}

export type VideoProgress = {
  enrollmentId: string
  videoId: string
  watchedSegments: WatchSegment[]
  lastPositionSeconds: number
  watchedRatio: number
  completedAt: Date | null
}

export type QuizAttempt = {
  id: string
  enrollmentId: string
  videoId: string
  correctCount: number
  totalCount: number
  passed: boolean
  createdAt: Date
}

export type ExamPaperQuestion = { questionId: string; optionIds: string[] }

export type ExamAttempt = {
  id: string
  enrollmentId: string
  paper: ExamPaperQuestion[]
  answers: SubmittedAnswers | null
  correctCount: number | null
  totalCount: number
  scoreRatio: number | null
  passed: boolean | null
  startedAt: Date
  submittedAt: Date | null
}

export type Certificate = {
  id: string
  enrollmentId: string
  verificationCode: string
  learnerName: string
  companyName: string
  trackTitle: string
  workloadMinutes: number
  issuedAt: Date
  expiresAt: Date | null
}
