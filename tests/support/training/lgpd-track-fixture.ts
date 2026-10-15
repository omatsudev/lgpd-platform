import type { AnswerKey, Question, TrainingTrack } from '@/lib/training/domain/types'
import content from '../../fixtures/lgpd-training-track.json'

type RawQuestion = {
  code: string
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

export type TrackFixture = { track: TrainingTrack; questions: Question[]; answerKey: AnswerKey }

const LETTERS = ['A', 'B', 'C', 'D']

function buildQuestion(
  raw: RawQuestion,
  extra: Pick<Question, 'kind' | 'videoId' | 'moduleId' | 'difficulty'>,
  answerKey: AnswerKey,
): Question {
  const id = `question-${raw.code}`
  const options = raw.options.map((label, index) => ({
    id: `${id}-option-${index + 1}`,
    position: index + 1,
    label,
    feedback: null,
  }))
  answerKey.set(id, [options[LETTERS.indexOf(raw.answer)].id])
  return {
    id,
    code: raw.code,
    type: 'single_choice',
    prompt: raw.prompt,
    explanation: raw.explanation,
    options,
    ...extra,
  }
}

/** The official LGPD track content (same source as migration 057), with stable ids. */
export function buildLgpdTrackFixture(overrides: Partial<TrainingTrack> = {}): TrackFixture {
  const answerKey: AnswerKey = new Map()
  const moduleId = (position: number) => `module-${position}`
  const videoId = (position: number) => `video-${position}`

  const track: TrainingTrack = {
    id: 'track-lgpd',
    slug: 'lgpd-awareness',
    title: 'Treinamento LGPD',
    description: '',
    videoQuizPassRatio: 0.75,
    finalExamPassRatio: 0.7,
    finalExamMaxAttempts: null,
    workloadMinutes: 60,
    certificateValidityMonths: null,
    modules: content.modules.map((module) => ({
      id: moduleId(module.position),
      position: module.position,
      title: module.title,
      objective: module.objective,
      finalExamQuestionCount: module.finalExamQuestionCount,
      videos: content.videos
        .filter((video) => video.module === module.position)
        .map((video) => ({
          id: videoId(video.position),
          moduleId: moduleId(module.position),
          position: video.position,
          title: video.title,
          keyMessage: video.keyMessage,
          durationSeconds: video.durationSeconds,
          videoUrl: `https://videos.example.com/${video.position}.mp4`,
          captionsUrl: null,
          transcript: null,
          status: 'published' as const,
          minWatchRatio: 0.9,
        })),
    })),
    ...overrides,
  }

  const questions = [
    ...content.videoQuestions.map((raw) =>
      buildQuestion(
        raw,
        { kind: 'video_quiz', videoId: videoId(raw.video), moduleId: null, difficulty: null },
        answerKey,
      ),
    ),
    ...content.examQuestions.map((raw) =>
      buildQuestion(
        raw,
        {
          kind: 'final_exam',
          videoId: null,
          moduleId: moduleId(raw.module),
          difficulty: raw.difficulty as Question['difficulty'],
        },
        answerKey,
      ),
    ),
  ]

  return { track, questions, answerKey }
}
