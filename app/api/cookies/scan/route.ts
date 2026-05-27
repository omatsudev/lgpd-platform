import { scanSite } from '@/lib/site-scanner'
import { getUserCompany } from '@/lib/supabase/queries'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate and normalize URL
    let normalizedUrl: string
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      normalizedUrl = parsed.href
    } catch {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
    }

    const domain = new URL(normalizedUrl).hostname
    const { companyId, user, supabase } = await getUserCompany()

    if (!user || !companyId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Create record as processing
    const { data: scan, error: insertError } = await supabase
      .from('site_scans')
      .insert({
        company_id: companyId,
        url: normalizedUrl,
        domain,
        status: 'processing',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (!scan) {
      console.error('site_scans insert error:', insertError)
      return NextResponse.json(
        { error: insertError?.message ?? 'Failed to create scan — check database permissions' },
        { status: 500 },
      )
    }

    // Run the scan
    try {
      const scanResult = await scanSite(normalizedUrl)

      await supabase
        .from('site_scans')
        .update({
          status: 'completed',
          cookies: scanResult.cookies,
          technologies: scanResult.technologies,
          has_cookie_banner: scanResult.has_cookie_banner,
          has_privacy_policy: scanResult.has_privacy_policy,
          privacy_policy_url: scanResult.privacy_policy_url,
          compliance_score: scanResult.compliance_score,
          issues: scanResult.issues,
          recommendations: scanResult.recommendations,
        })
        .eq('id', scan.id)

      return NextResponse.json({ id: scan.id, result: scanResult })
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
