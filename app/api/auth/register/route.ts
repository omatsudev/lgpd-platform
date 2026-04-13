import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const empresa_nome = formData.get('empresa_nome') as string
  const tipo = formData.get('tipo') as string

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
    return NextResponse.redirect(new URL(`/cadastro?error=${authError.message}`, request.url), { status: 303 })
  }

  if (authData.user && tipo !== 'dpo' && empresa_nome) {
    const slug = empresa_nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

    const { data: empresa } = await supabase
      .from('empresas')
      .insert({ nome: empresa_nome, owner_id: authData.user.id, slug })
      .select('id')
      .single()

    if (empresa) {
      await supabase.from('user_empresas').insert({
        user_id: authData.user.id,
        empresa_id: empresa.id,
        role: 'admin',
      })
    }
  }

  return NextResponse.redirect(new URL('/dashboard', request.url), { status: 303 })
}
