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
    return NextResponse.redirect(new URL(`/cadastro?error=${authError.message}`, request.url))
  }

  if (authData.user && tipo !== 'dpo') {
    await supabase.from('empresas').insert({
      nome: empresa_nome,
      owner_id: authData.user.id,
      slug: empresa_nome.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    })
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
