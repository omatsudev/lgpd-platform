import { notFound } from 'next/navigation'
import { ArrowLeft, CheckCircle2, XCircle, MinusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { formatDateTime } from '@/lib/utils'
import { RevogarForm } from '@/components/consentimentos/revogar-form'

const canalLabel: Record<string, string> = {
  web: 'Web', app: 'App', presencial: 'Presencial', email: 'E-mail', api: 'API',
}

export default async function ConsentimentoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { empresaId, supabase } = await getUserEmpresa()

  const { data: reg } = await supabase
    .from('consentimentos')
    .select('*, consentimento_finalidades(nome, descricao, base_legal)')
    .eq('id', id)
    .single()

  if (!reg) notFound()

  const status = reg.revogado ? 'revogado' : reg.aceito ? 'ativo' : 'recusado'
  const finalidade = reg.consentimento_finalidades as any

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
              {status === 'revogado' && reg.revogado_em && (
                <p className="text-xs text-gray-600">Revogado em {formatDateTime(reg.revogado_em)}</p>
              )}
              {status === 'revogado' && reg.motivo_revogacao && (
                <p className="text-xs text-gray-600 mt-0.5">Motivo: {reg.motivo_revogacao}</p>
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
          <Row label="E-mail" value={reg.titular_email} />
          <Row label="Nome" value={reg.titular_nome} />
          <Row label="CPF" value={reg.titular_cpf} />
        </CardContent>
      </Card>

      {/* Finalidade */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Finalidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Nome" value={finalidade?.nome} />
          <Row label="Descrição" value={finalidade?.descricao} />
          <Row label="Base legal" value={finalidade?.base_legal} />
        </CardContent>
      </Card>

      {/* Metadados */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Metadados de Coleta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <Row label="Canal" value={canalLabel[reg.canal] ?? reg.canal} />
          <Row label="Versão da política" value={reg.versao_politica} />
          <Row label="IP de origem" value={reg.ip_origem} mono />
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
