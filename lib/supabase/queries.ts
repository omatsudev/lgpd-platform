import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getUserCompany = cache(async function getUserCompany() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, company: null, companyId: null, supabase }

  const { data: ucData } = await supabase
    .from('user_companies')
    .select('company_id, role')
    .eq('user_id', user.id)
    .order('created_at')
    .limit(1)
    .single()

  if (!ucData?.company_id) {
    return { user, company: null, companyId: null, supabase }
  }

  const { data: company } = await supabase
    .from('companies')
    .select('id, name, tax_id, slug, sector, dpo_name, dpo_email, dpo_phone, compliance_score, privacy_policy_url, created_at, updated_at')
    .eq('id', ucData.company_id)
    .single()

  return {
    user,
    company: company ?? null,
    companyId: ucData.company_id,
    supabase,
  }
})
