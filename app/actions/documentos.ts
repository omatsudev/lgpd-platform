'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type DocumentoData = {
  id?: string
  company_id: string
  title: string
  type: string
  description: string
  version: string
  content: string
  file_url: string
  file_name: string
  status: string
  responsible: string
  approval_date: string
  review_date: string
  expiration_date: string
}

export async function salvarDocumento(data: DocumentoData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    company_id: data.company_id,
    title: data.title,
    type: data.type,
    description: data.description || null,
    version: data.version || '1.0',
    content: data.content || null,
    file_url: data.file_url || null,
    file_name: data.file_name || null,
    status: data.status,
    responsible: data.responsible || null,
    approval_date: data.approval_date || null,
    review_date: data.review_date || null,
    expiration_date: data.expiration_date || null,
  }

  if (data.id) {
    await supabase.from('documents').update(payload).eq('id', data.id)
  } else {
    await supabase.from('documents').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/documentos')
  redirect('/documentos')
}

export async function deletarDocumento(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('documents').delete().eq('id', id)

  revalidatePath('/documentos')
  redirect('/documentos')
}
