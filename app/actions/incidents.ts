'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type IncidentData = {
  id?: string
  company_id: string
  title: string
  type: string
  severity: string
  status: string
  occurrence_date: string
  discovery_date: string
  description: string
  affected_data: string
  affected_data_categories: string[]
  affected_subjects_count: string
  root_cause: string
  immediate_measures: string
  corrective_measures: string
  responsible: string
  notified_anpd: boolean
  anpd_notification_date: string
  anpd_protocol: string
  notified_subjects: boolean
  subjects_notification_date: string
  operadores_envolvidos: string
  relatorio_impacto: string
}

export async function saveIncident(data: IncidentData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    company_id: data.company_id,
    title: data.title,
    type: data.type,
    severity: data.severity,
    status: data.status,
    occurrence_date: data.occurrence_date || null,
    discovery_date: data.discovery_date,
    description: data.description,
    affected_data: data.affected_data || null,
    affected_data_categories: data.affected_data_categories,
    affected_subjects_count: data.affected_subjects_count || null,
    root_cause: data.root_cause || null,
    immediate_measures: data.immediate_measures || null,
    corrective_measures: data.corrective_measures || null,
    responsible: data.responsible || null,
    notified_anpd: data.notified_anpd,
    anpd_notification_date: data.anpd_notification_date || null,
    anpd_protocol: data.anpd_protocol || null,
    notified_subjects: data.notified_subjects,
    subjects_notification_date: data.subjects_notification_date || null,
    operadores_envolvidos: data.operadores_envolvidos || null,
    relatorio_impacto: data.relatorio_impacto || null,
  }

  if (data.id) {
    await supabase.from('incidents').update(payload).eq('id', data.id)
  } else {
    await supabase.from('incidents').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/incidents')
  redirect('/incidents')
}

export async function deleteIncident(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('incidents').delete().eq('id', id)

  revalidatePath('/incidents')
  redirect('/incidents')
}
