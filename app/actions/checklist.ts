'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SaveResult = { ok: true } | { ok: false; error: string }

export async function atualizarItemChecklist(formData: FormData): Promise<SaveResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const company_id      = formData.get('company_id')      as string
  const item_key        = formData.get('item_key')         as string
  const category        = formData.get('category')         as string
  const status          = formData.get('status')           as string
  const notes           = formData.get('notes')            as string
  const responsible     = formData.get('responsible')      as string
  const completion_date = formData.get('completion_date')  as string

  if (!company_id || !item_key || !category || !status) {
    return { ok: false, error: `Campos obrigatórios ausentes (company_id=${company_id} key=${item_key} cat=${category} status=${status})` }
  }

  const { error } = await supabase.from('checklist_items').upsert(
    {
      company_id,
      item_key,
      category,
      status,
      notes:           notes           || null,
      responsible:     responsible     || null,
      completion_date: completion_date || null,
      updated_by:      user.id,
      updated_at:      new Date().toISOString(),
    },
    { onConflict: 'company_id,item_key' }
  )

  if (error) return { ok: false, error: error.message }

  // Revalida apenas o relatório — o estado do checklist é gerenciado client-side
  revalidatePath('/relatorio')
  return { ok: true }
}
