'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FinalidadeData = {
  id?: string
  empresa_id: string
  nome: string
  descricao: string
  base_legal: string
  obrigatorio: boolean
  ativo: boolean
}

export async function salvarFinalidade(data: FinalidadeData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    empresa_id: data.empresa_id,
    nome: data.nome,
    descricao: data.descricao,
    base_legal: data.base_legal,
    obrigatorio: data.obrigatorio,
    ativo: data.ativo,
  }

  if (data.id) {
    await supabase.from('consentimento_finalidades').update(payload).eq('id', data.id)
  } else {
    await supabase.from('consentimento_finalidades').insert(payload)
  }

  revalidatePath('/consentimentos')
  redirect('/consentimentos')
}

export async function deletarFinalidade(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('consentimento_finalidades').delete().eq('id', id)

  revalidatePath('/consentimentos')
  redirect('/consentimentos')
}

export async function revogarConsentimento(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  const motivo = formData.get('motivo') as string

  await supabase
    .from('consentimentos')
    .update({
      revogado: true,
      revogado_em: new Date().toISOString(),
      motivo_revogacao: motivo || null,
    })
    .eq('id', id)

  revalidatePath('/consentimentos')
}
