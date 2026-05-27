'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveTraining(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string | null
  const companyId = formData.get('company_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const video_url = formData.get('video_url') as string | null
  const pdf_url = formData.get('pdf_url') as string | null

  const payload = {
    company_id: companyId,
    title,
    description: description || null,
    video_url: video_url || null,
    pdf_url: pdf_url || null,
  }

  if (id) {
    await supabase.from('trainings').update(payload).eq('id', id)
    revalidatePath(`/trainings/${id}`)
    revalidatePath('/trainings')
    redirect(`/trainings/${id}`)
  } else {
    const { data } = await supabase
      .from('trainings')
      .insert({ ...payload, created_by: user.id })
      .select('id')
      .single()
    revalidatePath('/trainings')
    redirect(`/trainings/${data?.id}`)
  }
}

export async function addCollaborator(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const trainingId = formData.get('training_id') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string | null
  const whatsapp = formData.get('whatsapp') as string | null

  const access_link = crypto.randomUUID()

  await supabase.from('training_employees').insert({
    training_id: trainingId,
    employee_name: name,
    employee_email: email || null,
    employee_whatsapp: whatsapp || null,
    access_link,
    status: 'not_started',
    progress: 0,
  })

  revalidatePath(`/trainings/${trainingId}`)
}
