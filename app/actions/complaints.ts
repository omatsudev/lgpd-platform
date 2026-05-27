'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateComplaint(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const id = formData.get('id') as string
  const status = formData.get('status') as string
  const response = formData.get('response') as string | null

  await supabase
    .from('complaints')
    .update({
      status,
      response: response || null,
      responded_by: user.id,
    })
    .eq('id', id)

  revalidatePath('/complaints')
  redirect('/complaints')
}
