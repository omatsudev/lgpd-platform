'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function atualizarItemChecklist(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const company_id = formData.get('company_id') as string
  const item_key = formData.get('item_key') as string
  const category = formData.get('categoria') as string
  const status = formData.get('status') as string
  const notes = formData.get('observacao') as string
  const responsible = formData.get('responsavel') as string
  const completion_date = formData.get('data_conclusao') as string

  await supabase.from('checklist_items').upsert(
    {
      company_id,
      item_key,
      category,
      status,
      notes: notes || null,
      responsible: responsible || null,
      completion_date: completion_date || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'company_id,item_key' }
  )

  revalidatePath('/checklist')
  revalidatePath('/relatorio')
}
