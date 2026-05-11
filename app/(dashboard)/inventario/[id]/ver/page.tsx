import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getUserCompany } from '@/lib/supabase/queries'
import { PrintButton } from '@/components/inventario/print-button'
import type {
  IdentificacaoInventario,
  CategoriaDetalhe,
  CompartilhamentoItem,
  MedidaSegurancaItem,
  TransferenciaItem,
  ContratoItem,
} from '@/app/actions/inventario'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const riscoVariant: Record<string, 'destructive' | 'warning' | 'success'> = {
  high: 'destructive', alto: 'destructive',
  medium: 'warning',   medio: 'warning',
  low: 'success',      baixo: 'success',
}
const riscoLabel: Record<string, string> = {
  high: 'Alto', alto: 'Alto', medium: 'Médio', medio: 'Médio', low: 'Baixo', baixo: 'Baixo',
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
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

  const risco  = item.risk_level   ?? 'low'
  const status = item.record_status ?? 'draft'
  const nome   = item.process_name  || item.data_type || '—'

  const identificacao      = (item.identificacao             ?? {}) as Partial<IdentificacaoInventario>
  const categoriaDetalhes  = (item.data_categories_detail    ?? []) as CategoriaDetalhe[]
  const sharedDetails      = (item.shared_details            ?? []) as CompartilhamentoItem[]
  const securityDetail     = (item.security_measures_detail  ?? []) as MedidaSegurancaItem[]
  const transferenciaList  = (item.transferencia_internacional ?? []) as TransferenciaItem[]
  const contratosList      = (item.contratos                 ?? []) as ContratoItem[]

  const controlador = identificacao.controlador

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

      {/* Identificação (Controlador / DPO / Representante) */}
      {(controlador?.nome || identificacao.dpo || identificacao.representante_legal) && (
        <SectionCard title="Identificação">
          <div className="space-y-4">
            {(controlador?.nome || controlador?.email) && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Controlador</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="Nome"     value={controlador?.nome}     />
                  <Campo label="E-mail"   value={controlador?.email}    />
                  <Campo label="Telefone" value={controlador?.telefone} />
                  <Campo label="Endereço" value={controlador?.endereco} />
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <Campo label="DPO (Encarregado)"    value={identificacao.dpo}                 />
              <Campo label="Representante Legal"  value={identificacao.representante_legal} />
            </div>
          </div>
        </SectionCard>
      )}

      {/* Identificação do Processo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-3">
            Identificação do Processo
            <Badge variant={riscoVariant[risco] ?? 'secondary'}>{riscoLabel[risco] ?? risco}</Badge>
            <Badge variant={status === 'complete' ? 'default' : 'secondary'}>{statusLabel[status] ?? status}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <Campo label="Nome do processo"     value={item.process_name}          />
          <Campo label="Setor responsável"    value={item.responsible_department} />
          <Campo label="Base legal"           value={item.legal_basis}            />
          <Campo label="Finalidade"           value={item.purpose}                />
          <Campo label="Tipo de dado"         value={item.data_type}              />
          <Campo label="Categoria dos titulares" value={item.data_subject_category} />
          <Campo label="Descrição do processo" value={item.process_description}   />
          <Campo label="Descrição dos dados"  value={item.data_description}       />
        </CardContent>
      </Card>

      {/* Ciclo de Vida */}
      {(item.retention_period || item.storage_location || item.storage_type) && (
        <SectionCard title="Ciclo de Vida dos Dados">
          <div className="grid sm:grid-cols-2 gap-4">
            <Campo label="Prazo de retenção"    value={item.retention_period}  />
            <Campo label="Local de armazenamento" value={item.storage_location} />
            <Campo label="Tipo de armazenamento" value={item.storage_type}     />
            <Campo label="Fonte dos dados"      value={item.data_source}       />
          </div>
        </SectionCard>
      )}

      {/* Detalhe por Categoria */}
      {categoriaDetalhes.length > 0 && (
        <SectionCard title="Detalhe por Categoria de Dados">
          <div className="space-y-4">
            {categoriaDetalhes.map((cat, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  {cat.categoria_id.replace(/_/g, ' ')}
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="Descrição"            value={cat.descricao}           />
                  <Campo label="Tempo de retenção"    value={cat.tempo_retencao}      />
                  <Campo label="Fonte"                value={cat.fonte}               />
                  <Campo label="Base legal"           value={cat.base_legal}          />
                  <Campo label="Finalidade"           value={cat.finalidade}          />
                  <Campo label="Local armazenamento"  value={cat.local_armazenamento} />
                  <Campo label="Categoria do titular" value={cat.categoria_titular}   />
                  <Campo label="Setor responsável"    value={cat.setor_responsavel}   />
                  <Campo label="Necessidade de DPIA"  value={cat.necessidade_dpia}    />
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
                  <Campo label="Com quem"   value={s.com_quem}   />
                  <Campo label="Finalidade" value={s.finalidade} />
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
                <Campo label="Tipo"                value={m.tipo}               />
                <Campo label="Descrição do controle" value={m.descricao_controle} />
                <Campo label="Finalidade"          value={m.finalidade}         />
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Transferência Internacional */}
      {transferenciaList.length > 0 && (
        <SectionCard title="Transferência Internacional de Dados">
          <div className="space-y-3">
            {transferenciaList.map((t, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="País destino"        value={t.pais}               />
                  <Campo label="Tipo de garantia"    value={t.tipo_garantia}      />
                  <Campo label="Dados transferidos"  value={t.dados_transferidos} />
                  <Campo label="Finalidade"          value={t.finalidade}         />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Contratos */}
      {contratosList.length > 0 && (
        <SectionCard title="Contratos">
          <div className="space-y-3">
            {contratosList.map((c, i) => (
              <div key={i} className="rounded-lg border border-gray-100 p-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <Campo label="Nº do processo"  value={c.numero_processo} />
                  <Campo label="E-mail do gestor" value={c.email_gestor}   />
                  <Campo label="Objeto"          value={c.objeto}          />
                  <Campo label="Finalidade"      value={c.finalidade}      />
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
