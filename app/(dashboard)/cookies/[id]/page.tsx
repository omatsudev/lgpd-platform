import { ScanForm } from '@/components/cookies/scan-form'
import { Button } from '@/components/ui/button'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDateTime } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ScanDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { companyId, supabase } = await getUserCompany()

  const { data: scan } = await supabase.from('site_scans').select('*').eq('id', id).single()

  if (!scan || scan.company_id !== companyId) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/cookies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{scan.domain}</h1>
          <p className="text-sm text-gray-500">
            Scan realizado em {formatDateTime(scan.created_at)}
          </p>
        </div>
      </div>

      <ScanForm
        scanId={scan.id}
        resultado={
          scan.status === 'completed'
            ? {
                cookies: scan.cookies ?? [],
                technologies: scan.technologies ?? [],
                has_cookie_banner: scan.has_cookie_banner ?? false,
                has_privacy_policy: scan.has_privacy_policy ?? false,
                privacy_policy_url: scan.privacy_policy_url ?? null,
                compliance_score: scan.compliance_score ?? 0,
                issues: scan.issues ?? [],
                recommendations: scan.recommendations ?? [],
              }
            : undefined
        }
      />
    </div>
  )
}
