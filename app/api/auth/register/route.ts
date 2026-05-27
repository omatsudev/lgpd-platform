import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  const company_name = formData.get('company_name') as string
  const accountType = formData.get('type') as string

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: accountType === 'dpo' ? 'dpo' : 'company',
      },
      emailRedirectTo: `${new URL(request.url).origin}/api/auth/callback`,
    },
  })

  if (authError) {
    return NextResponse.redirect(new URL(`/register?error=${authError.message}`, request.url), {
      status: 303,
    })
  }

  if (authData.user && accountType !== 'dpo') {
    const companyFinalName =
      company_name?.trim() || (name?.trim() ? `Empresa de ${name.trim()}` : 'Minha Empresa')
    const slug =
      companyFinalName
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
      .insert({ name: companyFinalName, owner_id: authData.user.id, slug })
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
