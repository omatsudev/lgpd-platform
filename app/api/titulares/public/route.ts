import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const empresa_slug = formData.get('empresa_slug') as string
  const tipo = formData.get('tipo') as string
  const nome = formData.get('nome') as string
  const email = formData.get('email') as string
  const cpf = formData.get('cpf') as string | null
  const descricao = formData.get('descricao') as string

  const supabase = await createClient()

  const { data: empresa } = await supabase
    .from('empresas')
    .select('id')
    .eq('slug', empresa_slug)
    .single()

  if (!empresa) {
    return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?error=empresa_nao_encontrada`, request.url))
  }

  // Prazo legal: 15 dias úteis
  const prazo = new Date()
  prazo.setDate(prazo.getDate() + 21)

  await supabase.from('solicitacoes_titulares').insert({
    empresa_id: empresa.id,
    tipo,
    nome,
    email,
    cpf,
    descricao,
    status: 'pendente',
    prazo_resposta: prazo.toISOString().split('T')[0],
  })

  return NextResponse.redirect(new URL(`/lgpd/${empresa_slug}?success=solicitacao_enviada`, request.url))
}
