'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function switchCompany(formData: FormData) {
  const companyId = formData.get('companyId') as string
  if (!companyId) return

  const cookieStore = await cookies()
  cookieStore.set('selected_company_id', companyId, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 dias
    httpOnly: true,
    sameSite: 'lax',
  })

  redirect('/dashboard')
}
