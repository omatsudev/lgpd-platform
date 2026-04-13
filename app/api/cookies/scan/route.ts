import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { escanearSite } from '@/lib/site-scanner'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 })
    }

    // Valida e normaliza a URL
    let urlNormalizada: string
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`)
      urlNormalizada = parsed.href
    } catch {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
    }

    const dominio = new URL(urlNormalizada).hostname
    const { empresaId } = await getUserEmpresa()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !empresaId) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Cria registro como processando
    const { data: scan } = await supabase
      .from('site_scans')
      .insert({
        empresa_id: empresaId,
        url: urlNormalizada,
        dominio,
        status: 'processando',
        created_by: user.id,
      })
      .select('id')
      .single()

    if (!scan) {
      return NextResponse.json({ error: 'Erro ao criar scan' }, { status: 500 })
    }

    // Executa o scan
    try {
      const resultado = await escanearSite(urlNormalizada)

      await supabase
        .from('site_scans')
        .update({
          status: 'concluido',
          cookies: resultado.cookies,
          tecnologias: resultado.tecnologias,
          tem_banner_cookies: resultado.tem_banner_cookies,
          tem_politica_privacidade: resultado.tem_politica_privacidade,
          url_politica_privacidade: resultado.url_politica_privacidade,
          score_conformidade: resultado.score_conformidade,
          problemas: resultado.problemas,
          recomendacoes: resultado.recomendacoes,
        })
        .eq('id', scan.id)

      return NextResponse.json({ id: scan.id, resultado })
    } catch (err: any) {
      await supabase
        .from('site_scans')
        .update({ status: 'erro', erro_mensagem: err.message ?? 'Falha ao escanear o site' })
        .eq('id', scan.id)

      return NextResponse.json({ id: scan.id, error: err.message ?? 'Falha ao escanear' }, { status: 422 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Erro interno' }, { status: 500 })
  }
}
