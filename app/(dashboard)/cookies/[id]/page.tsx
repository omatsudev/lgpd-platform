import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { ScanForm } from '@/components/cookies/scan-form'
import { formatDateTime } from '@/lib/utils'

export default async function ScanDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { empresaId, supabase } = await getUserEmpresa()

  const { data: scan } = await supabase
    .from('site_scans')
    .select('*')
    .eq('id', id)
    .single()

  if (!scan || scan.empresa_id !== empresaId) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/cookies">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{scan.dominio}</h1>
          <p className="text-sm text-gray-500">Scan realizado em {formatDateTime(scan.created_at)}</p>
        </div>
      </div>

      <ScanForm
        scanId={scan.id}
        resultado={scan.status === 'concluido' ? {
          cookies: scan.cookies ?? [],
          tecnologias: scan.tecnologias ?? [],
          tem_banner_cookies: scan.tem_banner_cookies ?? false,
          tem_politica_privacidade: scan.tem_politica_privacidade ?? false,
          url_politica_privacidade: scan.url_politica_privacidade ?? null,
          score_conformidade: scan.score_conformidade ?? 0,
          problemas: scan.problemas ?? [],
          recomendacoes: scan.recomendacoes ?? [],
        } : undefined}
      />
    </div>
  )
}
