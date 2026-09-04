'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveCompany(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string | null
  const name = (formData.get('name') as string).trim()
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
    const { data: existing } = await supabase
      .from('companies')
      .select('owner_id')
      .eq('id', id)
      .single()
    const ownerId = existing?.owner_id ?? user.id

    const { data: duplicate } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .neq('id', id)
      .ilike('name', name)
      .maybeSingle()
    if (duplicate) redirect(`/companies/${id}?error=duplicate_name`)

    await supabase.from('companies').update(payload).eq('id', id)
    revalidatePath('/companies')
    redirect('/companies')
  } else {
    const { data: duplicate } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .is('deleted_at', null)
      .ilike('name', name)
      .maybeSingle()
    if (duplicate) redirect('/companies/new?error=duplicate_name')

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

    revalidatePath('/companies')
    redirect('/companies')
  }
}
