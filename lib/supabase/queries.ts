import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const getUserCompany = cache(async function getUserCompany() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user)
    return {
      user: null,
      company: null,
      companyId: null,
      role: null,
      companies: [],
      hasInactiveCompanies: false,
      supabase,
    }

  const { data: ucRows } = await supabase
    .from('user_companies')
    .select('company_id, role')
    .eq('user_id', user.id)
    .order('created_at')

  if (!ucRows?.length) {
    const fallbackRole = (user.user_metadata?.role as string | undefined) ?? null
    return {
      user,
      company: null,
      companyId: null,
      role: fallbackRole,
      companies: [],
      hasInactiveCompanies: false,
      supabase,
    }
  }

  // Só empresas ativas (não desativadas via soft delete) contam para a navegação atual.
  const { data: activeCompanies } = await supabase
    .from('companies')
    .select('id, name')
    .in(
      'id',
      ucRows.map((uc) => uc.company_id),
    )
    .is('deleted_at', null)

  const activeIds = new Set((activeCompanies ?? []).map((c) => c.id))
  const activeUcRows = ucRows.filter((uc) => activeIds.has(uc.company_id))
  const hasInactiveCompanies = activeUcRows.length < ucRows.length

  if (!activeUcRows.length) {
    const fallbackRole = (user.user_metadata?.role as string | undefined) ?? null
    return {
      user,
      company: null,
      companyId: null,
      role: fallbackRole,
      companies: (activeCompanies ?? []) as { id: string; name: string }[],
      hasInactiveCompanies,
      supabase,
    }
  }

  // Lê empresa selecionada via cookie (para DPOs que gerenciam múltiplas empresas)
  const cookieStore = await cookies()
  const selectedId = cookieStore.get('selected_company_id')?.value

  const targetUc =
    (selectedId && activeUcRows.find((uc) => uc.company_id === selectedId)) || activeUcRows[0]

  const { data: company } = await supabase
    .from('companies')
    .select(
      'id, name, tax_id, slug, sector, owner_id, dpo_name, dpo_email, dpo_phone, compliance_score, privacy_policy_url, created_at, updated_at',
    )
    .eq('id', targetUc.company_id)
    .single()

  const allCompanies = activeCompanies

  // user_metadata.role (definido no cadastro: 'dpo' | 'company') tem precedência
  // sobre user_companies.role ('admin') para determinar o perfil de navegação
  const metaRole = user.user_metadata?.role as string | undefined
  const effectiveRole = metaRole ?? (targetUc.role as string)

  return {
    user,
    company: company ?? null,
    companyId: targetUc.company_id,
    role: effectiveRole,
    companies: (allCompanies ?? []) as { id: string; name: string }[],
    hasInactiveCompanies,
    supabase,
  }
})
