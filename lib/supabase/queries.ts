import { createClient } from '@/lib/supabase/server'

export async function getUserCompany() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { user: null, company: null, companyId: null, supabase }

  const { data } = await supabase
    .from('user_companies')
    .select(`
      company_id,
      role,
      companies (
        id, name, tax_id, slug, sector,
        dpo_name, dpo_email, dpo_phone,
        compliance_score, privacy_policy_url,
        created_at, updated_at
      )
    `)
    .eq('user_id', user.id)
    .order('created_at')
    .limit(1)
    .single()

  return {
    user,
    company: (data?.companies as any) ?? null,
    companyId: data?.company_id ?? null,
    supabase,
  }
}
