import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const empresa_slug = formData.get('empresa_slug') as string
  const anonimo = formData.get('anonimo') === 'true'
  const tipo = formData.get('tipo') as string
  const descricao = formData.get('descricao') as string
  const nome = anonimo ? null : formData.get('nome') as string
  const email = anonimo ? null : formData.get('email') as string

  const supabase = await createClient()

  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('slug', empresa_slug)
    .single()

  if (!empresa) {
    return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?error=empresa_nao_encontrada`, request.url))
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  await supabase.from('denuncias').insert({
    empresa_id: empresa.id,
    anonimo,
    nome,
    email,
    tipo,
    descricao,
    status: 'recebido',
    ip_origem: ip,
  })

  return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?success=denuncia_enviada`, request.url))
}
