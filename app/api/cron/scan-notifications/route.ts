import { getServiceClient } from '@/lib/supabase/service'
import { NextResponse, type NextRequest } from 'next/server'

// Varredura diária (Vercel Cron, ver vercel.json) para os alertas que não
// têm um momento de "escrita" que os dispare — um documento ou um prazo de
// retenção não ficam vencidos porque alguém salvou algo, ficam vencidos
// porque o tempo passou. Idempotente: o índice único em
// notifications(company_id, type, source_table, source_id) garante que o
// mesmo registro não gera notificação duplicada em execuções seguintes.

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getServiceClient()
  const today = toDateString(new Date())
  const in30Days = toDateString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  const in60Days = toDateString(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000))

  let created = 0

  // ─── Documentos ──────────────────────────────────────────────────────
  const { data: expiredDocs } = await supabase
    .from('documents')
    .select('id, company_id, title')
    .not('expiration_date', 'is', null)
    .lt('expiration_date', today)
  const { data: expiringDocs } = await supabase
    .from('documents')
    .select('id, company_id, title')
    .not('expiration_date', 'is', null)
    .gte('expiration_date', today)
    .lte('expiration_date', in30Days)

  const docRows = [
    ...(expiredDocs ?? []).map((d) => ({
      company_id: d.company_id,
      type: 'document_expired',
      severity: 'critical',
      title: 'Documento expirado',
      message: d.title,
      link: `/documents/${d.id}`,
      source_table: 'documents',
      source_id: d.id,
    })),
    ...(expiringDocs ?? []).map((d) => ({
      company_id: d.company_id,
      type: 'document_expiring',
      severity: 'warning',
      title: 'Documento vencendo em até 30 dias',
      message: d.title,
      link: `/documents/${d.id}`,
      source_table: 'documents',
      source_id: d.id,
    })),
  ]

  // ─── Retenção e descarte ────────────────────────────────────────────
  const { data: overdueRetention } = await supabase
    .from('retention_disposals')
    .select('id, company_id, data_type')
    .eq('hold_active', false)
    .not('expiration_date', 'is', null)
    .lt('expiration_date', today)
  const { data: expiringRetention } = await supabase
    .from('retention_disposals')
    .select('id, company_id, data_type')
    .eq('hold_active', false)
    .not('expiration_date', 'is', null)
    .gte('expiration_date', today)
    .lte('expiration_date', in60Days)

  const retentionRows = [
    ...(overdueRetention ?? []).map((r) => ({
      company_id: r.company_id,
      type: 'retention_overdue',
      severity: 'critical',
      title: 'Prazo de retenção vencido — descarte necessário',
      message: r.data_type,
      link: `/retention-disposal/${r.id}`,
      source_table: 'retention_disposals',
      source_id: r.id,
    })),
    ...(expiringRetention ?? []).map((r) => ({
      company_id: r.company_id,
      type: 'retention_expiring',
      severity: 'warning',
      title: 'Prazo de retenção vencendo em até 60 dias',
      message: r.data_type,
      link: `/retention-disposal/${r.id}`,
      source_table: 'retention_disposals',
      source_id: r.id,
    })),
  ]

  // ─── Solicitações de titulares em atraso ───────────────────────────
  const { data: overdueRequests } = await supabase
    .from('data_subject_requests')
    .select('id, company_id, name, type')
    .neq('status', 'completed')
    .lt('response_deadline', today)

  const requestRows = (overdueRequests ?? []).map((r) => ({
    company_id: r.company_id,
    type: 'data_subject_overdue',
    severity: 'critical',
    title: 'Solicitação de titular com prazo vencido',
    message: `${r.name} — ${r.type}`,
    link: `/data-subjects/${r.id}`,
    source_table: 'data_subject_requests',
    source_id: r.id,
  }))

  const allRows = [...docRows, ...retentionRows, ...requestRows]

  if (allRows.length > 0) {
    const { data, error } = await supabase
      .from('notifications')
      .upsert(allRows, {
        onConflict: 'company_id,type,source_table,source_id',
        ignoreDuplicates: true,
      })
      .select('id')
    if (error) throw error
    created = data?.length ?? 0
  }

  return NextResponse.json({ scanned: allRows.length, created })
}
