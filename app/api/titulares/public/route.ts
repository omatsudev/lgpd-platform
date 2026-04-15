import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const empresa_slug = formData.get('empresa_slug') as string
  const type = formData.get('type') as string
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const cpf = formData.get('cpf') as string | null
  const description = formData.get('description') as string

  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', empresa_slug)
    .single()

  if (!company) {
    return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?error=empresa_nao_encontrada`, request.url))
  }

  // Legal deadline: 15 business days
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 21)

  await supabase.from('data_subject_requests').insert({
    company_id: company.id,
    type,
    name,
    email,
    cpf,
    description,
    status: 'pending',
    response_deadline: deadline.toISOString().split('T')[0],
  })

  return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?success=solicitacao_enviada`, request.url))
}
