'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserEmpresa } from '@/lib/supabase/queries'

export async function salvarDadosEmpresa(formData: FormData) {
  const supabase = await createClient()
  const { user, empresaId } = await getUserEmpresa()
  if (!user || !empresaId) throw new Error('Não autenticado')

  await supabase.from('empresas').update({
    nome: formData.get('nome') as string,
    cnpj: formData.get('cnpj') as string || null,
    setor: formData.get('setor') as string || null,
    slug: formData.get('slug') as string,
  }).eq('id', empresaId)

  revalidatePath('/configuracoes')
}

export async function salvarDPO(formData: FormData) {
  const supabase = await createClient()
  const { user, empresaId } = await getUserEmpresa()
  if (!user || !empresaId) throw new Error('Não autenticado')

  await supabase.from('empresas').update({
    dpo_nome: formData.get('dpo_nome') as string || null,
    dpo_email: formData.get('dpo_email') as string || null,
    dpo_telefone: formData.get('dpo_telefone') as string || null,
  }).eq('id', empresaId)

  revalidatePath('/configuracoes')
}

export async function salvarPolitica(formData: FormData) {
  const supabase = await createClient()
  const { user, empresaId } = await getUserEmpresa()
  if (!user || !empresaId) throw new Error('Não autenticado')

  await supabase.from('empresas').update({
    politica_privacidade_url: formData.get('politica_url') as string || null,
  }).eq('id', empresaId)

  revalidatePath('/configuracoes')
}
