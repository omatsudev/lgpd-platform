'use server'

import * as admin from '@/lib/training/infrastructure/supabase/training-content-admin'
import { isTrainingContentAdmin } from '@/lib/training/infrastructure/session'
import { getUserCompany } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function assertContentAdmin() {
  const { companyId, role } = await getUserCompany()
  if (!isTrainingContentAdmin(companyId, role)) {
    throw new Error('Not authorized')
  }
}

type OptionInput = { id?: string; label: string; feedback: string | null; correct: boolean }

// ─── Trilha ─────────────────────────────────────────────────────────────

export async function saveTrack(data: {
  id: string
  title: string
  description: string
  video_quiz_pass_ratio: number
  final_exam_pass_ratio: number
  final_exam_max_attempts: number | null
  workload_minutes: number
  certificate_validity_months: number | null
}) {
  await assertContentAdmin()
  const { id, ...fields } = data
  await admin.updateTrack(id, fields)
  revalidatePath('/trainings/admin')
}

// ─── Módulos ────────────────────────────────────────────────────────────

export async function saveModule(data: {
  id?: string
  trackId: string
  title: string
  objective: string
  final_exam_question_count: number
}) {
  await assertContentAdmin()
  if (data.id) {
    await admin.updateModule(data.id, {
      title: data.title,
      objective: data.objective,
      final_exam_question_count: data.final_exam_question_count,
    })
    revalidatePath('/trainings/admin')
    revalidatePath(`/trainings/admin/modules/${data.id}`)
    redirect(`/trainings/admin/modules/${data.id}`)
  } else {
    const id = await admin.createModule(data.trackId, {
      title: data.title,
      objective: data.objective,
      final_exam_question_count: data.final_exam_question_count,
    })
    revalidatePath('/trainings/admin')
    redirect(`/trainings/admin/modules/${id}`)
  }
}

export async function deleteModule(formData: FormData) {
  await assertContentAdmin()
  const id = formData.get('id') as string
  await admin.deleteModule(id)
  revalidatePath('/trainings/admin')
  redirect('/trainings/admin')
}

export async function moveModule(formData: FormData) {
  await assertContentAdmin()
  const id = formData.get('id') as string
  const direction = formData.get('direction') as 'up' | 'down'
  await admin.moveModule(id, direction)
  revalidatePath('/trainings/admin')
}

// ─── Vídeos ─────────────────────────────────────────────────────────────

export async function saveVideo(data: {
  id?: string
  moduleId: string
  title: string
  key_message: string
  duration_seconds: number
  video_url: string
  captions_url: string
  transcript: string
  status: 'draft' | 'published'
  min_watch_ratio: number
}) {
  await assertContentAdmin()
  const fields = {
    title: data.title,
    key_message: data.key_message,
    duration_seconds: data.duration_seconds,
    video_url: data.video_url || null,
    captions_url: data.captions_url || null,
    transcript: data.transcript || null,
    status: data.status,
    min_watch_ratio: data.min_watch_ratio,
  }
  if (data.id) {
    await admin.updateVideo(data.id, fields)
    revalidatePath(`/trainings/admin/modules/${data.moduleId}`)
    revalidatePath(`/trainings/admin/videos/${data.id}`)
    redirect(`/trainings/admin/videos/${data.id}`)
  } else {
    const id = await admin.createVideo(data.moduleId, fields)
    revalidatePath(`/trainings/admin/modules/${data.moduleId}`)
    redirect(`/trainings/admin/videos/${id}`)
  }
}

export async function deleteVideo(formData: FormData) {
  await assertContentAdmin()
  const id = formData.get('id') as string
  const moduleId = formData.get('moduleId') as string
  await admin.deleteVideo(id)
  revalidatePath(`/trainings/admin/modules/${moduleId}`)
  redirect(`/trainings/admin/modules/${moduleId}`)
}

export async function moveVideo(formData: FormData) {
  await assertContentAdmin()
  const id = formData.get('id') as string
  const moduleId = formData.get('moduleId') as string
  const direction = formData.get('direction') as 'up' | 'down'
  await admin.moveVideo(id, direction)
  revalidatePath(`/trainings/admin/modules/${moduleId}`)
}

// ─── Perguntas ──────────────────────────────────────────────────────────

export async function saveQuestion(data: {
  id?: string
  trackId: string
  kind: 'video_quiz' | 'final_exam'
  videoId: string | null
  moduleId: string | null
  type: 'single_choice' | 'true_false' | 'multiple_choice'
  difficulty: 'easy' | 'medium' | 'hard' | null
  prompt: string
  explanation: string
  options: OptionInput[]
}) {
  await assertContentAdmin()
  const parentPath =
    data.kind === 'video_quiz'
      ? `/trainings/admin/videos/${data.videoId}`
      : `/trainings/admin/modules/${data.moduleId}`

  if (data.id) {
    await admin.updateQuestion(data.id, {
      type: data.type,
      difficulty: data.difficulty,
      prompt: data.prompt,
      explanation: data.explanation,
      options: data.options,
    })
  } else {
    await admin.createQuestion({
      trackId: data.trackId,
      kind: data.kind,
      videoId: data.videoId,
      moduleId: data.moduleId,
      type: data.type,
      difficulty: data.difficulty,
      prompt: data.prompt,
      explanation: data.explanation,
      options: data.options,
    })
  }
  revalidatePath(parentPath)
  redirect(parentPath)
}

export async function setQuestionActive(formData: FormData) {
  await assertContentAdmin()
  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'
  const parentPath = formData.get('parentPath') as string
  await admin.setQuestionActive(id, active)
  revalidatePath(parentPath)
}
