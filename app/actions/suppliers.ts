'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type SupplierData = {
  id?: string
  company_id: string
  name: string
  tax_id: string
  site: string
  contact_name: string
  contact_email: string
  contact_phone: string
  country: string
  category: string
  access_type: string
  accessed_data: string[]
  sharing_purpose: string
  sharing_legal_basis: string
  has_contract: boolean
  has_dpa: boolean
  dpa_signing_date: string
  contract_url: string
  due_diligence_status: string
  last_assessment_date: string
  next_assessment_date: string
  risk_level: string
  notes: string
  international_transfer: boolean
  destination_country: string
  transfer_mechanism: string
  active: boolean
}

export async function saveSupplier(data: SupplierData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    company_id: data.company_id,
    name: data.name,
    tax_id: data.tax_id || null,
    site: data.site || null,
    contact_name: data.contact_name || null,
    contact_email: data.contact_email || null,
    contact_phone: data.contact_phone || null,
    country: data.country || 'Brasil',
    category: data.category,
    access_type: data.access_type,
    accessed_data: data.accessed_data,
    sharing_purpose: data.sharing_purpose || null,
    sharing_legal_basis: data.sharing_legal_basis || null,
    has_contract: data.has_contract,
    has_dpa: data.has_dpa,
    dpa_signing_date: data.dpa_signing_date || null,
    contract_url: data.contract_url || null,
    due_diligence_status: data.due_diligence_status,
    last_assessment_date: data.last_assessment_date || null,
    next_assessment_date: data.next_assessment_date || null,
    risk_level: data.risk_level,
    notes: data.notes || null,
    international_transfer: data.international_transfer,
    destination_country: data.destination_country || null,
    transfer_mechanism: data.transfer_mechanism || null,
    active: data.active,
  }

  if (data.id) {
    await supabase.from('suppliers').update(payload).eq('id', data.id)
  } else {
    await supabase.from('suppliers').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/suppliers')
  redirect('/suppliers')
}

export async function deleteSupplier(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('suppliers').delete().eq('id', id)

  revalidatePath('/suppliers')
  redirect('/suppliers')
}
