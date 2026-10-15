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
  // Busca os dados completos de todas de uma vez (evita uma segunda consulta
  // depois só para a empresa selecionada).
  const [{ data: activeCompanyRows }, cookieStore] = await Promise.all([
    supabase
      .from('companies')
      .select(
        'id, name, tax_id, slug, sector, owner_id, dpo_name, dpo_email, dpo_phone, compliance_score, privacy_policy_url, plan, trainings_early_access, created_at, updated_at',
      )
      .in(
        'id',
        ucRows.map((uc) => uc.company_id),
      )
      .is('deleted_at', null),
    cookies(),
  ])

  const activeIds = new Set((activeCompanyRows ?? []).map((c) => c.id))
  const activeUcRows = ucRows.filter((uc) => activeIds.has(uc.company_id))
  const hasInactiveCompanies = activeUcRows.length < ucRows.length
  const allCompanies = (activeCompanyRows ?? []).map((c) => ({ id: c.id, name: c.name }))

  if (!activeUcRows.length) {
    const fallbackRole = (user.user_metadata?.role as string | undefined) ?? null
    return {
      user,
      company: null,
      companyId: null,
      role: fallbackRole,
      companies: allCompanies,
      hasInactiveCompanies,
      supabase,
    }
  }

  // Lê empresa selecionada via cookie (para DPOs que gerenciam múltiplas empresas)
  const selectedId = cookieStore.get('selected_company_id')?.value

  const targetUc =
    (selectedId && activeUcRows.find((uc) => uc.company_id === selectedId)) || activeUcRows[0]

  const company = (activeCompanyRows ?? []).find((c) => c.id === targetUc.company_id) ?? null

  // user_metadata.role (definido no cadastro: 'dpo' | 'company') tem precedência
  // sobre user_companies.role ('admin') para determinar o perfil de navegação
  const metaRole = user.user_metadata?.role as string | undefined
  const effectiveRole = metaRole ?? (targetUc.role as string)

  return {
    user,
    company,
    companyId: targetUc.company_id,
    role: effectiveRole,
    companies: allCompanies,
    hasInactiveCompanies,
    supabase,
  }
})
