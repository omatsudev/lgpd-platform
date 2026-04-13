'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function salvarTreinamento(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string | null
  const empresaId = formData.get('empresa_id') as string
  const titulo = formData.get('titulo') as string
  const descricao = formData.get('descricao') as string | null
  const video_url = formData.get('video_url') as string | null
  const pdf_url = formData.get('pdf_url') as string | null

  const payload = {
    empresa_id: empresaId,
    titulo,
    descricao: descricao || null,
    video_url: video_url || null,
    pdf_url: pdf_url || null,
  }

  if (id) {
    await supabase.from('treinamentos').update(payload).eq('id', id)
    revalidatePath(`/treinamentos/${id}`)
    revalidatePath('/treinamentos')
    redirect(`/treinamentos/${id}`)
  } else {
    const { data } = await supabase
      .from('treinamentos')
      .insert({ ...payload, created_by: user.id })
      .select('id')
      .single()
    revalidatePath('/treinamentos')
    redirect(`/treinamentos/${data?.id}`)
  }
}

export async function adicionarColaborador(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const treinamentoId = formData.get('treinamento_id') as string
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string | null
  const whatsapp = formData.get('whatsapp') as string | null

  const link_acesso = crypto.randomUUID()

  await supabase.from('treinamento_colaboradores').insert({
    treinamento_id: treinamentoId,
    colaborador_nome: nome,
    colaborador_email: email || null,
    colaborador_whatsapp: whatsapp || null,
    link_acesso,
    status: 'nao_iniciado',
    progresso: 0,
  })

  revalidatePath(`/treinamentos/${treinamentoId}`)
}
