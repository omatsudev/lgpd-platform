import 'server-only'

import { getServiceClient } from './service-client'

// Acesso de escrita ao conteúdo da trilha (módulos, vídeos, perguntas) para o
// painel administrativo. Usa a service role, assim como as leituras em
// supabase-training-content-repository.ts — a permissão de quem pode chamar
// essas funções é checada antes, em app/actions/training-admin.ts
// (isTrainingContentAdmin), não aqui.

export type TrackRow = {
  id: string
  slug: string
  title: string
  description: string
  video_quiz_pass_ratio: number
  final_exam_pass_ratio: number
  final_exam_max_attempts: number | null
  workload_minutes: number
  certificate_validity_months: number | null
}

export type ModuleRow = {
  id: string
  track_id: string
  position: number
  title: string
  objective: string
  final_exam_question_count: number
}

export type VideoRow = {
  id: string
  module_id: string
  position: number
  title: string
  key_message: string
  duration_seconds: number
  video_url: string | null
  captions_url: string | null
  transcript: string | null
  status: 'draft' | 'published'
  min_watch_ratio: number
}

export type OptionRow = {
  id: string
  question_id: string
  position: number
  label: string
  feedback: string | null
}

export type QuestionRow = {
  id: string
  track_id: string
  code: string
  kind: 'video_quiz' | 'final_exam'
  type: 'single_choice' | 'true_false' | 'multiple_choice'
  video_id: string | null
  module_id: string | null
  difficulty: 'easy' | 'medium' | 'hard' | null
  prompt: string
  explanation: string
  active: boolean
}

export type QuestionWithOptions = QuestionRow & {
  options: OptionRow[]
  correctOptionIds: string[]
}

// ─── Trilha ─────────────────────────────────────────────────────────────

export async function getAdminTrack(): Promise<TrackRow | null> {
  const { data, error } = await getServiceClient().from('training_tracks').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data
}

export async function updateTrack(
  trackId: string,
  fields: Partial<
    Pick<
      TrackRow,
      | 'title'
      | 'description'
      | 'video_quiz_pass_ratio'
      | 'final_exam_pass_ratio'
      | 'final_exam_max_attempts'
      | 'workload_minutes'
      | 'certificate_validity_months'
    >
  >,
): Promise<void> {
  const { error } = await getServiceClient().from('training_tracks').update(fields).eq('id', trackId)
  if (error) throw error
}

// ─── Módulos ────────────────────────────────────────────────────────────

export async function listModules(trackId: string): Promise<ModuleRow[]> {
  const { data, error } = await getServiceClient()
    .from('training_modules')
    .select('*')
    .eq('track_id', trackId)
    .order('position')
  if (error) throw error
  return data
}

export async function getModule(moduleId: string): Promise<ModuleRow | null> {
  const { data, error } = await getServiceClient()
    .from('training_modules')
    .select('*')
    .eq('id', moduleId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createModule(
  trackId: string,
  fields: { title: string; objective: string; final_exam_question_count: number },
): Promise<string> {
  const client = getServiceClient()
  const { data: existing, error: existingError } = await client
    .from('training_modules')
    .select('position')
    .eq('track_id', trackId)
    .order('position', { ascending: false })
    .limit(1)
  if (existingError) throw existingError
  const nextPosition = (existing?.[0]?.position ?? 0) + 1

  const { data, error } = await client
    .from('training_modules')
    .insert({ track_id: trackId, position: nextPosition, ...fields })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateModule(
  moduleId: string,
  fields: Partial<Pick<ModuleRow, 'title' | 'objective' | 'final_exam_question_count'>>,
): Promise<void> {
  const { error } = await getServiceClient().from('training_modules').update(fields).eq('id', moduleId)
  if (error) throw error
}

export async function deleteModule(moduleId: string): Promise<void> {
  const { error } = await getServiceClient().from('training_modules').delete().eq('id', moduleId)
  if (error) throw error
}

export async function moveModule(moduleId: string, direction: 'up' | 'down'): Promise<void> {
  const client = getServiceClient()
  const { data: current, error: currentError } = await client
    .from('training_modules')
    .select('id, track_id, position')
    .eq('id', moduleId)
    .single()
  if (currentError) throw currentError

  const { data: siblings, error: siblingsError } = await client
    .from('training_modules')
    .select('id, position')
    .eq('track_id', current.track_id)
    .order('position')
  if (siblingsError) throw siblingsError

  await swapPosition(client, 'training_modules', current, siblings, direction)
}

// ─── Vídeos ─────────────────────────────────────────────────────────────

export async function listVideos(moduleId: string): Promise<VideoRow[]> {
  const { data, error } = await getServiceClient()
    .from('training_videos')
    .select('*')
    .eq('module_id', moduleId)
    .order('position')
  if (error) throw error
  return data
}

export async function getVideo(videoId: string): Promise<VideoRow | null> {
  const { data, error } = await getServiceClient()
    .from('training_videos')
    .select('*')
    .eq('id', videoId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function createVideo(
  moduleId: string,
  fields: {
    title: string
    key_message: string
    duration_seconds: number
    video_url: string | null
    captions_url: string | null
    transcript: string | null
    status: 'draft' | 'published'
    min_watch_ratio: number
  },
): Promise<string> {
  const client = getServiceClient()
  const { data: existing, error: existingError } = await client
    .from('training_videos')
    .select('position')
    .eq('module_id', moduleId)
    .order('position', { ascending: false })
    .limit(1)
  if (existingError) throw existingError
  const nextPosition = (existing?.[0]?.position ?? 0) + 1

  const { data, error } = await client
    .from('training_videos')
    .insert({ module_id: moduleId, position: nextPosition, ...fields })
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function updateVideo(
  videoId: string,
  fields: Partial<
    Pick<
      VideoRow,
      | 'title'
      | 'key_message'
      | 'duration_seconds'
      | 'video_url'
      | 'captions_url'
      | 'transcript'
      | 'status'
      | 'min_watch_ratio'
    >
  >,
): Promise<void> {
  const { error } = await getServiceClient().from('training_videos').update(fields).eq('id', videoId)
  if (error) throw error
}

export async function deleteVideo(videoId: string): Promise<void> {
  const { error } = await getServiceClient().from('training_videos').delete().eq('id', videoId)
  if (error) throw error
}

export async function moveVideo(videoId: string, direction: 'up' | 'down'): Promise<void> {
  const client = getServiceClient()
  const { data: current, error: currentError } = await client
    .from('training_videos')
    .select('id, module_id, position')
    .eq('id', videoId)
    .single()
  if (currentError) throw currentError

  const { data: siblings, error: siblingsError } = await client
    .from('training_videos')
    .select('id, position')
    .eq('module_id', current.module_id)
    .order('position')
  if (siblingsError) throw siblingsError

  await swapPosition(client, 'training_videos', current, siblings, direction)
}

// Troca a posição do item atual com o vizinho (anterior ou seguinte) na
// mesma lista, usando um valor temporário alto pra não violar a constraint
// unique(parent, position) no meio da troca.
async function swapPosition(
  client: ReturnType<typeof getServiceClient>,
  table: 'training_modules' | 'training_videos',
  current: { id: string; position: number },
  siblings: { id: string; position: number }[],
  direction: 'up' | 'down',
): Promise<void> {
  const index = siblings.findIndex((s) => s.id === current.id)
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  const target = siblings[targetIndex]
  if (!target) return // já está na ponta, nada a fazer

  const TEMP_POSITION = 1_000_000
  const ops = [
    client.from(table).update({ position: TEMP_POSITION }).eq('id', current.id),
    client.from(table).update({ position: current.position }).eq('id', target.id),
    client.from(table).update({ position: target.position }).eq('id', current.id),
  ]
  for (const op of ops) {
    const { error } = await op
    if (error) throw error
  }
}

// ─── Perguntas ──────────────────────────────────────────────────────────

const QUESTION_COLUMNS =
  '*, training_question_options!training_question_options_question_id_fkey(*)'

function mapQuestionWithOptions(row: any): QuestionWithOptions {
  const options = (row.training_question_options as OptionRow[]).sort(
    (a, b) => a.position - b.position,
  )
  const question = { ...row }
  delete question.training_question_options
  return { ...question, options, correctOptionIds: [] }
}

async function attachAnswerKeys(
  client: ReturnType<typeof getServiceClient>,
  questions: QuestionWithOptions[],
): Promise<QuestionWithOptions[]> {
  if (questions.length === 0) return questions
  const { data, error } = await client
    .from('training_answer_keys')
    .select('question_id, option_id')
    .in(
      'question_id',
      questions.map((q) => q.id),
    )
  if (error) throw error
  const byQuestion = new Map<string, string[]>()
  for (const row of data) {
    byQuestion.set(row.question_id, [...(byQuestion.get(row.question_id) ?? []), row.option_id])
  }
  return questions.map((q) => ({ ...q, correctOptionIds: byQuestion.get(q.id) ?? [] }))
}

export async function listVideoQuestions(videoId: string): Promise<QuestionWithOptions[]> {
  const client = getServiceClient()
  const { data, error } = await client
    .from('training_questions')
    .select(QUESTION_COLUMNS)
    .eq('kind', 'video_quiz')
    .eq('video_id', videoId)
    .order('code')
  if (error) throw error
  return attachAnswerKeys(client, data.map(mapQuestionWithOptions))
}

export async function listModuleExamBank(moduleId: string): Promise<QuestionWithOptions[]> {
  const client = getServiceClient()
  const { data, error } = await client
    .from('training_questions')
    .select(QUESTION_COLUMNS)
    .eq('kind', 'final_exam')
    .eq('module_id', moduleId)
    .order('code')
  if (error) throw error
  return attachAnswerKeys(client, data.map(mapQuestionWithOptions))
}

export async function getQuestion(questionId: string): Promise<QuestionWithOptions | null> {
  const client = getServiceClient()
  const { data, error } = await client
    .from('training_questions')
    .select(QUESTION_COLUMNS)
    .eq('id', questionId)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  const [withKey] = await attachAnswerKeys(client, [mapQuestionWithOptions(data)])
  return withKey
}

export type QuestionInput = {
  trackId: string
  kind: 'video_quiz' | 'final_exam'
  videoId: string | null
  moduleId: string | null
  type: 'single_choice' | 'true_false' | 'multiple_choice'
  difficulty: 'easy' | 'medium' | 'hard' | null
  prompt: string
  explanation: string
  options: { id?: string; label: string; feedback: string | null; correct: boolean }[]
}

function generateQuestionCode(kind: 'video_quiz' | 'final_exam'): string {
  const suffix = crypto.randomUUID().slice(0, 8)
  return kind === 'video_quiz' ? `vq-${suffix}` : `fe-${suffix}`
}

export async function createQuestion(input: QuestionInput): Promise<string> {
  const client = getServiceClient()
  const { data: question, error: questionError } = await client
    .from('training_questions')
    .insert({
      track_id: input.trackId,
      code: generateQuestionCode(input.kind),
      kind: input.kind,
      type: input.type,
      video_id: input.videoId,
      module_id: input.moduleId,
      difficulty: input.difficulty,
      prompt: input.prompt,
      explanation: input.explanation,
    })
    .select('id')
    .single()
  if (questionError) throw questionError

  await replaceOptions(client, question.id, input.options)
  return question.id
}

export async function updateQuestion(
  questionId: string,
  input: Omit<QuestionInput, 'trackId' | 'kind' | 'videoId' | 'moduleId'>,
): Promise<void> {
  const client = getServiceClient()
  const { error: questionError } = await client
    .from('training_questions')
    .update({
      type: input.type,
      difficulty: input.difficulty,
      prompt: input.prompt,
      explanation: input.explanation,
    })
    .eq('id', questionId)
  if (questionError) throw questionError

  await replaceOptions(client, questionId, input.options)
}

async function replaceOptions(
  client: ReturnType<typeof getServiceClient>,
  questionId: string,
  options: { id?: string; label: string; feedback: string | null; correct: boolean }[],
): Promise<void> {
  const { data: existingOptions, error: existingError } = await client
    .from('training_question_options')
    .select('id')
    .eq('question_id', questionId)
  if (existingError) throw existingError

  const keptIds = new Set(options.filter((o) => o.id).map((o) => o.id as string))
  const toRemove = (existingOptions ?? []).filter((o) => !keptIds.has(o.id)).map((o) => o.id)
  if (toRemove.length > 0) {
    const { error } = await client.from('training_question_options').delete().in('id', toRemove)
    if (error) throw error
  }

  const optionIds: { id: string; correct: boolean }[] = []
  for (const [index, option] of options.entries()) {
    const position = index + 1
    if (option.id) {
      const { error } = await client
        .from('training_question_options')
        .update({ position, label: option.label, feedback: option.feedback })
        .eq('id', option.id)
      if (error) throw error
      optionIds.push({ id: option.id, correct: option.correct })
    } else {
      const { data, error } = await client
        .from('training_question_options')
        .insert({
          question_id: questionId,
          position,
          label: option.label,
          feedback: option.feedback,
        })
        .select('id')
        .single()
      if (error) throw error
      optionIds.push({ id: data.id, correct: option.correct })
    }
  }

  const { error: clearKeyError } = await client
    .from('training_answer_keys')
    .delete()
    .eq('question_id', questionId)
  if (clearKeyError) throw clearKeyError

  const correctRows = optionIds
    .filter((o) => o.correct)
    .map((o) => ({ question_id: questionId, option_id: o.id }))
  if (correctRows.length > 0) {
    const { error } = await client.from('training_answer_keys').insert(correctRows)
    if (error) throw error
  }
}

export async function setQuestionActive(questionId: string, active: boolean): Promise<void> {
  const { error } = await getServiceClient()
    .from('training_questions')
    .update({ active })
    .eq('id', questionId)
  if (error) throw error
}
