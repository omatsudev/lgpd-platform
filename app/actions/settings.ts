'use server'

import { getUserCompany } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveCompanyData(formData: FormData) {
  const supabase = await createClient()
  const { user, companyId, company } = await getUserCompany()
  if (!user || !companyId) throw new Error('Not authenticated')

  const name = (formData.get('name') as string).trim()
  const ownerId = company?.owner_id ?? user.id

  const { data: duplicate } = await supabase
    .from('companies')
    .select('id')
    .eq('owner_id', ownerId)
    .is('deleted_at', null)
    .neq('id', companyId)
    .ilike('name', name)
    .maybeSingle()
  if (duplicate) redirect('/settings?company_error=duplicate_name')

  await supabase
    .from('companies')
    .update({
      name,
      tax_id: (formData.get('tax_id') as string) || null,
      sector: (formData.get('sector') as string) || null,
      slug: formData.get('slug') as string,
    })
    .eq('id', companyId)

  revalidatePath('/settings')
  redirect('/settings?company_ok=1')
}

export async function saveDpo(formData: FormData) {
  const supabase = await createClient()
  const { user, companyId } = await getUserCompany()
  if (!user || !companyId) throw new Error('Not authenticated')

  await supabase
    .from('companies')
    .update({
      dpo_name: (formData.get('dpo_name') as string) || null,
      dpo_email: (formData.get('dpo_email') as string) || null,
      dpo_phone: (formData.get('dpo_phone') as string) || null,
    })
    .eq('id', companyId)

  revalidatePath('/settings')
}

export async function savePrivacyPolicy(formData: FormData) {
  const supabase = await createClient()
  const { user, companyId } = await getUserCompany()
  if (!user || !companyId) throw new Error('Not authenticated')

  await supabase
    .from('companies')
    .update({
      privacy_policy_url: (formData.get('privacy_policy_url') as string) || null,
    })
    .eq('id', companyId)

  revalidatePath('/settings')
}
