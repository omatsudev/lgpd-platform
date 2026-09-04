'use server'

import { logAuditEvent } from '@/lib/audit'
import { getUserCompany } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

// As tabelas abaixo não têm FK com cascade real no banco (drift entre migrations
// e o schema em produção), então cada uma precisa ser apagada explicitamente.
async function wipeCompanyChildData(supabase: SupabaseClient<any, any, any>, companyId: string) {
  const { data: trainings } = await supabase
    .from('trainings')
    .select('id')
    .eq('company_id', companyId)
  const trainingIds = (trainings ?? []).map((t) => t.id)
  if (trainingIds.length) {
    await supabase.from('training_employees').delete().in('training_id', trainingIds)
  }

  const childTables = [
    'trainings',
    'documents',
    'consents',
    'consent_purposes',
    'data_inventory',
    'complaints',
    'data_subject_requests',
    'suppliers',
    'checklist_items',
    'risks',
    'retention_disposals',
    'site_scans',
  ]
  for (const table of childTables) {
    await supabase.from(table).delete().eq('company_id', companyId)
  }
}

async function getMembershipRole(
  supabase: SupabaseClient<any, any, any>,
  userId: string,
  companyId: string,
) {
  const { data } = await supabase
    .from('user_companies')
    .select('role')
    .eq('user_id', userId)
    .eq('company_id', companyId)
    .single()
  return data?.role as string | undefined
}

export async function deleteCompany(formData: FormData) {
  const { user, company, companyId } = await getUserCompany()
  if (!user || !companyId || !company) throw new Error('Not authenticated')

  const supabase = await createClient()

  const membershipRole = await getMembershipRole(supabase, user.id, companyId)
  if (membershipRole !== 'admin') {
    redirect('/settings/delete-company?error=forbidden')
  }

  const confirmName = (formData.get('confirm_name') as string)?.trim()
  if (confirmName !== company.name) {
    redirect('/settings/delete-company?error=mismatch')
  }

  const requestHeaders = await headers()
  await logAuditEvent(supabase, requestHeaders, {
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'DEACTIVATE',
    resource: 'company',
    details: `Empresa "${company.name}" (${companyId}) desativada`,
    companyId,
  })

  const { error } = await supabase
    .from('companies')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', companyId)
  if (error) {
    redirect('/settings/delete-company?error=1')
  }

  const cookieStore = await cookies()
  if (cookieStore.get('selected_company_id')?.value === companyId) {
    cookieStore.delete('selected_company_id')
  }

  revalidatePath('/companies')
  revalidatePath('/dashboard')
  redirect('/companies?deactivated=1')
}

export async function reactivateCompany(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const companyId = formData.get('company_id') as string
  const mode = formData.get('mode') as string

  const membershipRole = await getMembershipRole(supabase, user.id, companyId)
  if (membershipRole !== 'admin') {
    redirect('/companies/inactive?error=forbidden')
  }

  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', companyId)
    .single()

  if (mode === 'fresh') {
    await wipeCompanyChildData(supabase, companyId)
  }

  const { error } = await supabase
    .from('companies')
    .update({ deleted_at: null })
    .eq('id', companyId)
  if (error) {
    redirect('/companies/inactive?error=1')
  }

  const requestHeaders = await headers()
  await logAuditEvent(supabase, requestHeaders, {
    userId: user.id,
    userEmail: user.email ?? '',
    action: 'REACTIVATE',
    resource: 'company',
    details: `Empresa "${company?.name ?? companyId}" (${companyId}) reativada (${mode === 'fresh' ? 'dados zerados' : 'dados restaurados'})`,
    companyId,
  })

  revalidatePath('/companies')
  revalidatePath('/dashboard')
  redirect('/companies?reactivated=1')
}
