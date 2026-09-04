'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

async function getOrigin() {
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  if (!email) {
    redirect('/recuperar-senha?error=empty')
  }

  const supabase = await createClient()
  const origin = await getOrigin()

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/api/auth/callback?next=/redefinir-senha`,
  })

  // Sempre mostra sucesso, mesmo se o e-mail não existir, para não vazar
  // quais e-mails estão cadastrados.
  redirect('/recuperar-senha?ok=1')
}

export async function resetPasswordAfterRecovery(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (!password || password.length < 6) {
    redirect('/redefinir-senha?error=short')
  }

  if (password !== confirmPassword) {
    redirect('/redefinir-senha?error=mismatch')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    redirect('/redefinir-senha?error=1')
  }

  redirect('/login?reset=ok')
}
