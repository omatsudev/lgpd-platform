'use server'

import { TrainingError } from '@/lib/training/domain/errors'
import type { SubmittedAnswers, WatchSegment } from '@/lib/training/domain/types'
import { requireLearnerContext } from '@/lib/training/infrastructure/session'
import { createTrainingModule } from '@/lib/training/infrastructure/training-module'
import { redirect } from 'next/navigation'
import { z } from 'zod'

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string }

const ERROR_MESSAGES: Record<TrainingError['code'], string> = {
  NOT_FOUND: 'Conteúdo não encontrado.',
  LOCKED: 'Conclua a etapa anterior para liberar este conteúdo.',
  FORBIDDEN: 'Você não tem acesso a este conteúdo.',
  INVALID_INPUT: 'Responda todas as perguntas antes de enviar.',
  ATTEMPTS_EXHAUSTED: 'Você não tem mais tentativas disponíveis na avaliação final.',
  ALREADY_SUBMITTED: 'Esta tentativa já foi enviada.',
  INSUFFICIENT_QUESTION_BANK: 'A avaliação final está indisponível no momento.',
}

async function run<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await action() }
  } catch (error) {
    if (error instanceof TrainingError) return { ok: false, error: ERROR_MESSAGES[error.code] }
    console.error('[training] action failed', error)
    return { ok: false, error: 'Não foi possível salvar agora. Tente novamente.' }
  }
}

const idSchema = z.uuid()
const answersSchema = z.record(z.uuid(), z.array(z.uuid()).min(1).max(10))
const segmentsSchema = z.array(z.object({ start: z.number(), end: z.number() })).max(200)

export async function recordVideoWatchAction(
  videoId: string,
  segments: WatchSegment[],
  positionSeconds: number,
) {
  return run(async () => {
    const context = await requireLearnerContext()
    const training = await createTrainingModule()
    return training.recordVideoWatch.execute(context, {
      videoId: idSchema.parse(videoId),
      segments: segmentsSchema.parse(segments),
      positionSeconds: z.number().nonnegative().parse(positionSeconds),
    })
  })
}

export async function acknowledgePendingVideoAction(formData: FormData) {
  const videoId = idSchema.parse(formData.get('video_id'))
  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  await training.acknowledgePendingVideo.execute(context, videoId)
  redirect(`/trainings/track/videos/${videoId}/quiz`)
}

export async function checkVideoQuizAnswerAction(
  videoId: string,
  questionId: string,
  optionIds: string[],
) {
  return run(async () => {
    const context = await requireLearnerContext()
    const training = await createTrainingModule()
    return training.checkVideoQuizAnswer.execute(context, {
      videoId: idSchema.parse(videoId),
      questionId: idSchema.parse(questionId),
      optionIds: z.array(idSchema).min(1).parse(optionIds),
    })
  })
}

export async function submitVideoQuizAction(videoId: string, answers: SubmittedAnswers) {
  return run(async () => {
    const context = await requireLearnerContext()
    const training = await createTrainingModule()
    return training.submitVideoQuiz.execute(context, {
      videoId: idSchema.parse(videoId),
      answers: answersSchema.parse(answers),
    })
  })
}

export async function startFinalExamAction() {
  const context = await requireLearnerContext()
  const training = await createTrainingModule()
  try {
    await training.startFinalExam.execute(context)
  } catch (error) {
    if (!(error instanceof TrainingError)) throw error
  }
  redirect('/trainings/track/exam')
}

export async function submitFinalExamAction(attemptId: string, answers: SubmittedAnswers) {
  return run(async () => {
    const context = await requireLearnerContext()
    const training = await createTrainingModule()
    return training.submitFinalExam.execute(context, {
      attemptId: idSchema.parse(attemptId),
      answers: answersSchema.parse(answers),
    })
  })
}
