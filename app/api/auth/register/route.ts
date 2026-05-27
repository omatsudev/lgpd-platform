import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const empresa_nome = formData.get('empresa_nome') as string
  const tipo = formData.get('type') as string

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: tipo === 'dpo' ? 'dpo' : 'empresa',
      },
      emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  })

  if (authError) {
    return NextResponse.redirect(new URL(`/cadastro?error=${authError.message}`, request.url), {
      status: 303,
    })
  }

  if (authData.user && tipo !== 'dpo') {
    const nomeFinal =
      empresa_nome?.trim() || (name?.trim() ? `Empresa de ${name.trim()}` : 'Minha Empresa')
    const slug =
      nomeFinal
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') +
      '-' +
      Date.now()

    const { data: company } = await supabase
      .from('companies')
      .insert({ name: nomeFinal, owner_id: authData.user.id, slug })
      .select('id')
      .single()

    if (company) {
      await supabase.from('user_companies').insert({
        user_id: authData.user.id,
        company_id: company.id,
        role: 'admin',
      })
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url), { status: 303 })
}
