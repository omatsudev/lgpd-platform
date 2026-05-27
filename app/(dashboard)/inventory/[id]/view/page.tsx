import type {
  Contract,
  DataCategoryDetail,
  InternationalTransfer,
  InventoryIdentification,
  SecurityMeasure,
  SharingRecipient,
} from '@/app/actions/inventory'
import { PrintButton } from '@/components/inventory/print-button'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowLeft, Pencil } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const riskVariant: Record<string, 'destructive' | 'warning' | 'success'> = {
  high: 'destructive',
  alto: 'destructive',
  medium: 'warning',
  medio: 'warning',
  low: 'success',
  baixo: 'success',
}
const riskLabel: Record<string, string> = {
  high: 'Alto',
  alto: 'Alto',
  medium: 'Médio',
  medio: 'Médio',
  low: 'Baixo',
  baixo: 'Baixo',
}
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ViewInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { companyId, company, supabase } = await getUserCompany()

  const { data: item } = await supabase
    .from('data_inventory')
    .select('*')
    .eq('id', id)
    .eq('company_id', companyId ?? '')
    .single()

  if (!item) notFound()

  const risk = item.risk_level ?? 'low'
  const recordStatus = item.record_status ?? 'draft'
  const title = item.process_name || item.data_type || '—'

  // identification column may contain data saved with old Portuguese keys — support both
  const rawIdentification = (item.identification ?? (item as any).identificacao ?? {}) as Record<
    string,
    any
  >
  const identification: Partial<InventoryIdentification> = {
    controller: rawIdentification.controller ?? rawIdentification.controlador,
    dpo: rawIdentification.dpo,
    legalRepresentative:
      rawIdentification.legalRepresentative ?? rawIdentification.representante_legal,
  }
  const categoryDetails = (item.data_categories_detail ?? []) as DataCategoryDetail[]
  const sharedDetails = (item.shared_details ?? []) as SharingRecipient[]
  const securityDetail = (item.security_measures_detail ?? []) as SecurityMeasure[]
  const transferList = (item.international_transfers ?? []) as InternationalTransfer[]
  const contractsList = (item.contracts ?? (item as any).contratos ?? []) as Contract[]

  const controller = identification.controller as Record<string, string> | undefined

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500">Visualização do registro de inventário</p>
        </div>
        <div className="flex gap-2">
          <PrintButton />
          <Link href={`/inventory/${id}`}>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-1" /> Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Cabeçalho para impressão */}
      <div className="hidden print:block mb-6">
        <p className="text-xs text-gray-500">{company?.name}</p>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500">Inventário de Dados — LGPD</p>
      </div>

      {/* Identificação (Controlador / DPO / Representante) */}
      {(controller?.name || identification.dpo || identification.legalRepresentative) && (
        <SectionCard title="Identificação">
          <div className="space-y-4">
            {(controller?.name || controller?.email) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Controlador
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="Nome" value={controller?.name} />
                  <Campo label="E-mail" value={controller?.email} />
                  <Campo label="Telefone" value={controller?.phone} />
                  <Campo label="Endereço" value={controller?.address} />
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <Campo label="DPO (Encarregado)" value={identification.dpo} />
              <Campo label="Representante Legal" value={identification.legalRepresentative} />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Identificação do Processo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-3">
            Identificação do Processo
            <Badge variant={riskVariant[risk] ?? 'secondary'}>{riskLabel[risk] ?? risk}</Badge>
            <Badge variant={recordStatus === 'complete' ? 'default' : 'secondary'}>
              {statusLabel[recordStatus] ?? status}
            </Badge>
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

      {/* Ciclo de Vida */}
      {(item.retention_period || item.storage_location || item.storage_type) && (
        <SectionCard title="Ciclo de Vida dos Dados">
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Prazo de retenção" value={item.retention_period} />
            <Campo label="Local de armazenamento" value={item.storage_location} />
            <Campo label="Tipo de armazenamento" value={item.storage_type} />
            <Campo label="Fonte dos dados" value={item.data_source} />
          </div>
        </SectionCard>
      )}

      {/* Detalhe por Categoria */}
      {categoryDetails.length > 0 && (
        <SectionCard title="Detalhe por Categoria de Dados">
          <div className="space-y-4">
            {categoryDetails.map((cat, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {cat.categoryId.replace(/_/g, ' ')}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="Descrição" value={cat.description} />
                  <Campo label="Tempo de retenção" value={cat.retentionPeriod} />
                  <Campo label="Fonte" value={cat.source} />
                  <Campo label="Base legal" value={cat.legalBasis} />
                  <Campo label="Finalidade" value={cat.purpose} />
                  <Campo label="Local armazenamento" value={cat.storageLocation} />
                  <Campo label="Categoria do titular" value={cat.dataSubjectCategory} />
                  <Campo label="Setor responsável" value={cat.responsibleDepartment} />
                  <Campo label="Necessidade de DPIA" value={cat.dpiaRequired} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Compartilhamento */}
      {item.data_shared && (
        <SectionCard title="Compartilhamento">
          {sharedDetails.length > 0 ? (
            <div className="space-y-3">
              {sharedDetails.map((s, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-3">
                  <Campo label="Com quem" value={s.recipient} />
                  <Campo label="Finalidade" value={s.purpose} />
                </div>
              ))}
            </div>
          ) : (
            <Campo label="Compartilhado com" value={item.shared_with} />
          )}
        </SectionCard>
      )}

      {/* Medidas de Segurança */}
      {securityDetail.length > 0 && (
        <SectionCard title="Medidas de Segurança e Privacidade">
          <div className="space-y-3">
            {securityDetail.map((m, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-3">
                <Campo label="Tipo" value={m.type} />
                <Campo label="Descrição do controle" value={m.controlDescription} />
                <Campo label="Finalidade" value={m.purpose} />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Transferência Internacional */}
      {transferList.length > 0 && (
        <SectionCard title="Transferência Internacional de Dados">
          <div className="space-y-3">
            {transferList.map((t, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="País destino" value={t.country} />
                  <Campo label="Tipo de garantia" value={t.safeguardType} />
                  <Campo label="Dados transferidos" value={t.dataTransferred} />
                  <Campo label="Finalidade" value={t.purpose} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Contratos */}
      {contractsList.length > 0 && (
        <SectionCard title="Contratos">
          <div className="space-y-3">
            {contractsList.map((c, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="Nº do processo" value={c.processNumber} />
                  <Campo label="E-mail do gestor" value={c.managerEmail} />
                  <Campo label="Objeto" value={c.subject} />
                  <Campo label="Finalidade" value={c.purpose} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <p className="text-xs text-gray-400 print:block hidden">
        Gerado em {new Date().toLocaleDateString('pt-BR')} · {company?.name}
      </p>
    </div>
  )
}
