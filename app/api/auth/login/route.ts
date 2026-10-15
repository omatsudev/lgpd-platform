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
    // status 400 da API do Supabase = credenciais realmente rejeitadas.
    // Qualquer outro caso (status 0/undefined, timeout, DNS, etc.) é falha de
    // rede/infra, não senha errada — mostrar isso como "senha inválida"
    // confunde quem está depurando um problema de conectividade.
    const errorCode = error.status === 400 ? 'invalid_credentials' : 'connection'
    return NextResponse.redirect(new URL(`/login?error=${errorCode}`, request.url), {
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
