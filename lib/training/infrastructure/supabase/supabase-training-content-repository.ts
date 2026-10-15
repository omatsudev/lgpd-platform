import type { SupabaseClient } from '@supabase/supabase-js'
import type { TrainingContentRepository } from '../../application/ports'
import type { AnswerKey, Question, TrainingTrack } from '../../domain/types'
import { toQuestion, toTrack } from './row-mappers'

// Qualifica a constraint explicitamente: além da relação direta, existe um
// caminho many-to-many indireto via training_answer_keys (question_id +
// option_id), o que deixa "training_question_options(*)" sem qualificação
// ambíguo pro PostgREST (erro PGRST201).
const QUESTION_COLUMNS =
  '*, training_question_options!training_question_options_question_id_fkey(*)'

export class SupabaseTrainingContentRepository implements TrainingContentRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getTrackBySlug(slug: string): Promise<TrainingTrack | null> {
    const { data, error } = await this.client
      .from('training_tracks')
      .select('*, training_modules(*, training_videos(*))')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return data ? toTrack(data) : null
  }

  async listVideoQuizQuestions(videoId: string): Promise<Question[]> {
    const { data, error } = await this.client
      .from('training_questions')
      .select(QUESTION_COLUMNS)
      .eq('kind', 'video_quiz')
      .eq('video_id', videoId)
      .eq('active', true)
      .order('code')
    if (error) throw error
    return data.map(toQuestion)
  }

  async listFinalExamBank(trackId: string): Promise<Question[]> {
    const { data, error } = await this.client
      .from('training_questions')
      .select(QUESTION_COLUMNS)
      .eq('kind', 'final_exam')
      .eq('track_id', trackId)
      .eq('active', true)
    if (error) throw error
    return data.map(toQuestion)
  }

  async getQuestionsByIds(questionIds: readonly string[]): Promise<Question[]> {
    if (questionIds.length === 0) return []
    const { data, error } = await this.client
      .from('training_questions')
      .select(QUESTION_COLUMNS)
      .in('id', [...questionIds])
    if (error) throw error
    return data.map(toQuestion)
  }

  async getAnswerKey(questionIds: readonly string[]): Promise<AnswerKey> {
    const key: AnswerKey = new Map()
    if (questionIds.length === 0) return key
    const { data, error } = await this.client
      .from('training_answer_keys')
      .select('question_id, option_id')
      .in('question_id', [...questionIds])
    if (error) throw error
    for (const row of data) {
      key.set(row.question_id, [...(key.get(row.question_id) ?? []), row.option_id])
    }
    return key
  }
}
