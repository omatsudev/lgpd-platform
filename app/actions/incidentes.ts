'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type IncidenteData = {
  id?: string
  empresa_id: string
  titulo: string
  tipo: string
  severidade: string
  status: string
  data_ocorrencia: string
  data_descoberta: string
  descricao: string
  dados_afetados: string
  categorias_dados_afetados: string[]
  numero_titulares_afetados: string
  causa_raiz: string
  medidas_imediatas: string
  medidas_corretivas: string
  responsavel: string
  notificou_anpd: boolean
  data_notificacao_anpd: string
  protocolo_anpd: string
  notificou_titulares: boolean
  data_notificacao_titulares: string
}

export async function salvarIncidente(data: IncidenteData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    empresa_id: data.empresa_id,
    titulo: data.titulo,
    tipo: data.tipo,
    severidade: data.severidade,
    status: data.status,
    data_ocorrencia: data.data_ocorrencia || null,
    data_descoberta: data.data_descoberta,
    descricao: data.descricao,
    dados_afetados: data.dados_afetados || null,
    categorias_dados_afetados: data.categorias_dados_afetados,
    numero_titulares_afetados: data.numero_titulares_afetados || null,
    causa_raiz: data.causa_raiz || null,
    medidas_imediatas: data.medidas_imediatas || null,
    medidas_corretivas: data.medidas_corretivas || null,
    responsavel: data.responsavel || null,
    notificou_anpd: data.notificou_anpd,
    data_notificacao_anpd: data.data_notificacao_anpd || null,
    protocolo_anpd: data.protocolo_anpd || null,
    notificou_titulares: data.notificou_titulares,
    data_notificacao_titulares: data.data_notificacao_titulares || null,
  }

  if (data.id) {
    await supabase.from('incidentes').update(payload).eq('id', data.id)
  } else {
    await supabase.from('incidentes').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/incidentes')
  redirect('/incidentes')
}

export async function deletarIncidente(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('incidentes').delete().eq('id', id)

  revalidatePath('/incidentes')
  redirect('/incidentes')
}
