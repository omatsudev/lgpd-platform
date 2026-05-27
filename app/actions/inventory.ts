'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ─── Auxiliary types ──────────────────────────────────────────────────────────

export type Controller = {
  name: string
  address: string
  email: string
  phone: string
}

export type InventoryIdentification = {
  controller: Controller
  dpo: string
  legalRepresentative: string
}

export type DataCategoryDetail = {
  categoryId: string
  description: string
  retentionPeriod: string
  source: string
  legalBasis: string
  purpose: string
  storageLocation: string
  dataSubjectCategory: string
  dpiaRequired: string
  responsibleDepartment: string
}

export type SharingRecipient = {
  recipient: string
  purpose: string
}

export type SecurityMeasure = {
  type: string
  controlDescription: string
  purpose: string
}

export type InternationalTransfer = {
  country: string
  dataTransferred: string
  safeguardType: string
  purpose: string
}

export type Contract = {
  processNumber: string
  subject: string
  managerEmail: string
  purpose: string
}

// ─── Main type ────────────────────────────────────────────────────────────────

export type InventoryData = {
  id?: string
  companyId: string
  // Step 0 — Identification
  identification: InventoryIdentification
  // Step 1 — Process
  processName: string
  responsibleDepartment: string // legacy (first element of responsibleDepartments)
  responsibleDepartments: string[] // multiple departments involved
  processDescription: string
  // Step 2 — Lifecycle
  lifecyclePhases: Record<string, { active: boolean; controller: boolean; processor: boolean }>
  // Step 3 — Data
  dataCategories: string[]
  dataCategoriesDetail: DataCategoryDetail[]
  dataDescription: string
  // Step 4 — Processing
  processingFrequency: string
  dataShared: boolean
  sharedWith: string
  sharedDetails: SharingRecipient[]
  // Step 5 — Legal Basis
  purpose: string
  legalBasis: string // legacy (first element of legalBases)
  legalBases: string[] // multiple legal bases (LGPD art. 7)
  consentCollectionMethod: string
  // Step 6 — Data Subject
  dataSource: string // legacy (first element of dataSources)
  dataSources: string[]
  dataSubjectCategory: string // legacy (first element of dataSubjectCategories)
  dataSubjectCategories: string[]
  // Step 7 — Storage & Retention
  storageType: string // legacy (first element of storageTypes)
  storageTypes: string[]
  storageLocation: string
  retentionPeriod: string
  retentionStartEvent: string
  finalDisposition: string
  disposalHoldPossible: boolean
  responsible: string
  securityMeasures: string
  securityMeasuresDetail: SecurityMeasure[]
  // Step 8 — International Transfers
  internationalTransfers: InternationalTransfer[]
  // Step 9 — Contracts
  contracts: Contract[]
  // Step 10 — Impact
  requiresDpia: string
  riskLevel: string
  recordStatus: 'draft' | 'complete'
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function saveInventory(data: InventoryData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const dataType =
    data.dataCategories.length > 0
      ? data.dataCategories[0].replace(/_/g, ' ')
      : data.processName || 'Sem categoria'

  const payload = {
    company_id: data.companyId,
    identification: data.identification,
    process_name: data.processName,
    responsible_department: data.responsibleDepartments[0] ?? data.responsibleDepartment ?? null,
    responsible_departments: data.responsibleDepartments,
    process_description: data.processDescription,
    lifecycle_phases: data.lifecyclePhases,
    data_categories: data.dataCategories,
    data_categories_detail: data.dataCategoriesDetail,
    data_description: data.dataDescription,
    processing_frequency: data.processingFrequency,
    data_shared: data.dataShared,
    shared_with: data.sharedWith || null,
    shared_details: data.sharedDetails,
    purpose: data.purpose,
    legal_basis: data.legalBases[0] ?? data.legalBasis ?? null,
    legal_bases: data.legalBases,
    consent_collection_method: data.consentCollectionMethod || null,
    data_source: data.dataSources[0] ?? data.dataSource ?? null,
    data_sources: data.dataSources,
    data_subject_category: data.dataSubjectCategories[0] ?? data.dataSubjectCategory ?? null,
    data_subject_categories: data.dataSubjectCategories,
    storage_type: data.storageTypes[0] ?? data.storageType ?? null,
    storage_types: data.storageTypes,
    storage_location: data.storageLocation,
    retention_period: data.retentionPeriod || null,
    retention_start_event: data.retentionStartEvent || null,
    final_disposition: data.finalDisposition || null,
    disposal_hold_possible: data.disposalHoldPossible,
    responsible: data.responsible || null,
    security_measures: data.securityMeasures || null,
    security_measures_detail: data.securityMeasuresDetail,
    international_transfers: data.internationalTransfers,
    contracts: data.contracts,
    requires_dpia: data.requiresDpia,
    risk_level: data.riskLevel,
    record_status: data.recordStatus,
    data_type: dataType,
  }

  if (data.id) {
    const { error } = await supabase.from('data_inventory').update(payload).eq('id', data.id)
    if (error) throw new Error(`Erro ao atualizar inventário: ${error.message}`)
  } else {
    const { error } = await supabase
      .from('data_inventory')
      .insert({ ...payload, created_by: user.id })
    if (error) throw new Error(`Erro ao salvar inventário: ${error.message}`)
  }

  revalidatePath('/inventory')
  redirect('/inventory')
}

export async function deleteInventory(formData: globalThis.FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('data_inventory').delete().eq('id', id)

  revalidatePath('/inventory')
  redirect('/inventory')
}
