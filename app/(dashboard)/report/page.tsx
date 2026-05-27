import { PrintButton } from '@/components/report/print-button'
import { CHECKLIST } from '@/lib/checklist-items'
import { getUserCompany } from '@/lib/supabase/queries'
import { formatDate } from '@/lib/utils'
import { FileText } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────

function nivelRisco(prob: number, imp: number) {
  const s = prob * imp
  if (s >= 15) return 'Crítico'
  if (s >= 9) return 'Alto'
  if (s >= 4) return 'Médio'
  return 'Baixo'
}

function scoreChecklist(checklistItems: any[]) {
  const total = CHECKLIST.reduce((acc, c) => acc + c.items.length, 0)
  const map: Record<string, string> = {}
  for (const i of checklistItems) map[i.item_key] = i.status
  const na = CHECKLIST.reduce(
    (acc, c) => acc + c.items.filter((i) => map[i.key] === 'not_applicable').length,
    0,
  )
  const done = CHECKLIST.reduce(
    (acc, c) => acc + c.items.filter((i) => map[i.key] === 'completed').length,
    0,
  )
  const efetivos = total - na
  return { total, done, na, efetivos, pct: efetivos > 0 ? Math.round((done / efetivos) * 100) : 0 }
}

// ─── Componentes do relatório ─────────────────────────────────────────────

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 print:mb-6 break-inside-avoid-page">
      <h2 className="text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-1 mb-4 print:text-base">
        {titulo}
      </h2>
      {children}
    </section>
  )
}

function MetricaBox({
  label,
  value,
  sub,
  destaque,
}: {
  label: string
  value: string | number
  sub?: string
  destaque?: boolean
}) {
  return (
    <div
      className={`border rounded-lg p-4 text-center ${destaque ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
    >
      <p className={`text-3xl font-bold ${destaque ? 'text-blue-700' : 'text-gray-900'}`}>
        {value}
      </p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function TabelaSimples({
  headers,
  rows,
}: {
  headers: string[]
  rows: (string | number | null | undefined)[][]
}) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100">
          {headers.map((h) => (
            <th
              key={h}
              className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border border-gray-200"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, j) => (
              <td key={j} className="py-2 px-3 text-gray-700 border border-gray-200">
                {cell ?? '—'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────

export default async function RelatorioPage() {
  const { company, companyId, supabase } = await getUserCompany()
  const hoje = new Date()
  const reportDate = hoje.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Busca paralela de todos os módulos
  const [
    { data: inventory },
    { data: incidents },
    { data: documents },
    { data: risks },
    { data: suppliers },
    { data: checklistItens },
    { data: dataSubjects },
    { data: consents },
  ] = await Promise.all([
    supabase
      .from('data_inventory')
      .select('*')
      .eq('company_id', companyId ?? ''),
    supabase
      .from('incidents')
      .select('*')
      .eq('company_id', companyId ?? ''),
    supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId ?? ''),
    supabase
      .from('risks')
      .select('*')
      .eq('company_id', companyId ?? ''),
    supabase
      .from('suppliers')
      .select('*')
      .eq('company_id', companyId ?? ''),
    supabase
      .from('checklist_items')
      .select('*')
      .eq('company_id', companyId ?? ''),
    supabase
      .from('data_subject_requests')
      .select('*')
      .eq('company_id', companyId ?? ''),
    supabase
      .from('consents')
      .select('*')
      .eq('company_id', companyId ?? ''),
  ])

  // Métricas calculadas
  const checklist = scoreChecklist(checklistItens ?? [])
  const openRisks = (risks ?? []).filter((r: any) => r.status !== 'closed')
  const criticalRisks = openRisks.filter(
    (r: any) => r.inherent_probability * r.inherent_impact >= 15,
  )
  const suppliersWithoutDPA = (suppliers ?? []).filter(
    (f: any) => f.access_type !== 'no_data_access' && !f.has_dpa,
  )
  const expiredDocuments = (documents ?? []).filter(
    (d: any) => d.expiration_date && new Date(d.expiration_date) < hoje,
  )
  const openIncidents = (incidents ?? []).filter(
    (i: any) => !['resolved', 'closed'].includes(i.status),
  )
  const pendingDataSubjects = (dataSubjects ?? []).filter((t: any) => t.status === 'pending')
  const activeConsents = (consents ?? []).filter((c: any) => c.accepted && !c.revoked)

  // Score geral de conformidade (média ponderada)
  const overallScore = Math.round(
    checklist.pct * 0.4 +
      (suppliersWithoutDPA.length === 0 ? 100 : Math.max(0, 100 - suppliersWithoutDPA.length * 20)) * 0.2 +
      (criticalRisks.length === 0 ? 100 : Math.max(0, 100 - criticalRisks.length * 25)) * 0.2 +
      (openIncidents.length === 0 ? 100 : Math.max(0, 100 - openIncidents.length * 15)) * 0.2,
  )

  const categoryLabel: Record<string, string> = {
    privacy: 'Privacidade',
    security: 'Segurança',
    legal: 'Legal',
    operational: 'Operacional',
    reputational: 'Reputacional',
    technological: 'Tecnológico',
  }

  const incidentStatusLabel: Record<string, string> = {
    identified: 'Identificado',
    under_investigation: 'Em investigação',
    contained: 'Contido',
    resolved: 'Resolvido',
    closed: 'Encerrado',
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Controles — não imprimem */}
      <div className="print:hidden flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Conformidade LGPD</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerado em {reportDate}</p>
        </div>
        <PrintButton />
      </div>

      {/* ── DOCUMENTO IMPRIMÍVEL ─────────────────────────────────────── */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 print:rounded-none">
        {/* Cabeçalho do documento */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-blue-600 print:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">
                Relatório de Conformidade
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
              {company?.name ?? 'Empresa'}
            </h1>
            {company?.tax_id && (
              <p className="text-sm text-gray-500 mt-0.5">CNPJ: {company.tax_id}</p>
            )}
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-gray-700">{reportDate}</p>
            {company?.dpo_name && <p className="mt-1">DPO: {company.dpo_name}</p>}
            {company?.dpo_email && <p>{company.dpo_email}</p>}
          </div>
        </div>

        {/* 1 — Score Geral */}
        <Secao titulo="1. Índice de Conformidade LGPD">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <MetricaBox
              label="Score Geral"
              value={`${overallScore}%`}
              sub="Conformidade estimada"
              destaque
            />
            <MetricaBox
              label="Checklist"
              value={`${checklist.pct}%`}
              sub={`${checklist.done}/${checklist.efetivos} itens`}
            />
            <MetricaBox label="Riscos Críticos" value={criticalRisks.length} sub="Em aberto" />
            <MetricaBox label="Fornecedores sem DPA" value={suppliersWithoutDPA.length} sub="Pendentes" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p>
              <span className="font-medium">Metodologia:</span> Score ponderado — Checklist (40%),
              Fornecedores com DPA (20%), Ausência de risks críticos (20%), Ausência de incidents
              abertos (20%).
            </p>
          </div>
        </Secao>

        {/* 2 — Checklist */}
        <Secao titulo="2. Checklist de Adequação">
          {(() => {
            const checklistMap: Record<string, string> = {}
            for (const i of checklistItens ?? []) checklistMap[i.item_key] = i.status

            // Itens pendentes / em andamento (críticos e altos primeiro)
            const pendingItems = CHECKLIST.flatMap((cat) =>
              cat.items
                .filter(
                  (i) =>
                    !['completed', 'not_applicable'].includes(checklistMap[i.key] ?? 'pending'),
                )
                .map((i) => ({
                  ...i,
                  categoria: cat.label,
                  statusAtual: checklistMap[i.key] ?? 'pending',
                })),
            ).sort((a, b) => {
              const ordem: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 }
              return (ordem[a.priority] ?? 3) - (ordem[b.priority] ?? 3)
            })

            const priorityLabel: Record<string, { label: string; color: string }> = {
              critical: { label: 'Crítica', color: 'bg-red-100 text-red-700' },
              high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
              medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
              low: { label: 'Baixa', color: 'bg-gray-100 text-gray-600' },
            }

            const statusLabel: Record<string, string> = {
              pending: 'Pendente',
              in_progress: 'Em andamento',
            }

            return (
              <>
                {/* Progresso por categoria */}
                <div className="space-y-2 mb-6">
                  {CHECKLIST.map((cat) => {
                    const done = cat.items.filter((i) => checklistMap[i.key] === 'completed').length
                    const na = cat.items.filter(
                      (i) => checklistMap[i.key] === 'not_applicable',
                    ).length
                    const ef = cat.items.length - na
                    const pct = ef > 0 ? Math.round((done / ef) * 100) : 100
                    return (
                      <div
                        key={cat.id}
                        className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-sm text-gray-700">{cat.label}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-10 text-right">
                            {pct}%
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pendências */}
                {pendingItems.length > 0 && (
                  <>
                    <p className="text-sm font-semibold text-gray-800 mb-3">
                      Pendências ({pendingItems.length} ite
                      {pendingItems.length > 1 ? 'ns' : 'm'})
                    </p>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border border-gray-200">
                            Item
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border border-gray-200">
                            Categoria
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border border-gray-200">
                            Prioridade
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border border-gray-200">
                            Status
                          </th>
                          <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border border-gray-200">
                            Ref.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingItems.map((item, idx) => {
                          const prio = priorityLabel[item.priority] ?? priorityLabel.low
                          return (
                            <tr
                              key={item.key}
                              className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                            >
                              <td className="py-2 px-3 border border-gray-200">
                                <p className="font-medium text-gray-800">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                              </td>
                              <td className="py-2 px-3 text-gray-600 border border-gray-200 text-xs">
                                {item.categoria}
                              </td>
                              <td className="py-2 px-3 border border-gray-200">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${prio.color}`}
                                >
                                  {prio.label}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-gray-600 border border-gray-200 text-xs">
                                {statusLabel[item.statusAtual] ?? item.statusAtual}
                              </td>
                              <td className="py-2 px-3 text-blue-500 border border-gray-200 text-xs font-mono">
                                {item.referencia ?? '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </>
                )}

                {pendingItems.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    <span>✓</span> Todos os itens aplicáveis foram concluídos.
                  </div>
                )}
              </>
            )
          })()}
        </Secao>

        {/* 3 — Inventário */}
        <Secao titulo="3. Inventário de Dados">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricaBox label="Total de processos" value={(inventory ?? []).length} />
            <MetricaBox
              label="Completos"
              value={(inventory ?? []).filter((i: any) => i.record_status === 'complete').length}
            />
            <MetricaBox
              label="Rascunhos"
              value={
                (inventory ?? []).filter(
                  (i: any) => i.record_status === 'draft' || !i.record_status,
                ).length
              }
            />
          </div>
          {(inventory ?? []).length > 0 && (
            <TabelaSimples
              headers={['Processo', 'Setor', 'Base Legal', 'Risco']}
              rows={(inventory ?? [])
                .slice(0, 15)
                .map((i: any) => [
                  i.process_name || i.data_type,
                  i.responsible_department,
                  i.legal_basis,
                  i.risk_level ?? 'low',
                ])}
            />
          )}
          {(inventory ?? []).length > 15 && (
            <p className="text-xs text-gray-400 mt-2">
              * Exibindo 15 de {(inventory ?? []).length} registros.
            </p>
          )}
        </Secao>

        {/* 4 — Riscos */}
        <Secao titulo="4. Gestão de Riscos">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricaBox label="Total" value={(risks ?? []).length} />
            <MetricaBox label="Críticos" value={criticalRisks.length} />
            <MetricaBox
              label="Em tratamento"
              value={(risks ?? []).filter((r: any) => r.status === 'under_treatment').length}
            />
            <MetricaBox
              label="Encerrados"
              value={(risks ?? []).filter((r: any) => r.status === 'closed').length}
            />
          </div>
          {openRisks.length > 0 && (
            <TabelaSimples
              headers={['Risco', 'Categoria', 'Nível', 'Estratégia', 'Status']}
              rows={openRisks
                .slice(0, 10)
                .map((r: any) => [
                  r.title,
                  categoryLabel[r.category] ?? r.category,
                  nivelRisco(r.inherent_probability, r.inherent_impact),
                  r.strategy ?? '—',
                  r.status,
                ])}
            />
          )}
        </Secao>

        {/* 5 — Incidentes */}
        <Secao titulo="5. Incidentes de Segurança">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricaBox label="Total" value={(incidents ?? []).length} />
            <MetricaBox label="Em aberto" value={openIncidents.length} />
            <MetricaBox
              label="Notificou ANPD"
              value={(incidents ?? []).filter((i: any) => i.notified_anpd).length}
            />
          </div>
          {(incidents ?? []).length > 0 && (
            <TabelaSimples
              headers={['Título', 'Tipo', 'Severidade', 'Status', 'Data']}
              rows={(incidents ?? [])
                .slice(0, 10)
                .map((i: any) => [
                  i.title,
                  i.type?.replace(/_/g, ' '),
                  i.severity,
                  incidentStatusLabel[i.status] ?? i.status,
                  i.discovery_date ? formatDate(i.discovery_date) : '—',
                ])}
            />
          )}
        </Secao>

        {/* 6 — Fornecedores */}
        <Secao titulo="6. Fornecedores e Terceiros">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricaBox label="Total" value={(suppliers ?? []).length} />
            <MetricaBox
              label="Com DPA"
              value={(suppliers ?? []).filter((f: any) => f.has_dpa).length}
            />
            <MetricaBox label="Sem DPA" value={suppliersWithoutDPA.length} />
            <MetricaBox
              label="Internacionais"
              value={(suppliers ?? []).filter((f: any) => f.international_transfer).length}
            />
          </div>
          {suppliersWithoutDPA.length > 0 && (
            <>
              <p className="text-sm font-medium text-red-700 mb-2">
                Fornecedores sem DPA assinado:
              </p>
              <TabelaSimples
                headers={['Fornecedor', 'Categoria', 'Tipo de acesso', 'Diligência']}
                rows={suppliersWithoutDPA.map((f: any) => [
                  f.name,
                  f.category,
                  f.access_type?.replace(/_/g, ' '),
                  f.due_diligence_status,
                ])}
              />
            </>
          )}
        </Secao>

        {/* 7 — Documentos */}
        <Secao titulo="7. Documentos de Conformidade">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricaBox label="Total" value={(documents ?? []).length} />
            <MetricaBox
              label="Publicados"
              value={(documents ?? []).filter((d: any) => d.status === 'published').length}
            />
            <MetricaBox
              label="Em revisão"
              value={(documents ?? []).filter((d: any) => d.status === 'under_review').length}
            />
            <MetricaBox label="Vencidos" value={expiredDocuments.length} />
          </div>
          {(documents ?? []).length > 0 && (
            <TabelaSimples
              headers={['Documento', 'Tipo', 'Versão', 'Status', 'Expiração']}
              rows={(documents ?? [])
                .slice(0, 10)
                .map((d: any) => [
                  d.title,
                  d.type?.replace(/_/g, ' '),
                  `v${d.version}`,
                  d.status,
                  d.expiration_date ? formatDate(d.expiration_date) : '—',
                ])}
            />
          )}
        </Secao>

        {/* 8 — Titulares e Consentimentos */}
        <Secao titulo="8. Direitos dos Titulares e Consentimentos">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricaBox
              label="Solicitações"
              value={(dataSubjects ?? []).length}
              sub="Total recebidas"
            />
            <MetricaBox label="Pendentes" value={pendingDataSubjects.length} sub="Aguardando resposta" />
            <MetricaBox
              label="Consentimentos"
              value={(consents ?? []).length}
              sub="Total registrados"
            />
            <MetricaBox label="Ativos" value={activeConsents.length} sub="Não revogados" />
          </div>
        </Secao>

        {/* Rodapé */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
          <span>Relatório gerado pela plataforma Serra Privacy</span>
          <span>{reportDate}</span>
        </div>
      </div>
    </div>
  )
}
