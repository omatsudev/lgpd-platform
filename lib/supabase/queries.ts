import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const getUserCompany = cache(async function getUserCompany() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return { user: null, company: null, companyId: null, role: null, companies: [], supabase }

  const { data: ucRows } = await supabase
    .from('user_companies')
    .select('company_id, role')
    .eq('user_id', user.id)
    .order('created_at')

  if (!ucRows?.length) {
    return { user, company: null, companyId: null, role: null, companies: [], supabase }
  }

  // Lê empresa selecionada via cookie (para DPOs que gerenciam múltiplas empresas)
  const cookieStore = await cookies()
  const selectedId = cookieStore.get('selected_company_id')?.value

  const targetUc = (selectedId && ucRows.find((uc) => uc.company_id === selectedId)) || ucRows[0]

  const { data: company } = await supabase
    .from('companies')
    .select(
      'id, name, tax_id, slug, sector, dpo_name, dpo_email, dpo_phone, compliance_score, privacy_policy_url, created_at, updated_at',
    )
    .eq('id', targetUc.company_id)
    .single()

  // Busca nomes de todas as empresas para o seletor
  const { data: allCompanies } = await supabase
    .from('companies')
    .select('id, name')
    .in(
      'id',
      ucRows.map((uc) => uc.company_id),
    )

  return {
    user,
    company: company ?? null,
    companyId: targetUc.company_id,
    role: targetUc.role as string,
    companies: (allCompanies ?? []) as { id: string; name: string }[],
    supabase,
  }
})
