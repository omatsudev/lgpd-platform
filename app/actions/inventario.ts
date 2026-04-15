'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type InventarioData = {
  id?: string
  company_id: string
  // Step 1
  process_name: string
  responsible_department: string
  process_description: string
  // Step 2
  lifecycle_phases: Record<string, { ativo: boolean; controlador: boolean; operador: boolean }>
  // Step 3
  data_categories: string[]
  data_description: string
  // Step 4
  processing_frequency: string
  data_shared: boolean
  shared_with: string
  // Step 5
  purpose: string
  legal_basis: string
  consent_collection_method: string
  // Step 6
  data_source: string
  data_subject_category: string
  // Step 7
  storage_type: string
  storage_location: string
  retention_period: string
  responsible: string
  security_measures: string
  // Step 8
  requires_dpia: string
  risk_level: string
  record_status: 'draft' | 'complete'
}

export async function salvarInventarioProfissional(data: InventarioData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // data_type for compatibility with legacy listing
  const data_type = data.data_categories.length > 0
    ? data.data_categories[0].replace(/_/g, ' ')
    : data.process_name || 'Sem categoria'

  const payload = {
    company_id: data.company_id,
    process_name: data.process_name,
    responsible_department: data.responsible_department,
    process_description: data.process_description,
    lifecycle_phases: data.lifecycle_phases,
    data_categories: data.data_categories,
    data_description: data.data_description,
    processing_frequency: data.processing_frequency,
    data_shared: data.data_shared,
    shared_with: data.shared_with || null,
    purpose: data.purpose,
    legal_basis: data.legal_basis,
    consent_collection_method: data.consent_collection_method || null,
    data_source: data.data_source,
    data_subject_category: data.data_subject_category,
    storage_type: data.storage_type,
    storage_location: data.storage_location,
    retention_period: data.retention_period || null,
    responsible: data.responsible || null,
    security_measures: data.security_measures || null,
    requires_dpia: data.requires_dpia,
    risk_level: data.risk_level,
    record_status: data.record_status,
    data_type,
  }

  if (data.id) {
    await supabase.from('data_inventory').update(payload).eq('id', data.id)
  } else {
    await supabase.from('data_inventory').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/inventario')
  redirect('/inventario')
}

export async function deletarInventario(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('data_inventory').delete().eq('id', id)

  revalidatePath('/inventario')
  redirect('/inventario')
}
