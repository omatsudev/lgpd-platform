import { Cookie } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDateTime } from '@/lib/utils'
import { ScanForm } from '@/components/cookies/scan-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function CookiesPage() {
  const { companyId, supabase } = await getUserCompany()

  const { data: scans } = companyId
    ? await supabase
        .from('site_scans')
        .select('id, url, domain, status, compliance_score, has_cookie_banner, has_privacy_policy, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(20)
    : { data: [] }

  const historico = scans ?? []

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Verificador de Site</h1>
        <p className="text-sm text-gray-500 mt-0.5">Analise cookies, rastreadores e conformidade LGPD do seu site</p>
      </div>

      <ScanForm />

      {historico.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Scans anteriores</h2>
          <div className="grid gap-2">
            {historico.map((scan: any) => {
              const score = scan.compliance_score
              const scoreColor = score == null ? 'text-gray-400'
                : score >= 80 ? 'text-green-600'
                : score >= 50 ? 'text-yellow-600'
                : 'text-red-600'

              return (
                <Card key={scan.id} className="hover:bg-gray-50 transition-colors">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <Cookie className="h-4 w-4 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{scan.domain}</p>
                          <p className="text-xs text-gray-400">{formatDateTime(scan.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {scan.status === 'completed' && score != null && (
                          <span className={`text-lg font-bold ${scoreColor}`}>{score}</span>
                        )}
                        {scan.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">Erro</Badge>
                        )}
                        {scan.status === 'processing' && (
                          <Badge variant="secondary" className="text-xs">Processando</Badge>
                        )}
                        {scan.status === 'completed' && (
                          <Link href={`/cookies/${scan.id}`}>
                            <Button variant="ghost" size="sm">Ver</Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
