import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { nome, email, telefone, cargo, site_empresa, assunto, aceite_comercial, aceite_privacidade } = body

  if (!nome || !email || !telefone || !cargo || !assunto || !aceite_privacidade) {
    return NextResponse.json({ error: 'Campos obrigatórios não preenchidos.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'E-mail inválido.' }, { status: 400 })
  }

  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

  const supabase = await createClient()

  const { error } = await supabase.from('leads').insert({
    nome,
    email,
    telefone,
    cargo,
    site_empresa: site_empresa || null,
    assunto,
    aceite_comercial: aceite_comercial || false,
    aceite_privacidade: true,
    source_ip: ip,
  })

  if (error) {
    return NextResponse.json({ error: 'Erro ao enviar. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
