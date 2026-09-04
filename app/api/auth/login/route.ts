import { logAuditEvent } from '@/lib/audit'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.redirect(new URL('/login?error=invalid_credentials', request.url), {
      status: 303,
    })
  }

  if (data.user) {
    await logAuditEvent(supabase, request.headers, {
      userId: data.user.id,
      userEmail: data.user.email ?? email,
      action: 'ACCESS',
      resource: 'login',
    })
  }

  return NextResponse.redirect(new URL('/dashboard', request.url), { status: 303 })
}
