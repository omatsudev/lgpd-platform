import { AcknowledgePendingVideo } from '@/lib/training/application/use-cases/acknowledge-pending-video'
import { CheckVideoQuizAnswer } from '@/lib/training/application/use-cases/check-video-quiz-answer'
import { GetFinalExam } from '@/lib/training/application/use-cases/get-final-exam'
import { GetVideoLesson } from '@/lib/training/application/use-cases/get-video-lesson'
import { GetVideoQuiz } from '@/lib/training/application/use-cases/get-video-quiz'
import { RecordVideoWatch } from '@/lib/training/application/use-cases/record-video-watch'
import { StartFinalExam } from '@/lib/training/application/use-cases/start-final-exam'
import { SubmitVideoQuiz } from '@/lib/training/application/use-cases/submit-video-quiz'
import { describe, expect, it } from 'vitest'
import { createTrainingTestKit, learner } from '../../support/training/training-test-kit'
import { completeAllVideos, passVideoQuiz, watchWholeVideo } from './helpers'

describe('linear progression', () => {
  it('locks the second video until the first quiz is passed', async () => {
    const kit = createTrainingTestKit()
    await expect(new GetVideoLesson(kit.deps).execute(learner, 'video-2')).rejects.toMatchObject({
      code: 'LOCKED',
    })
    await watchWholeVideo(kit, learner, 1)
    await expect(new GetVideoLesson(kit.deps).execute(learner, 'video-2')).rejects.toMatchObject({
      code: 'LOCKED',
    })
    await passVideoQuiz(kit, learner, 1)
    const lesson = await new GetVideoLesson(kit.deps).execute(learner, 'video-2')
    expect(lesson).toMatchObject({ number: 2, totalVideos: 12 })
    expect(lesson.previous?.video.id).toBe('video-1')
  })

  it('keeps the final exam locked until the last video', async () => {
    const kit = createTrainingTestKit()
    await expect(new StartFinalExam(kit.deps).execute(learner)).rejects.toMatchObject({
      code: 'LOCKED',
    })
  })
})

describe('video watching', () => {
  it('does not complete a video when the learner skips ahead', async () => {
    const kit = createTrainingTestKit()
    const record = new RecordVideoWatch(kit.deps)
    const result = await record.execute(learner, {
      videoId: 'video-1',
      segments: [
        { start: 0, end: 10 },
        { start: 80, end: 90 },
      ],
      positionSeconds: 90,
    })
    expect(result.completed).toBe(false)
    await expect(new GetVideoQuiz(kit.deps).execute(learner, 'video-1')).rejects.toMatchObject({
      code: 'LOCKED',
    })
  })

  it('accumulates segments across sessions and saves the resume position', async () => {
    const kit = createTrainingTestKit()
    const record = new RecordVideoWatch(kit.deps)
    await record.execute(learner, {
      videoId: 'video-1',
      segments: [{ start: 0, end: 45 }],
      positionSeconds: 45,
    })
    const lesson = await new GetVideoLesson(kit.deps).execute(learner, 'video-1')
    expect(lesson.lastPositionSeconds).toBe(45)
    expect(lesson.current.status).toBe('in_progress')

    const result = await record.execute(learner, {
      videoId: 'video-1',
      segments: [{ start: 45, end: 82 }],
      positionSeconds: 82,
    })
    expect(result.completed).toBe(true)
    expect(kit.audit.actions().filter((a) => a === 'training.video_completed')).toHaveLength(1)
  })

  it('ignores segments outside the video duration', async () => {
    const kit = createTrainingTestKit()
    const result = await new RecordVideoWatch(kit.deps).execute(learner, {
      videoId: 'video-1',
      segments: [{ start: 0, end: 10_000 }],
      positionSeconds: 10_000,
    })
    expect(result.watchedRatio).toBe(1)
    expect(kit.learners.videoProgress[0].lastPositionSeconds).toBe(90)
  })
})

describe('videos not recorded yet', () => {
  it('lets the learner confirm the key message to move on', async () => {
    const kit = createTrainingTestKit()
    kit.fixture.track.modules[0].videos[0].videoUrl = null

    const lesson = await new GetVideoLesson(kit.deps).execute(learner, 'video-1')
    expect(lesson.contentAvailable).toBe(false)
    await expect(
      new RecordVideoWatch(kit.deps).execute(learner, {
        videoId: 'video-1',
        segments: [{ start: 0, end: 90 }],
        positionSeconds: 90,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' })

    await new AcknowledgePendingVideo(kit.deps).execute(learner, 'video-1')
    const quiz = await new GetVideoQuiz(kit.deps).execute(learner, 'video-1')
    expect(quiz.questions).toHaveLength(4)
  })

  it('refuses the confirmation once the video exists', async () => {
    const kit = createTrainingTestKit()
    await expect(
      new AcknowledgePendingVideo(kit.deps).execute(learner, 'video-1'),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })
})

describe('video quiz', () => {
  it('serves 4 questions in random order without the answer key', async () => {
    const kit = createTrainingTestKit()
    await watchWholeVideo(kit, learner, 1)
    const quiz = await new GetVideoQuiz(kit.deps).execute(learner, 'video-1')
    expect(quiz.questions).toHaveLength(4)
    expect(quiz.minimumCorrect).toBe(3)
    for (const question of quiz.questions) {
      expect(question.options).toHaveLength(4)
      expect(Object.keys(question.options[0]).sort()).toEqual(['id', 'label'])
    }
    expect(JSON.stringify(quiz)).not.toMatch(/correctOption|explanation|feedback/i)
  })

  it('gives immediate feedback for one answer', async () => {
    const kit = createTrainingTestKit()
    await watchWholeVideo(kit, learner, 1)
    const check = new CheckVideoQuizAnswer(kit.deps)
    const questionId = 'question-1.1'
    const [correctOption] = kit.fixture.answerKey.get(questionId)!

    const right = await check.execute(learner, {
      videoId: 'video-1',
      questionId,
      optionIds: [correctOption],
    })
    expect(right.isCorrect).toBe(true)
    expect(right.explanation).toContain('LGPD')

    const wrong = await check.execute(learner, {
      videoId: 'video-1',
      questionId,
      optionIds: ['question-1.1-option-1'],
    })
    expect(wrong).toMatchObject({ isCorrect: false, correctOptionIds: [correctOption] })
  })

  it('rejects feedback for a question of another video', async () => {
    const kit = createTrainingTestKit()
    await watchWholeVideo(kit, learner, 1)
    await expect(
      new CheckVideoQuizAnswer(kit.deps).execute(learner, {
        videoId: 'video-1',
        questionId: 'question-5.1',
        optionIds: ['question-5.1-option-1'],
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })

  it('fails with 2 of 4 and passes on a retake with 3 of 4', async () => {
    const kit = createTrainingTestKit()
    await watchWholeVideo(kit, learner, 1)
    const ids = kit.videoQuestionIds('video-1')
    const submit = new SubmitVideoQuiz(kit.deps)

    const failed = await submit.execute(learner, {
      videoId: 'video-1',
      answers: { ...kit.correctAnswers(ids.slice(0, 2)), ...kit.wrongAnswers(ids.slice(2)) },
    })
    expect(failed).toMatchObject({ passed: false, correctCount: 2, nextVideoId: null })

    const passed = await submit.execute(learner, {
      videoId: 'video-1',
      answers: { ...kit.correctAnswers(ids.slice(0, 3)), ...kit.wrongAnswers(ids.slice(3)) },
    })
    expect(passed).toMatchObject({ passed: true, correctCount: 3, nextVideoId: 'video-2' })
    expect(kit.audit.actions()).toEqual(
      expect.arrayContaining(['training.quiz_failed', 'training.quiz_passed']),
    )
  })

  it('requires every question to be answered', async () => {
    const kit = createTrainingTestKit()
    await watchWholeVideo(kit, learner, 1)
    const ids = kit.videoQuestionIds('video-1')
    await expect(
      new SubmitVideoQuiz(kit.deps).execute(learner, {
        videoId: 'video-1',
        answers: kit.correctAnswers(ids.slice(0, 3)),
      }),
    ).rejects.toMatchObject({ code: 'INVALID_INPUT' })
  })
})

describe('final exam overview', () => {
  it('describes the exam without creating an attempt, then shows the open paper', async () => {
    const kit = createTrainingTestKit()

    const lockedOverview = await new GetFinalExam(kit.deps).execute(learner)
    expect(lockedOverview).toMatchObject({ status: 'locked', openPaper: null, questionCount: 15 })

    await completeAllVideos(kit, learner)
    const before = await new GetFinalExam(kit.deps).execute(learner)
    expect(before).toMatchObject({ status: 'available', openPaper: null, minimumCorrect: 11 })
    expect(kit.learners.examAttempts).toHaveLength(0)

    const started = await new StartFinalExam(kit.deps).execute(learner)
    const after = await new GetFinalExam(kit.deps).execute(learner)
    expect(after.openPaper?.attemptId).toBe(started.attemptId)
  })
})
