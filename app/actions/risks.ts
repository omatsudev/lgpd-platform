'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type RiskData = {
  id?: string
  company_id: string
  title: string
  description: string
  category: string
  origin: string
  inventory_id: string
  incident_id: string
  inherent_probability: number
  inherent_impact: number
  residual_probability: number
  residual_impact: number
  strategy: string
  action_plan: string
  responsible: string
  deadline: string
  status: string
}

export async function saveRisk(data: RiskData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const payload = {
    company_id: data.company_id,
    title: data.title,
    description: data.description || null,
    category: data.category,
    origin: data.origin || null,
    inventory_id: data.inventory_id || null,
    incident_id: data.incident_id || null,
    inherent_probability: data.inherent_probability,
    inherent_impact: data.inherent_impact,
    residual_probability: data.residual_probability || null,
    residual_impact: data.residual_impact || null,
    strategy: data.strategy || null,
    action_plan: data.action_plan || null,
    responsible: data.responsible || null,
    deadline: data.deadline || null,
    status: data.status,
  }

  if (data.id) {
    await supabase.from('risks').update(payload).eq('id', data.id)
  } else {
    await supabase.from('risks').insert({ ...payload, created_by: user.id })
  }

  revalidatePath('/risks')
  redirect('/risks')
}

export async function deleteRisk(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string
  await supabase.from('risks').delete().eq('id', id)

  revalidatePath('/risks')
  redirect('/risks')
}
