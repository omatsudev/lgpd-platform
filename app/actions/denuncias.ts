'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function atualizarDenuncia(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const resposta = formData.get('resposta') as string | null

  await supabase
    .from('denuncias')
    .update({
      status,
      resposta: resposta || null,
      respondido_por: user.id,
    })
    .eq('id', id)

  revalidatePath('/denuncias')
  redirect('/denuncias')
}
