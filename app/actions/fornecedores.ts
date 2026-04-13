'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FornecedorData = {
  id?: string
  empresa_id: string
  nome: string
  cnpj: string
  site: string
  contato_nome: string
  contato_email: string
  contato_telefone: string
  pais: string
  categoria: string
  tipo_acesso: string
  dados_acessados: string[]
  finalidade_compartilhamento: string
  base_legal_compartilhamento: string
  possui_contrato: boolean
  possui_dpa: boolean
  data_assinatura_dpa: string
  url_contrato: string
  status_diligencia: string
  data_ultima_avaliacao: string
  data_proxima_avaliacao: string
  nivel_risco: string
  observacoes: string
  transferencia_internacional: boolean
  pais_destino: string
  mecanismo_transferencia: string
  ativo: boolean
}

export async function salvarFornecedor(data: FornecedorData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    empresa_id: data.empresa_id,
    nome: data.nome,
    cnpj: data.cnpj || null,
    site: data.site || null,
    contato_nome: data.contato_nome || null,
    contato_email: data.contato_email || null,
    contato_telefone: data.contato_telefone || null,
    pais: data.pais || 'Brasil',
    categoria: data.categoria,
    tipo_acesso: data.tipo_acesso,
    dados_acessados: data.dados_acessados,
    finalidade_compartilhamento: data.finalidade_compartilhamento || null,
    base_legal_compartilhamento: data.base_legal_compartilhamento || null,
    possui_contrato: data.possui_contrato,
    possui_dpa: data.possui_dpa,
    data_assinatura_dpa: data.data_assinatura_dpa || null,
    url_contrato: data.url_contrato || null,
    status_diligencia: data.status_diligencia,
    data_ultima_avaliacao: data.data_ultima_avaliacao || null,
    data_proxima_avaliacao: data.data_proxima_avaliacao || null,
    nivel_risco: data.nivel_risco,
    observacoes: data.observacoes || null,
    transferencia_internacional: data.transferencia_internacional,
    pais_destino: data.pais_destino || null,
    mecanismo_transferencia: data.mecanismo_transferencia || null,
    ativo: data.ativo,
  }

  if (data.id) {
    await supabase.from('fornecedores').update(payload).eq('id', data.id)
  } else {
    await supabase.from('fornecedores').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/fornecedores')
  redirect('/fornecedores')
}

export async function deletarFornecedor(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('fornecedores').delete().eq('id', id)

  revalidatePath('/fornecedores')
  redirect('/fornecedores')
}
