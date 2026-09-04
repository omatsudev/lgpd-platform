import type { SupabaseClient } from '@supabase/supabase-js'

function getClientIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  return headers.get('x-real-ip') ?? null
}

export async function logAuditEvent(
  supabase: SupabaseClient<any, any, any>,
  requestHeaders: Headers,
  params: {
    userId: string
    userEmail: string
    action: string
    resource: string
    details?: string
    companyId?: string | null
  },
) {
  let companyId = params.companyId
  if (companyId === undefined) {
    const { data: ucRows } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', params.userId)
      .order('created_at')
      .limit(1)
    companyId = ucRows?.[0]?.company_id ?? null
  }

  await supabase.from('audit_logs').insert({
    company_id: companyId,
    user_id: params.userId,
    user_email: params.userEmail,
    action: params.action,
    resource: params.resource,
    details: params.details ?? null,
    ip: getClientIp(requestHeaders),
    user_agent: requestHeaders.get('user-agent'),
  })
}
