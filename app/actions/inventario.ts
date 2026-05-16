'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Tipos auxiliares ─────────────────────────────────────────────────────

export type Controlador = {
  nome: string
  endereco: string
  email: string
  telefone: string
}

export type IdentificacaoInventario = {
  controlador: Controlador
  dpo: string
  representante_legal: string
}

export type CategoriaDetalhe = {
  categoria_id: string
  descricao: string
  tempo_retencao: string
  fonte: string
  base_legal: string
  finalidade: string
  local_armazenamento: string
  categoria_titular: string
  necessidade_dpia: string
  setor_responsavel: string
}

export type CompartilhamentoItem = {
  com_quem: string
  finalidade: string
}

export type MedidaSegurancaItem = {
  tipo: string
  descricao_controle: string
  finalidade: string
}

export type TransferenciaItem = {
  pais: string
  dados_transferidos: string
  tipo_garantia: string
  finalidade: string
}

export type ContratoItem = {
  numero_processo: string
  objeto: string
  email_gestor: string
  finalidade: string
}

// ─── Tipo principal ────────────────────────────────────────────────────────

export type InventarioData = {
  id?: string
  company_id: string
  // Etapa 0 — Identificação
  identificacao: IdentificacaoInventario
  // Etapa 1 — Processo
  process_name: string
  responsible_department: string        // legado (primeiro elemento de responsible_departments)
  responsible_departments: string[]     // múltiplos setores envolvidos
  process_description: string
  // Etapa 2 — Ciclo de Vida
  lifecycle_phases: Record<string, { ativo: boolean; controlador: boolean; operador: boolean }>
  // Etapa 3 — Dados
  data_categories: string[]
  data_categories_detail: CategoriaDetalhe[]
  data_description: string
  // Etapa 4 — Tratamento
  processing_frequency: string
  data_shared: boolean
  shared_with: string
  shared_details: CompartilhamentoItem[]
  // Etapa 5 — Base Legal
  purpose: string
  legal_basis: string                   // legado (primeira base de legal_bases)
  legal_bases: string[]                 // múltiplas bases legais (art. 7º LGPD)
  consent_collection_method: string
  // Etapa 6 — Titular
  data_source: string                    // legado (primeiro elemento de data_sources)
  data_sources: string[]                 // múltiplas fontes de dados
  data_subject_category: string          // legado (primeiro elemento de data_subject_categories)
  data_subject_categories: string[]      // múltiplas categorias de titular
  // Etapa 7 — Armazenamento e Retenção
  storage_type: string                  // legado (primeiro tipo de storage_types)
  storage_types: string[]               // múltiplos tipos de armazenamento
  storage_location: string
  retention_period: string
  evento_inicial: string               // evento que inicia contagem do prazo
  destinacao_final: string             // descarte seguro, anonimização, devolução, retenção estendida
  bloqueio_possivel: boolean           // se pode ser bloqueado
  responsible: string
  security_measures: string
  security_measures_detail: MedidaSegurancaItem[]
  // Etapa 8 — Transferência Internacional
  transferencia_internacional: TransferenciaItem[]
  // Etapa 9 — Contratos
  contratos: ContratoItem[]
  // Etapa 10 — Impacto
  requires_dpia: string
  risk_level: string
  record_status: 'draft' | 'complete'
}

// ─── Actions ───────────────────────────────────────────────────────────────

export async function salvarInventarioProfissional(data: InventarioData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const data_type = data.data_categories.length > 0
    ? data.data_categories[0].replace(/_/g, ' ')
    : data.process_name || 'Sem categoria'

  const payload = {
    company_id: data.company_id,
    identificacao: data.identificacao,
    process_name: data.process_name,
    // setores: mantém legado (primeiro item) + array completo
    responsible_department: data.responsible_departments[0] ?? data.responsible_department ?? null,
    responsible_departments: data.responsible_departments,
    process_description: data.process_description,
    lifecycle_phases: data.lifecycle_phases,
    data_categories: data.data_categories,
    data_categories_detail: data.data_categories_detail,
    data_description: data.data_description,
    processing_frequency: data.processing_frequency,
    data_shared: data.data_shared,
    shared_with: data.shared_with || null,
    shared_details: data.shared_details,
    purpose: data.purpose,
    // bases legais: mantém legado (primeira) + array completo
    legal_basis: data.legal_bases[0] ?? data.legal_basis ?? null,
    legal_bases: data.legal_bases,
    consent_collection_method: data.consent_collection_method || null,
    // titular: mantém legado (primeiro item) + array completo
    data_source: data.data_sources[0] ?? data.data_source ?? null,
    data_sources: data.data_sources,
    data_subject_category: data.data_subject_categories[0] ?? data.data_subject_category ?? null,
    data_subject_categories: data.data_subject_categories,
    // armazenamento: mantém legado (primeiro tipo) + array completo
    storage_type: data.storage_types[0] ?? data.storage_type ?? null,
    storage_types: data.storage_types,
    storage_location: data.storage_location,
    retention_period: data.retention_period || null,
    evento_inicial: data.evento_inicial || null,
    destinacao_final: data.destinacao_final || null,
    bloqueio_possivel: data.bloqueio_possivel,
    responsible: data.responsible || null,
    security_measures: data.security_measures || null,
    security_measures_detail: data.security_measures_detail,
    transferencia_internacional: data.transferencia_internacional,
    contratos: data.contratos,
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

export async function deletarInventario(formData: globalThis.FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('data_inventory').delete().eq('id', id)

  revalidatePath('/inventario')
  redirect('/inventario')
}
