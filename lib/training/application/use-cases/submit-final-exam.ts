import { TrainingError, invalidInput, notFound } from '../../domain/errors'
import { gradeAnswers, hasPassed, minimumCorrectAnswers } from '../../domain/grading'
import type { Certificate, SubmittedAnswers } from '../../domain/types'
import { auditEvent, loadJourney } from '../journey'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'
import { IssueCertificate } from './issue-certificate'

export type SubmitFinalExamInput = { attemptId: string; answers: SubmittedAnswers }

export type ExamReviewItem = {
  questionId: string
  prompt: string
  options: { id: string; label: string }[]
  selectedOptionIds: string[]
  correctOptionIds: string[]
  isCorrect: boolean
  explanation: string
}

export type SubmitFinalExamResult = {
  correctCount: number
  totalCount: number
  scoreRatio: number
  minimumCorrect: number
  passed: boolean
  review: ExamReviewItem[]
  certificate: Certificate | null
}

export class SubmitFinalExam {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(
    context: LearnerContext,
    input: SubmitFinalExamInput,
  ): Promise<SubmitFinalExamResult> {
    const journey = await loadJourney(this.deps, context)
    const attempt = journey.examAttempts.find((item) => item.id === input.attemptId)
    if (!attempt) throw notFound('Exam attempt')
    if (attempt.submittedAt !== null) {
      throw new TrainingError('ALREADY_SUBMITTED', 'Exam attempt was already submitted')
    }

    const questionIds = attempt.paper.map((item) => item.questionId)
    if (questionIds.some((id) => !input.answers[id]?.length)) {
      throw invalidInput('Every question must be answered')
    }

    const [key, questions] = await Promise.all([
      this.deps.content.getAnswerKey(questionIds),
      this.deps.content.getQuestionsByIds(questionIds),
    ])
    const grade = gradeAnswers(questionIds, key, input.answers)
    const passRatio = journey.track.finalExamPassRatio
    const passed = hasPassed(grade.correctCount, grade.totalCount, passRatio)

    await this.deps.learners.submitExamAttempt({
      attemptId: attempt.id,
      answers: input.answers,
      correctCount: grade.correctCount,
      scoreRatio: grade.scoreRatio,
      passed,
      submittedAt: this.deps.clock.now(),
    })
    await this.deps.audit.log(
      auditEvent(
        context,
        passed ? 'training.final_exam_passed' : 'training.final_exam_failed',
        `${grade.correctCount}/${grade.totalCount}`,
      ),
    )

    const certificate = passed
      ? await new IssueCertificate(this.deps).execute(context, journey)
      : null

    const questionsById = new Map(questions.map((question) => [question.id, question]))
    const optionOrder = new Map(attempt.paper.map((item) => [item.questionId, item.optionIds]))

    return {
      correctCount: grade.correctCount,
      totalCount: grade.totalCount,
      scoreRatio: grade.scoreRatio,
      minimumCorrect: minimumCorrectAnswers(grade.totalCount, passRatio),
      passed,
      certificate,
      review: grade.questions.map((graded) => {
        const question = questionsById.get(graded.questionId)!
        const optionsById = new Map(question.options.map((option) => [option.id, option]))
        return {
          ...graded,
          prompt: question.prompt,
          explanation: question.explanation,
          options: (optionOrder.get(graded.questionId) ?? []).map((id) => ({
            id,
            label: optionsById.get(id)?.label ?? '',
          })),
        }
      }),
    }
  }
}
