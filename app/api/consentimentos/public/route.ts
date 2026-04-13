import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/consentimentos/public
// Registra um consentimento vindo de um site externo
// Body: { slug, finalidade_id, email, nome?, cpf?, aceito, versao_politica?, canal? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, finalidade_id, email, nome, cpf, aceito, versao_politica, canal } = body

    if (!slug || !finalidade_id || !email || aceito === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios: slug, finalidade_id, email, aceito' }, { status: 400 })
    }

    const supabase = await createClient()

    // Busca a empresa pelo slug
    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verifica se a finalidade pertence à empresa
    const { data: finalidade } = await supabase
      .from('consentimento_finalidades')
      .select('id')
      .eq('id', finalidade_id)
      .eq('empresa_id', empresa.id)
      .eq('ativo', true)
      .single()

    if (!finalidade) {
      return NextResponse.json({ error: 'Finalidade não encontrada ou inativa' }, { status: 404 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    const { data: registro, error } = await supabase
      .from('consentimentos')
      .insert({
        empresa_id: empresa.id,
        finalidade_id: finalidade.id,
        titular_email: email,
        titular_nome: nome ?? null,
        titular_cpf: cpf ?? null,
        aceito: Boolean(aceito),
        versao_politica: versao_politica ?? null,
        canal: canal ?? 'api',
        ip_origem: ip,
        user_agent: userAgent,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ id: registro.id, registrado: true }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 })
  }
}

// GET /api/consentimentos/public?slug=X&email=Y&finalidade_id=Z
// Verifica se um titular possui consentimento ativo para uma finalidade
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const email = searchParams.get('email')
    const finalidade_id = searchParams.get('finalidade_id')

    if (!slug || !email) {
      return NextResponse.json({ error: 'slug e email são obrigatórios' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: empresa } = await supabase
      .from('empresas')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    let query = supabase
      .from('consentimentos')
      .select('id, finalidade_id, aceito, revogado, created_at')
      .eq('empresa_id', empresa.id)
      .eq('titular_email', email)
      .eq('aceito', true)
      .eq('revogado', false)

    if (finalidade_id) query = query.eq('finalidade_id', finalidade_id)

    const { data: registros } = await query.order('created_at', { ascending: false })

    return NextResponse.json({
      tem_consentimento: (registros?.length ?? 0) > 0,
      registros: registros ?? [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 })
  }
}
