import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserCompany } from '@/lib/supabase/queries'
import { PrintButton } from '@/components/inventario/print-button'

const riscoVariant: Record<string, 'destructive' | 'warning' | 'success'> = {
  high: 'destructive', medium: 'warning', low: 'success',
}
const riscoLabel: Record<string, string> = { high: 'Alto', medium: 'Médio', low: 'Baixo' }
const statusLabel: Record<string, string> = { complete: 'Completo', draft: 'Rascunho' }

function Campo({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 mt-0.5">{value}</p>
    </div>
  )
}

export default async function VerInventarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { companyId, company, supabase } = await getUserCompany()

  const { data: item } = await supabase
    .from('data_inventory')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId ?? '')
    .single()

  if (!item) notFound()

  const risco = item.risk_level ?? 'low'
  const status = item.record_status ?? 'draft'
  const nome = item.process_name || item.data_type || '—'

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/inventario">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{nome}</h1>
          <p className="text-sm text-gray-500">Visualização do registro de inventário</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link href={`/inventario/${id}`}>
            <Button variant="outline" size="sm"><Pencil className="h-4 w-4 mr-1" /> Editar</Button>
          </Link>
        </div>
      </div>

      {/* Cabeçalho para impressão */}
      <div className="hidden print:block mb-6">
        <p className="text-xs text-gray-500">{company?.name}</p>
        <h1 className="text-2xl font-bold text-gray-900">{nome}</h1>
        <p className="text-sm text-gray-500">Inventário de Dados — LGPD</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-3">
            Identificação do Processo
            <Badge variant={riscoVariant[risco] ?? 'secondary'}>{riscoLabel[risco] ?? risco}</Badge>
            <Badge variant={status === 'complete' ? 'default' : 'secondary'}>{statusLabel[status] ?? status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Campo label="Nome do processo" value={item.process_name} />
          <Campo label="Setor responsável" value={item.responsible_department} />
          <Campo label="Base legal" value={item.legal_basis} />
          <Campo label="Finalidade" value={item.purpose} />
          <Campo label="Tipo de dado" value={item.data_type} />
          <Campo label="Categoria dos titulares" value={item.data_subject_category} />
          <Campo label="Descrição do processo" value={item.process_description} />
          <Campo label="Descrição dos dados" value={item.data_description} />
        </CardContent>
      </Card>

      {(item.retention_period || item.storage_location || item.storage_type) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Ciclo de Vida dos Dados</CardTitle></CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <Campo label="Prazo de retenção" value={item.retention_period} />
            <Campo label="Local de armazenamento" value={item.storage_location} />
            <Campo label="Tipo de armazenamento" value={item.storage_type} />
            <Campo label="Fonte dos dados" value={item.data_source} />
          </CardContent>
        </Card>
      )}

      {(item.data_shared && item.shared_with) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Compartilhamento</CardTitle></CardHeader>
          <CardContent>
            <Campo label="Compartilhado com" value={item.shared_with} />
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-gray-400 print:block hidden">
        Gerado em {new Date().toLocaleDateString('pt-BR')} · {company?.name}
      </p>
    </div>
  )
}
