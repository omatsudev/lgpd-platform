'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ConsentPurposeData = {
  id?: string
  company_id: string
  name: string
  description: string
  legal_basis: string
  required: boolean
  active: boolean
}

export async function savePurpose(data: ConsentPurposeData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    company_id: data.company_id,
    name: data.name,
    description: data.description,
    legal_basis: data.legal_basis,
    required: data.required,
    active: data.active,
  }

  if (data.id) {
    await supabase.from('consent_purposes').update(payload).eq('id', data.id)
  } else {
    await supabase.from('consent_purposes').insert(payload)
  }

  revalidatePath('/consents')
  redirect('/consents')
}

export async function deletePurpose(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('consent_purposes').delete().eq('id', id)

  revalidatePath('/consents')
  redirect('/consents')
}

export async function revokeConsent(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  const reason = formData.get('reason') as string

  await supabase
    .from('consents')
    .update({
      revoked: true,
      revoked_at: new Date().toISOString(),
      revocation_reason: reason || null,
    })
    .eq('id', id)

  revalidatePath('/consents')
}
