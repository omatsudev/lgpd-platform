import type { LearnerContext } from '@/lib/training/application/learner-context'
import { GetVideoQuiz } from '@/lib/training/application/use-cases/get-video-quiz'
import { RecordVideoWatch } from '@/lib/training/application/use-cases/record-video-watch'
import { SubmitVideoQuiz } from '@/lib/training/application/use-cases/submit-video-quiz'
import type { createTrainingTestKit } from '../../support/training/training-test-kit'

type Kit = ReturnType<typeof createTrainingTestKit>

export async function watchWholeVideo(kit: Kit, context: LearnerContext, videoNumber: number) {
  const video = kit.fixture.track.modules
    .flatMap((module) => module.videos)
    .find((item) => item.position === videoNumber)!
  return new RecordVideoWatch(kit.deps).execute(context, {
    videoId: video.id,
    segments: [{ start: 0, end: video.durationSeconds }],
    positionSeconds: video.durationSeconds,
  })
}

export async function passVideoQuiz(kit: Kit, context: LearnerContext, videoNumber: number) {
  const videoId = `video-${videoNumber}`
  const quiz = await new GetVideoQuiz(kit.deps).execute(context, videoId)
  return new SubmitVideoQuiz(kit.deps).execute(context, {
    videoId,
    answers: kit.correctAnswers(quiz.questions.map((question) => question.id)),
  })
}

export async function completeAllVideos(kit: Kit, context: LearnerContext) {
  for (let videoNumber = 1; videoNumber <= 12; videoNumber++) {
    await watchWholeVideo(kit, context, videoNumber)
    await passVideoQuiz(kit, context, videoNumber)
  }
}
