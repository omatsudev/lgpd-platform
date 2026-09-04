'use server'

import { getUserCompany } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function inviteCollaborator(formData: FormData) {
  const { user, companyId, role } = await getUserCompany()
  if (!user || !companyId) throw new Error('Not authenticated')
  if (role === 'collaborator') throw new Error('Not authorized')

  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) redirect('/settings?invite_error=1')

  const supabase = await createClient()
  const { error } = await supabase.from('company_invites').insert({
    company_id: companyId,
    email,
    invited_by: user.id,
  })

  if (error) redirect('/settings?invite_error=1')

  revalidatePath('/settings')
  redirect('/settings?invite_ok=1')
}

export async function revokeInvite(formData: FormData) {
  const { user, role } = await getUserCompany()
  if (!user) throw new Error('Not authenticated')
  if (role === 'collaborator') throw new Error('Not authorized')

  const id = formData.get('id') as string
  const supabase = await createClient()
  await supabase.from('company_invites').delete().eq('id', id)

  revalidatePath('/settings')
}
