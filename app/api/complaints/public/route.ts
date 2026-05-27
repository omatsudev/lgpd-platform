import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const company_slug = formData.get('company_slug') as string
  const anonymous = formData.get('anonymous') === 'true'
  const type = formData.get('type') as string
  const description = formData.get('description') as string
  const name = anonymous ? null : formData.get('name') as string
  const email = anonymous ? null : formData.get('email') as string

  const supabase = await createClient()

  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', company_slug)
    .single()

  if (!company) {
    return NextResponse.redirect(new URL(`/lgpd/${company_slug}?error=company_not_found`, request.url))
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

  return NextResponse.redirect(new URL(`/lgpd/${company_slug}?success=complaint_submitted`, request.url))
}
