import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const empresa_slug = formData.get('empresa_slug') as string
  const anonymous = formData.get('anonymous') === 'true'
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const name = anonymous ? null : formData.get('name') as string
  const email = anonymous ? null : formData.get('email') as string

  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', empresa_slug)
    .single()

  if (!company) {
    return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?error=empresa_nao_encontrada`, request.url))
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  await supabase.from('complaints').insert({
    company_id: company.id,
    anonymous,
    name,
    email,
    type,
    description,
    status: 'received',
    source_ip: ip,
  })

  return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?success=denuncia_enviada`, request.url))
}
