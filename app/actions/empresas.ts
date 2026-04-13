'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function salvarEmpresa(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string | null
  const nome = formData.get('nome') as string
  const cnpj = formData.get('cnpj') as string | null
  const setor = formData.get('setor') as string | null
  const slug = formData.get('slug') as string

  const payload = {
    nome,
    cnpj: cnpj || null,
    setor: setor || null,
    slug,
  }

  if (id) {
    await supabase.from('empresas').update(payload).eq('id', id)
    revalidatePath('/empresas')
    redirect('/empresas')
  } else {
    const { data } = await supabase
      .from('empresas')
      .insert({ ...payload, owner_id: user.id })
      .select('id')
      .single()

    if (data) {
      await supabase.from('user_empresas').insert({
        user_id: user.id,
        empresa_id: data.id,
        role: 'admin',
      })
    }

    revalidatePath('/empresas')
    redirect('/empresas')
  }
}
