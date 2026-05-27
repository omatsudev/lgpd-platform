import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/consents/public
// Registers a consent from an external site
// Body: { slug, purpose_id, email, name?, cpf?, accepted, policy_version?, channel? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, purpose_id, email, name, cpf, accepted, policy_version, channel } = body

    if (!slug || !purpose_id || !email || accepted === undefined) {
      return NextResponse.json({ error: 'Campos obrigatórios: slug, purpose_id, email, accepted' }, { status: 400 })
    }

    const supabase = await createClient()

    // Look up the company by slug
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    // Verify the purpose belongs to the company
    const { data: purpose } = await supabase
      .from('consent_purposes')
      .select('id')
      .eq('id', purpose_id)
      .eq('company_id', company.id)
      .eq('active', true)
      .single()

    if (!purpose) {
      return NextResponse.json({ error: 'Finalidade não encontrada ou inativa' }, { status: 404 })
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? req.headers.get('x-real-ip')
      ?? null
    const userAgent = req.headers.get('user-agent') ?? null

    const { data: registro, error } = await supabase
      .from('consents')
      .insert({
        company_id: company.id,
        purpose_id: purpose.id,
        subject_email: email,
        subject_name: name ?? null,
        subject_tax_id: cpf ?? null,
        accepted: Boolean(accepted),
        policy_version: policy_version ?? null,
        channel: channel ?? 'api',
        source_ip: ip,
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

// GET /api/consents/public?slug=X&email=Y&finalidade_id=Z
// Checks if a data subject has an active consent for a purpose
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const slug = searchParams.get('slug')
    const email = searchParams.get('email')
    const purpose_id = searchParams.get('purpose_id')

    if (!slug || !email) {
      return NextResponse.json({ error: 'slug e email são obrigatórios' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }

    let query = supabase
      .from('consents')
      .select('id, purpose_id, accepted, revoked, created_at')
      .eq('company_id', company.id)
      .eq('subject_email', email)
      .eq('accepted', true)
      .eq('revoked', false)

    if (purpose_id) query = query.eq('purpose_id', purpose_id)

    const { data: registros } = await query.order('created_at', { ascending: false })

    return NextResponse.json({
      tem_consentimento: (registros?.length ?? 0) > 0,
      registros: registros ?? [],
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 })
  }
}
