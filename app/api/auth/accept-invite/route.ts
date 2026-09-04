import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  const supabase = await createClient()

  const { data: preview } = (await supabase
    .rpc('get_invite_preview', { p_token: token })
    .maybeSingle()) as {
    data: { company_name: string; email: string; role: string; valid: boolean } | null
  }

  if (!preview || !preview.valid) {
    return NextResponse.redirect(new URL(`/invite/${token}?error=invalid`, request.url), {
      status: 303,
    })
  }

  const { error: authError } = await supabase.auth.signUp({
    email: preview.email,
    password,
    options: { data: { name } },
  })

  if (authError) {
    return NextResponse.redirect(new URL(`/invite/${token}?error=1`, request.url), {
      status: 303,
    })
  }

  const { data: accepted } = await supabase.rpc('accept_company_invite', { p_token: token })

  if (!accepted) {
    return NextResponse.redirect(new URL(`/invite/${token}?error=1`, request.url), {
      status: 303,
    })
  }

  return NextResponse.redirect(new URL('/dashboard', request.url), { status: 303 })
}
