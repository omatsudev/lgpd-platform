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
  medium: 'warning',
  low: 'success',
}
const riskLabel: Record<string, string> = {
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
}
const statusLabel: Record<string, string> = { complete: 'Completo', draft: 'Rascunho' }

function Field({ label, value }: { label: string; value?: string | null }) {
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
                  <Field label="Nome" value={controller?.name} />
                  <Field label="E-mail" value={controller?.email} />
                  <Field label="Telefone" value={controller?.phone} />
                  <Field label="Endereço" value={controller?.address} />
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="DPO (Encarregado)" value={identification.dpo} />
              <Field label="Representante Legal" value={identification.legalRepresentative} />
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
          <Field label="Nome do processo" value={item.process_name} />
          <Field label="Setor responsável" value={item.responsible_department} />
          <Field label="Base legal" value={item.legal_basis} />
          <Field label="Finalidade" value={item.purpose} />
          <Field label="Tipo de dado" value={item.data_type} />
          <Field label="Categoria dos titulares" value={item.data_subject_category} />
          <Field label="Descrição do processo" value={item.process_description} />
          <Field label="Descrição dos dados" value={item.data_description} />
        </CardContent>
      </Card>

      {/* Ciclo de Vida */}
      {(item.retention_period || item.storage_location || item.storage_type) && (
        <SectionCard title="Ciclo de Vida dos Dados">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prazo de retenção" value={item.retention_period} />
            <Field label="Local de armazenamento" value={item.storage_location} />
            <Field label="Tipo de armazenamento" value={item.storage_type} />
            <Field label="Fonte dos dados" value={item.data_source} />
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
                  <Field label="Descrição" value={cat.description} />
                  <Field label="Tempo de retenção" value={cat.retentionPeriod} />
                  <Field label="Fonte" value={cat.source} />
                  <Field label="Base legal" value={cat.legalBasis} />
                  <Field label="Finalidade" value={cat.purpose} />
                  <Field label="Local armazenamento" value={cat.storageLocation} />
                  <Field label="Categoria do titular" value={cat.dataSubjectCategory} />
                  <Field label="Setor responsável" value={cat.responsibleDepartment} />
                  <Field label="Necessidade de DPIA" value={cat.dpiaRequired} />
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
                  <Field label="Com quem" value={s.recipient} />
                  <Field label="Finalidade" value={s.purpose} />
                </div>
              ))}
            </div>
          ) : (
            <Field label="Compartilhado com" value={item.shared_with} />
          )}
        </SectionCard>
      )}

      {/* Medidas de Segurança */}
      {securityDetail.length > 0 && (
        <SectionCard title="Medidas de Segurança e Privacidade">
          <div className="space-y-3">
            {securityDetail.map((m, i) => (
              <div key={i} className="grid sm:grid-cols-3 gap-3">
                <Field label="Tipo" value={m.type} />
                <Field label="Descrição do controle" value={m.controlDescription} />
                <Field label="Finalidade" value={m.purpose} />
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
                  <Field label="País destino" value={t.country} />
                  <Field label="Tipo de garantia" value={t.safeguardType} />
                  <Field label="Dados transferidos" value={t.dataTransferred} />
                  <Field label="Finalidade" value={t.purpose} />
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
                  <Field label="Nº do processo" value={c.processNumber} />
                  <Field label="E-mail do gestor" value={c.managerEmail} />
                  <Field label="Objeto" value={c.subject} />
                  <Field label="Finalidade" value={c.purpose} />
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
