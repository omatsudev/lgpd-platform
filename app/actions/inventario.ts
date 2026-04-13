'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type InventarioData = {
  id?: string
  empresa_id: string
  // Etapa 1
  nome_processo: string
  setor_responsavel: string
  descricao_processo: string
  // Etapa 2
  fases_ciclo_vida: Record<string, { ativo: boolean; controlador: boolean; operador: boolean }>
  // Etapa 3
  categorias_dados: string[]
  descricao_dados: string
  // Etapa 4
  frequencia_tratamento: string
  dados_compartilhados: boolean
  com_quem_compartilhado: string
  // Etapa 5
  finalidade: string
  base_legal: string
  forma_coleta_consentimento: string
  // Etapa 6
  fonte_dados: string
  categoria_titular: string
  // Etapa 7
  local_tipo: string
  local_armazenamento: string
  prazo_retencao: string
  responsavel: string
  medidas_seguranca: string
  // Etapa 8
  necessita_ripd: string
  nivel_risco: string
  status_registro: 'rascunho' | 'completo'
}

export async function salvarInventarioProfissional(data: InventarioData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // tipo_dado para compatibilidade com a listagem legada
  const tipo_dado = data.categorias_dados.length > 0
    ? data.categorias_dados[0].replace(/_/g, ' ')
    : data.nome_processo || 'Sem categoria'

  const payload = {
    empresa_id: data.empresa_id,
    nome_processo: data.nome_processo,
    setor_responsavel: data.setor_responsavel,
    descricao_processo: data.descricao_processo,
    fases_ciclo_vida: data.fases_ciclo_vida,
    categorias_dados: data.categorias_dados,
    descricao_dados: data.descricao_dados,
    frequencia_tratamento: data.frequencia_tratamento,
    dados_compartilhados: data.dados_compartilhados,
    com_quem_compartilhado: data.com_quem_compartilhado || null,
    finalidade: data.finalidade,
    base_legal: data.base_legal,
    forma_coleta_consentimento: data.forma_coleta_consentimento || null,
    fonte_dados: data.fonte_dados,
    categoria_titular: data.categoria_titular,
    local_tipo: data.local_tipo,
    local_armazenamento: data.local_armazenamento,
    prazo_retencao: data.prazo_retencao || null,
    responsavel: data.responsavel || null,
    medidas_seguranca: data.medidas_seguranca || null,
    necessita_ripd: data.necessita_ripd,
    nivel_risco: data.nivel_risco,
    status_registro: data.status_registro,
    tipo_dado,
  }

  if (data.id) {
    await supabase.from('inventario_dados').update(payload).eq('id', data.id)
  } else {
    await supabase.from('inventario_dados').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/inventario')
  redirect('/inventario')
}

export async function deletarInventario(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('inventario_dados').delete().eq('id', id)

  revalidatePath('/inventario')
  redirect('/inventario')
}
