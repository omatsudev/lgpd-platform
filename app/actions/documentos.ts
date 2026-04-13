'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type DocumentoData = {
  id?: string
  empresa_id: string
  titulo: string
  tipo: string
  descricao: string
  versao: string
  conteudo: string
  arquivo_url: string
  arquivo_nome: string
  status: string
  responsavel: string
  data_aprovacao: string
  data_revisao: string
  data_expiracao: string
}

export async function salvarDocumento(data: DocumentoData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    empresa_id: data.empresa_id,
    titulo: data.titulo,
    tipo: data.tipo,
    descricao: data.descricao || null,
    versao: data.versao || '1.0',
    conteudo: data.conteudo || null,
    arquivo_url: data.arquivo_url || null,
    arquivo_nome: data.arquivo_nome || null,
    status: data.status,
    responsavel: data.responsavel || null,
    data_aprovacao: data.data_aprovacao || null,
    data_revisao: data.data_revisao || null,
    data_expiracao: data.data_expiracao || null,
  }

  if (data.id) {
    await supabase.from('documentos').update(payload).eq('id', data.id)
  } else {
    await supabase.from('documentos').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/documentos')
  redirect('/documentos')
}

export async function deletarDocumento(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('documentos').delete().eq('id', id)

  revalidatePath('/documentos')
  redirect('/documentos')
}
