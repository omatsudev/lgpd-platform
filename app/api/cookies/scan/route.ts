import { scanSite } from '@/lib/site-scanner'
import { getUserCompany } from '@/lib/supabase/queries'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 })
    }

    // Validate and normalize URL
    let urlNormalizada: string
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      urlNormalizada = parsed.href
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const domain = new URL(urlNormalizada).hostname
    const { companyId, user, supabase } = await getUserCompany()

    if (!user || !companyId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Create record as processing
    const { data: scan, error: insertError } = await supabase
      .from('site_scans')
      .insert({
        company_id: companyId,
        url: urlNormalizada,
        domain,
        status: 'processing',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (!scan) {
      console.error('site_scans insert error:', insertError)
      return NextResponse.json(
        { error: insertError?.message ?? 'Erro ao criar scan — verifique as permissões do banco' },
        { status: 500 },
      )
    }

    // Run the scan
    try {
      const resultado = await scanSite(urlNormalizada)

      await supabase
        .from('site_scans')
        .update({
          status: 'completed',
          cookies: resultado.cookies,
          technologies: resultado.technologies,
          has_cookie_banner: resultado.has_cookie_banner,
          has_privacy_policy: resultado.has_privacy_policy,
          privacy_policy_url: resultado.privacy_policy_url,
          compliance_score: resultado.compliance_score,
          issues: resultado.issues,
          recommendations: resultado.recommendations,
        })
        .eq('id', scan.id)

      return NextResponse.json({ id: scan.id, resultado })
    } catch (err: any) {
      await supabase
        .from('site_scans')
        .update({ status: 'error', error_message: err.message ?? 'Falha ao escanear o site' })
        .eq('id', scan.id)

      return NextResponse.json(
        { id: scan.id, error: err.message ?? 'Falha ao escanear' },
        { status: 422 },
      )
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 })
  }
}
