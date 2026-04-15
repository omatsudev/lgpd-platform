import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDateTime } from '@/lib/utils'
import { RevogarForm } from '@/components/consentimentos/revogar-form'

const canalLabel: Record<string, string> = {
  web: 'Web', app: 'App', presencial: 'Presencial', email: 'E-mail', api: 'API',
}

export default async function ConsentimentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { companyId, supabase } = await getUserCompany()

  const { data: reg } = await supabase
    .from('consents')
    .select('*, consent_purposes(name, description, legal_basis)')
    .eq('id', id)
    .single()

  if (!reg) notFound()

  const status = reg.revoked ? 'revogado' : reg.accepted ? 'ativo' : 'recusado'
  const finalidade = reg.consent_purposes as any

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/consentimentos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detalhe do Consentimento</h1>
          <p className="text-sm text-gray-500">Registro imutável para fins de comprovação</p>
        </div>
      </div>

      {/* Status */}
      <Card className={
        status === 'ativo' ? 'border-green-200 bg-green-50' :
        status === 'revogado' ? 'border-red-200 bg-red-50' :
        'border-yellow-200 bg-yellow-50'
      }>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center gap-3">
            {status === 'ativo' && <CheckCircle2 className="h-6 w-6 text-green-600" />}
            {status === 'revogado' && <XCircle className="h-6 w-6 text-red-600" />}
            {status === 'recusado' && <MinusCircle className="h-6 w-6 text-yellow-600" />}
            <div>
              <p className="font-semibold text-gray-900">
                Consentimento {status === 'ativo' ? 'Ativo' : status === 'revogado' ? 'Revogado' : 'Recusado'}
              </p>
              {status === 'revogado' && reg.revoked_at && (
                <p className="text-xs text-gray-600">Revogado em {formatDateTime(reg.revoked_at)}</p>
              )}
              {status === 'revogado' && reg.revocation_reason && (
                <p className="text-xs text-gray-600 mt-0.5">Motivo: {reg.revocation_reason}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados do titular */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Titular</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="E-mail" value={reg.subject_email} />
          <Row label="Nome" value={reg.subject_name} />
          <Row label="CPF" value={reg.subject_tax_id} />
        </CardContent>
      </Card>

      {/* Finalidade */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Finalidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Nome" value={finalidade?.name} />
          <Row label="Descrição" value={finalidade?.description} />
          <Row label="Base legal" value={finalidade?.legal_basis} />
        </CardContent>
      </Card>

      {/* Metadados */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Metadados de Coleta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Canal" value={canalLabel[reg.channel] ?? reg.channel} />
          <Row label="Versão da política" value={reg.policy_version} />
          <Row label="IP de origem" value={reg.source_ip} mono />
          <Row label="Data/hora" value={formatDateTime(reg.created_at)} mono />
          {reg.user_agent && (
            <div className="pt-1">
              <p className="text-xs text-gray-500 mb-1">User agent</p>
              <p className="text-xs text-gray-700 font-mono break-all bg-gray-50 p-2 rounded">{reg.user_agent}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revogar (só se ativo) */}
      {status === 'ativo' && <RevogarForm id={reg.id} />}
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 min-w-[120px] shrink-0">{label}:</span>
      <span className={`text-gray-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
    </div>
  )
}
