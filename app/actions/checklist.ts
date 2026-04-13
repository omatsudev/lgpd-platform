'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function atualizarItemChecklist(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const empresa_id = formData.get('empresa_id') as string
  const item_key = formData.get('item_key') as string
  const categoria = formData.get('categoria') as string
  const status = formData.get('status') as string
  const observacao = formData.get('observacao') as string
  const responsavel = formData.get('responsavel') as string
  const data_conclusao = formData.get('data_conclusao') as string

  await supabase.from('checklist_itens').upsert(
    {
      empresa_id,
      item_key,
      categoria,
      status,
      observacao: observacao || null,
      responsavel: responsavel || null,
      data_conclusao: data_conclusao || null,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'empresa_id,item_key' }
  )

  revalidatePath('/checklist')
}
