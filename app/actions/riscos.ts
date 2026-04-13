'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type RiscoData = {
  id?: string
  empresa_id: string
  titulo: string
  descricao: string
  categoria: string
  origem: string
  inventario_id: string
  incidente_id: string
  probabilidade_inerente: number
  impacto_inerente: number
  probabilidade_residual: number
  impacto_residual: number
  estrategia: string
  plano_acao: string
  responsavel: string
  prazo: string
  status: string
}

export async function salvarRisco(data: RiscoData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    empresa_id: data.empresa_id,
    titulo: data.titulo,
    descricao: data.descricao || null,
    categoria: data.categoria,
    origem: data.origem || null,
    inventario_id: data.inventario_id || null,
    incidente_id: data.incidente_id || null,
    probabilidade_inerente: data.probabilidade_inerente,
    impacto_inerente: data.impacto_inerente,
    probabilidade_residual: data.probabilidade_residual || null,
    impacto_residual: data.impacto_residual || null,
    estrategia: data.estrategia || null,
    plano_acao: data.plano_acao || null,
    responsavel: data.responsavel || null,
    prazo: data.prazo || null,
    status: data.status,
  }

  if (data.id) {
    await supabase.from('riscos').update(payload).eq('id', data.id)
  } else {
    await supabase.from('riscos').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/riscos')
  redirect('/riscos')
}

export async function deletarRisco(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('riscos').delete().eq('id', id)

  revalidatePath('/riscos')
  redirect('/riscos')
}
