'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Tipos ─────────────────────────────────────────────────────────────────

export type RetentionDisposalData = {
  id?: string
  company_id: string
  // Identificação
  data_type: string
  category: string
  // Política de retenção
  retention_period: string
  retention_start_event: string
  event_date?: string
  expiration_date?: string
  legal_basis: string
  // Prescrição / decadência
  prescription_period?: string
  decadence_period?: string
  // Destinação e bloqueio
  hold_possible: boolean
  final_disposition?: string
  hold_active: boolean
  hold_reason?: string
  // Notas
  notes?: string
}

// ─── Actions ───────────────────────────────────────────────────────────────

export async function saveRetentionDisposal(data: RetentionDisposalData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    company_id: data.company_id,
    data_type: data.data_type,
    category: data.category,
    retention_period: data.retention_period,
    retention_start_event: data.retention_start_event,
    event_date: data.event_date || null,
    expiration_date: data.expiration_date || null,
    legal_basis: data.legal_basis,
    prescription_period: data.prescription_period || null,
    decadence_period: data.decadence_period || null,
    hold_possible: data.hold_possible,
    final_disposition: data.final_disposition || null,
    hold_active: data.hold_active,
    hold_reason: data.hold_reason || null,
    notes: data.notes || null,
  }

  if (data.id) {
    const { error: updateErr } = await supabase.from('retention_disposals').update(payload).eq('id', data.id)
  if (updateErr) throw new Error(`Erro ao atualizar registro: ${updateErr.message}`)
  } else {
    const { error: insertErr } = await supabase.from('retention_disposals').insert({ ...payload, created_by: user.id })
  if (insertErr) throw new Error(`Erro ao criar registro: ${insertErr.message}`)
  }

  revalidatePath('/retention-disposal')
  redirect('/retention-disposal')
}

export async function registerDisposalHold(formData: globalThis.FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  const reason = formData.get('reason') as string

  const { data: item } = await supabase
    .from('retention_disposals')
    .select('action_history')
    .eq('id', id)
    .single()

  const history = (item?.action_history ?? []) as object[]
  history.push({
    acao: 'bloqueio',
    data: new Date().toISOString(),
    usuario: user.id,
    reason,
  })

  await supabase
    .from('retention_disposals')
    .update({ hold_active: true, hold_reason: reason, action_history: history })
    .eq('id', id)

  revalidatePath('/retention-disposal')
  redirect('/retention-disposal')
}

export async function registerDisposal(formData: globalThis.FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  const method = formData.get('method') as string

  const { data: item } = await supabase
    .from('retention_disposals')
    .select('action_history')
    .eq('id', id)
    .single()

  const history = (item?.action_history ?? []) as object[]
  history.push({
    acao: 'descarte',
    data: new Date().toISOString(),
    usuario: user.id,
    method,
  })

  await supabase
    .from('retention_disposals')
    .update({
      action_history: history,
      notes: `Descarte realizado em ${new Date().toLocaleDateString('pt-BR')} — método: ${method}`,
    })
    .eq('id', id)

  revalidatePath('/retention-disposal')
  redirect('/retention-disposal')
}

export async function deleteRetentionDisposal(formData: globalThis.FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('retention_disposals').delete().eq('id', id)

  revalidatePath('/retention-disposal')
  redirect('/retention-disposal')
}
