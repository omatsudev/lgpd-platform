'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// ─── Tipos ─────────────────────────────────────────────────────────────────

export type RetencaoDescarteData = {
  id?: string
  company_id: string
  // Identificação
  tipo_dado: string
  categoria: string
  // Política de retenção
  prazo_retencao: string
  evento_inicial: string
  data_evento?: string
  data_vencimento?: string
  fundamento_juridico: string
  // Prescrição / decadência
  prazo_prescricional?: string
  prazo_decadencial?: string
  // Destinação e bloqueio
  possibilidade_bloqueio: boolean
  destinacao_final?: string
  bloqueio_ativo: boolean
  motivo_bloqueio?: string
  // Notas
  notas?: string
}

// ─── Actions ───────────────────────────────────────────────────────────────

export async function salvarRetencaoDescarte(data: RetencaoDescarteData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const payload = {
    company_id: data.company_id,
    tipo_dado: data.tipo_dado,
    categoria: data.categoria,
    prazo_retencao: data.prazo_retencao,
    evento_inicial: data.evento_inicial,
    data_evento: data.data_evento || null,
    data_vencimento: data.data_vencimento || null,
    fundamento_juridico: data.fundamento_juridico,
    prazo_prescricional: data.prazo_prescricional || null,
    prazo_decadencial: data.prazo_decadencial || null,
    possibilidade_bloqueio: data.possibilidade_bloqueio,
    destinacao_final: data.destinacao_final || null,
    bloqueio_ativo: data.bloqueio_ativo,
    motivo_bloqueio: data.motivo_bloqueio || null,
    notas: data.notas || null,
  }

  if (data.id) {
    await supabase.from('retencao_descarte').update(payload).eq('id', data.id)
  } else {
    await supabase.from('retencao_descarte').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/retencao-descarte')
  redirect('/retencao-descarte')
}

export async function registrarBloqueio(formData: globalThis.FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  const motivo = formData.get('motivo') as string

  const { data: item } = await supabase
    .from('retencao_descarte')
    .select('historico_acoes')
    .eq('id', id)
    .single()

  const historico = (item?.historico_acoes ?? []) as object[]
  historico.push({
    acao: 'bloqueio',
    data: new Date().toISOString(),
    usuario: user.id,
    motivo,
  })

  await supabase
    .from('retencao_descarte')
    .update({ bloqueio_ativo: true, motivo_bloqueio: motivo, historico_acoes: historico })
    .eq('id', id)

  revalidatePath('/retencao-descarte')
  redirect('/retencao-descarte')
}

export async function registrarDescarte(formData: globalThis.FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  const metodo = formData.get('metodo') as string

  const { data: item } = await supabase
    .from('retencao_descarte')
    .select('historico_acoes')
    .eq('id', id)
    .single()

  const historico = (item?.historico_acoes ?? []) as object[]
  historico.push({
    acao: 'descarte',
    data: new Date().toISOString(),
    usuario: user.id,
    metodo,
  })

  await supabase
    .from('retencao_descarte')
    .update({ historico_acoes: historico, notas: `Descarte realizado em ${new Date().toLocaleDateString('pt-BR')} — método: ${metodo}` })
    .eq('id', id)

  revalidatePath('/retencao-descarte')
  redirect('/retencao-descarte')
}

export async function deletarRetencaoDescarte(formData: globalThis.FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const id = formData.get('id') as string
  await supabase.from('retencao_descarte').delete().eq('id', id)

  revalidatePath('/retencao-descarte')
  redirect('/retencao-descarte')
}
