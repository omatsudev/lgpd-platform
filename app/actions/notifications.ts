'use server'

import { getUserCompany } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'

export async function markNotificationRead(formData: FormData) {
  const { companyId, supabase } = await getUserCompany()
  if (!companyId) return

  const id = formData.get('id') as string
  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', companyId)

  revalidatePath('/notificacoes')
}

export async function markAllNotificationsRead(formData: FormData) {
  const { companyId, supabase } = await getUserCompany()
  if (!companyId) return
  void formData

  await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('company_id', companyId)
    .is('read_at', null)

  revalidatePath('/notificacoes')
}
