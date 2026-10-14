import { invalidInput } from '../../domain/errors'
import { gradeAnswers, hasPassed, minimumCorrectAnswers } from '../../domain/grading'
import { adjacentVideos } from '../../domain/progression'
import type { SubmittedAnswers } from '../../domain/types'
import { auditEvent } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'
import { loadAccessibleQuiz } from './video-quiz-access'

export type SubmitVideoQuizInput = { videoId: string; answers: SubmittedAnswers }

export type SubmitVideoQuizResult = {
  correctCount: number
  totalCount: number
  minimumCorrect: number
  passed: boolean
  nextVideoId: string | null
  moduleCompleted: boolean
  finalExamUnlocked: boolean
}

export class SubmitVideoQuiz {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(
    context: LearnerContext,
    input: SubmitVideoQuizInput,
  ): Promise<SubmitVideoQuizResult> {
    const { journey, state } = await loadAccessibleQuiz(this.deps, context, input.videoId)
    const questions = await this.deps.content.listVideoQuizQuestions(input.videoId)
    const questionIds = questions.map((question) => question.id)
    if (questionIds.some((id) => !input.answers[id]?.length)) {
      throw invalidInput('Every question must be answered')
    }

    const key = await this.deps.content.getAnswerKey(questionIds)
    const grade = gradeAnswers(questionIds, key, input.answers)
    const passRatio = journey.track.videoQuizPassRatio
    const passed = hasPassed(grade.correctCount, grade.totalCount, passRatio)

    await this.deps.learners.createQuizAttempt({
      enrollmentId: journey.enrollment.id,
      videoId: input.videoId,
      answers: input.answers,
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      passed,
      createdAt: this.deps.clock.now(),
    })
    await this.deps.audit.log(
      auditEvent(
        context,
        passed ? 'training.quiz_passed' : 'training.quiz_failed',
        `${state.video.title}: ${grade.correctCount}/${grade.totalCount}`,
      ),
    )

    const moduleState = journey.progress.modules.find(
      (item) => item.module.id === state.video.moduleId,
    )
    const isLastOfModule = moduleState?.videos.at(-1)?.video.id === state.video.id
    const { next } = adjacentVideos(journey.progress, input.videoId)

    return {
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      minimumCorrect: minimumCorrectAnswers(grade.totalCount, passRatio),
      passed,
      nextVideoId: passed ? (next?.video.id ?? null) : null,
      moduleCompleted: passed && isLastOfModule,
      finalExamUnlocked: passed && next === null,
    }
  }
}
