'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function salvarEmpresa(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string | null
  const name = formData.get('name') as string
  const tax_id = formData.get('tax_id') as string | null
  const sector = formData.get('sector') as string | null
  const slug = formData.get('slug') as string

  const payload = {
    name,
    tax_id: tax_id || null,
    sector: sector || null,
    slug,
  }

  if (id) {
    await supabase.from('companies').update(payload).eq('id', id)
    revalidatePath('/empresas')
    redirect('/empresas')
  } else {
    const { data } = await supabase
      .from('companies')
      .insert({ ...payload, owner_id: user.id })
      .select('id')
      .single()

    if (data) {
      await supabase.from('user_companies').insert({
        user_id: user.id,
        company_id: data.id,
        role: 'admin',
      })
    }

    revalidatePath('/empresas')
    redirect('/empresas')
  }
}
