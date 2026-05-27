'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function atualizarItemChecklist(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const company_id      = formData.get('company_id')      as string
  const item_key        = formData.get('item_key')         as string
  const category        = formData.get('category')         as string  // era 'categoria' — bug
  const status          = formData.get('status')           as string
  const notes           = formData.get('notes')            as string  // era 'observacao'
  const responsible     = formData.get('responsible')      as string  // era 'responsavel'
  const completion_date = formData.get('completion_date')  as string  // era 'data_conclusao'

  if (!company_id || !item_key || !category || !status) {
    throw new Error(`Campos obrigatórios ausentes: company_id=${company_id} item_key=${item_key} category=${category} status=${status}`)
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

  if (error) throw new Error(error.message)

  revalidatePath('/checklist')
  revalidatePath('/relatorio')
}
