import { minimumCorrectAnswers } from '../../domain/grading'
import type { VideoState } from '../../domain/progression'
import { shuffle } from '../../domain/random'
import type { LearnerContext } from '../learner-context'
import type { TrainingDependencies } from '../ports'
import { toQuestionView, type QuestionView } from '../views'
import { loadAccessibleQuiz } from './video-quiz-access'

export type VideoQuiz = {
  video: VideoState
  questions: QuestionView[]
  minimumCorrect: number
  passed: boolean
}

export class GetVideoQuiz {
  constructor(private readonly deps: TrainingDependencies) {}

  async execute(context: LearnerContext, videoId: string): Promise<VideoQuiz> {
    const { journey, state } = await loadAccessibleQuiz(this.deps, context, videoId)
    const questions = await this.deps.content.listVideoQuizQuestions(videoId)
    const random = this.deps.random

    return {
      video: state,
      questions: shuffle(questions, random).map((question) =>
        toQuestionView(
          question,
          shuffle(
            question.options.map((option) => option.id),
            random,
          ),
        ),
      ),
      minimumCorrect: minimumCorrectAnswers(questions.length, journey.track.videoQuizPassRatio),
      passed: state.status === 'completed',
    }
  }
}
