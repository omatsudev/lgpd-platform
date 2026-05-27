'use server'

import { getUserCompany } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveCompanyData(formData: FormData) {
  const supabase = await createClient()
  const { user, companyId } = await getUserCompany()
  if (!user || !companyId) throw new Error('Not authenticated')

  await supabase
    .from('companies')
    .update({
      name: formData.get('name') as string,
      tax_id: (formData.get('tax_id') as string) || null,
      sector: (formData.get('sector') as string) || null,
      slug: formData.get('slug') as string,
    })
    .eq('id', companyId)

  revalidatePath('/settings')
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
