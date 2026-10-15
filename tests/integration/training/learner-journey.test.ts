import { GetCompanyTrainingReport } from '@/lib/training/application/use-cases/get-company-training-report'
import { GetTrackOverview } from '@/lib/training/application/use-cases/get-track-overview'
import { StartFinalExam } from '@/lib/training/application/use-cases/start-final-exam'
import { SubmitFinalExam } from '@/lib/training/application/use-cases/submit-final-exam'
import { VerifyCertificate } from '@/lib/training/application/use-cases/verify-certificate'
import { describe, expect, it } from 'vitest'
import { createTrainingTestKit, learner } from '../../support/training/training-test-kit'
import { completeAllVideos, passVideoQuiz, watchWholeVideo } from './helpers'

describe('learner journey through the LGPD track', () => {
  it('goes from the first video to a verified certificate', async () => {
    const kit = createTrainingTestKit()
    const overview = new GetTrackOverview(kit.deps)

    const start = await overview.execute(learner)
    expect(start.progress.completionPercent).toBe(0)
    expect(start.progress.nextStep).toEqual({ type: 'video', videoId: 'video-1' })

    await watchWholeVideo(kit, learner, 1)
    const firstQuiz = await passVideoQuiz(kit, learner, 1)
    expect(firstQuiz).toMatchObject({ passed: true, correctCount: 4, nextVideoId: 'video-2' })

    for (let videoNumber = 2; videoNumber <= 4; videoNumber++) {
      await watchWholeVideo(kit, learner, videoNumber)
      const result = await passVideoQuiz(kit, learner, videoNumber)
      expect(result.moduleCompleted).toBe(videoNumber === 4)
    }
    const afterModule1 = await overview.execute(learner)
    expect(afterModule1.progress.modules.map((m) => m.status)).toEqual([
      'completed',
      'available',
      'locked',
    ])

    for (let videoNumber = 5; videoNumber <= 12; videoNumber++) {
      await watchWholeVideo(kit, learner, videoNumber)
      const result = await passVideoQuiz(kit, learner, videoNumber)
      expect(result.finalExamUnlocked).toBe(videoNumber === 12)
    }

    const exam = await new StartFinalExam(kit.deps).execute(learner)
    expect(exam.questions).toHaveLength(15)
    expect(exam.minimumCorrect).toBe(11)

    const result = await new SubmitFinalExam(kit.deps).execute(learner, {
      attemptId: exam.attemptId,
      answers: kit.correctAnswers(exam.questions.map((q) => q.id)),
    })
    expect(result).toMatchObject({ passed: true, correctCount: 15, totalCount: 15 })
    expect(result.certificate).not.toBeNull()

    const certificate = result.certificate!
    expect(certificate).toMatchObject({
      learnerName: 'Ana Paula Souza',
      companyName: 'Acme Ltda',
      trackTitle: 'Treinamento LGPD',
      workloadMinutes: 60,
      expiresAt: null,
    })
    expect(kit.notifier.sent).toEqual([{ certificate, email: learner.email }])

    const finished = await overview.execute(learner)
    expect(finished.progress.completionPercent).toBe(100)
    expect(finished.progress.nextStep).toEqual({ type: 'certificate' })
    expect(finished.examEligibility).toEqual({ canStart: false, reason: 'already_passed' })

    const verification = await new VerifyCertificate(kit.deps).execute(
      certificate.verificationCode.toLowerCase(),
    )
    expect(verification).toMatchObject({ status: 'valid', learnerName: 'Ana P. S.' })
    expect(JSON.stringify(verification)).not.toContain(learner.email)
    expect(JSON.stringify(verification)).not.toContain('Acme')

    const report = await new GetCompanyTrainingReport(kit.deps).execute(learner.companyId)
    expect(report.rows).toHaveLength(1)
    expect(report.rows[0]).toMatchObject({
      learnerName: 'Ana Paula Souza',
      status: 'completed',
      completionPercent: 100,
      completedModules: 3,
      bestExamScore: 1,
      certificateCode: certificate.verificationCode,
    })

    expect(kit.audit.actions()).toEqual(
      expect.arrayContaining([
        'training.enrolled',
        'training.video_started',
        'training.video_completed',
        'training.quiz_passed',
        'training.final_exam_started',
        'training.final_exam_passed',
        'training.certificate_issued',
      ]),
    )
  })

  it('fails the exam below 70%, then draws a new paper on the retry', async () => {
    const kit = createTrainingTestKit()
    await completeAllVideos(kit, learner)

    const first = await new StartFinalExam(kit.deps).execute(learner)
    const ids = first.questions.map((q) => q.id)
    const answers = {
      ...kit.wrongAnswers(ids.slice(0, 5)),
      ...kit.correctAnswers(ids.slice(5)),
    }
    const failed = await new SubmitFinalExam(kit.deps).execute(learner, {
      attemptId: first.attemptId,
      answers,
    })
    expect(failed).toMatchObject({ passed: false, correctCount: 10, certificate: null })
    expect(failed.review).toHaveLength(15)
    expect(failed.review.filter((item) => !item.isCorrect)).toHaveLength(5)
    expect(kit.notifier.sent).toHaveLength(0)

    const second = await new StartFinalExam(kit.deps).execute(learner)
    expect(second.attemptId).not.toBe(first.attemptId)
    expect(second.questions.map((q) => q.id)).not.toEqual(ids)
  })

  it('resumes the open exam attempt instead of drawing again', async () => {
    const kit = createTrainingTestKit()
    await completeAllVideos(kit, learner)
    const first = await new StartFinalExam(kit.deps).execute(learner)
    const again = await new StartFinalExam(kit.deps).execute(learner)
    expect(again.attemptId).toBe(first.attemptId)
    expect(again.questions).toEqual(first.questions)
  })

  it('rejects a second submission of the same attempt', async () => {
    const kit = createTrainingTestKit()
    await completeAllVideos(kit, learner)
    const exam = await new StartFinalExam(kit.deps).execute(learner)
    const input = {
      attemptId: exam.attemptId,
      answers: kit.wrongAnswers(exam.questions.map((q) => q.id)),
    }
    await new SubmitFinalExam(kit.deps).execute(learner, input)
    await expect(new SubmitFinalExam(kit.deps).execute(learner, input)).rejects.toMatchObject({
      code: 'ALREADY_SUBMITTED',
    })
  })

  it('enforces the configured attempt limit', async () => {
    const kit = createTrainingTestKit({ finalExamMaxAttempts: 1 })
    await completeAllVideos(kit, learner)
    const exam = await new StartFinalExam(kit.deps).execute(learner)
    expect(exam.remainingAttempts).toBe(1)
    await new SubmitFinalExam(kit.deps).execute(learner, {
      attemptId: exam.attemptId,
      answers: kit.wrongAnswers(exam.questions.map((q) => q.id)),
    })
    await expect(new StartFinalExam(kit.deps).execute(learner)).rejects.toMatchObject({
      code: 'ATTEMPTS_EXHAUSTED',
    })
  })

  it('applies the configured certificate validity', async () => {
    const kit = createTrainingTestKit({ certificateValidityMonths: 12 })
    await completeAllVideos(kit, learner)
    const exam = await new StartFinalExam(kit.deps).execute(learner)
    const { certificate } = await new SubmitFinalExam(kit.deps).execute(learner, {
      attemptId: exam.attemptId,
      answers: kit.correctAnswers(exam.questions.map((q) => q.id)),
    })
    expect(certificate!.expiresAt!.toISOString()).toBe('2027-10-14T12:00:00.000Z')

    kit.clock.advance(400 * 24 * 60 * 60 * 1000)
    const verification = await new VerifyCertificate(kit.deps).execute(
      certificate!.verificationCode,
    )
    expect(verification.status).toBe('expired')
  })
})
