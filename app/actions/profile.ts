'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const name = (formData.get('name') as string)?.trim()

  if (!name) {
    redirect('/settings?profile_error=empty')
  }

  const { error } = await supabase.auth.updateUser({ data: { name } })

  redirect(error ? '/settings?profile_error=1' : '/settings?profile_ok=1')
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || password.length < 6) {
    redirect('/settings?password_error=short')
  }

  if (password !== confirmPassword) {
    redirect('/settings?password_error=mismatch')
  }

  const { error } = await supabase.auth.updateUser({ password })

  redirect(error ? '/settings?password_error=1' : '/settings?password_ok=1')
}
