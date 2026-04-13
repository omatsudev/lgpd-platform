import { getUserEmpresa } from '@/lib/supabase/queries'
import { CHECKLIST } from '@/lib/checklist-items'
import { formatDate } from '@/lib/utils'
import { PrintButton } from '@/components/relatorio/print-button'
import { FileText } from 'lucide-react'

// ─── Helpers ──────────────────────────────────────────────────────────────

function nivelRisco(prob: number, imp: number) {
  const s = prob * imp
  if (s >= 15) return 'Crítico'
  if (s >= 9) return 'Alto'
  if (s >= 4) return 'Médio'
  return 'Baixo'
}

function scoreChecklist(itens: any[]) {
  const total = CHECKLIST.reduce((acc, c) => acc + c.itens.length, 0)
  const map: Record<string, string> = {}
  for (const i of itens) map[i.item_key] = i.status
  const na = CHECKLIST.reduce((acc, c) => acc + c.itens.filter(i => map[i.key] === 'nao_aplicavel').length, 0)
  const done = CHECKLIST.reduce((acc, c) => acc + c.itens.filter(i => map[i.key] === 'concluido').length, 0)
  const efetivos = total - na
  return { total, done, na, efetivos, pct: efetivos > 0 ? Math.round((done / efetivos) * 100) : 0 }
}

// ─── Componentes do relatório ─────────────────────────────────────────────

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-8 print:mb-6 break-inside-avoid-page">
      <h2 className="text-lg font-bold text-gray-900 border-b-2 border-blue-600 pb-1 mb-4 print:text-base">{titulo}</h2>
      {children}
    </section>
  )
}

function MetricaBox({ label, value, sub, destaque }: { label: string; value: string | number; sub?: string; destaque?: boolean }) {
  return (
    <div className={`border rounded-lg p-4 text-center ${destaque ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
      <p className={`text-3xl font-bold ${destaque ? 'text-blue-700' : 'text-gray-900'}`}>{value}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function TabelaSimples({ headers, rows }: { headers: string[]; rows: (string | number | null | undefined)[][] }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="bg-gray-100">
          {headers.map(h => (
            <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-gray-600 uppercase border border-gray-200">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
            {row.map((cell, j) => (
              <td key={j} className="py-2 px-3 text-gray-700 border border-gray-200">{cell ?? '—'}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── Página principal ─────────────────────────────────────────────────────

export default async function RelatorioPage() {
  const { empresa, empresaId, supabase } = await getUserEmpresa()
  const hoje = new Date()
  const dataRelatorio = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  // Busca paralela de todos os módulos
  const [
    { data: inventario },
    { data: incidentes },
    { data: documentos },
    { data: riscos },
    { data: fornecedores },
    { data: checklistItens },
    { data: titulares },
    { data: consentimentos },
  ] = await Promise.all([
    supabase.from('inventario_dados').select('*').eq('empresa_id', empresaId ?? ''),
    supabase.from('incidentes').select('*').eq('empresa_id', empresaId ?? ''),
    supabase.from('documentos').select('*').eq('empresa_id', empresaId ?? ''),
    supabase.from('riscos').select('*').eq('empresa_id', empresaId ?? ''),
    supabase.from('fornecedores').select('*').eq('empresa_id', empresaId ?? ''),
    supabase.from('checklist_itens').select('*').eq('empresa_id', empresaId ?? ''),
    supabase.from('solicitacoes_titulares').select('*').eq('empresa_id', empresaId ?? ''),
    supabase.from('consentimentos').select('*').eq('empresa_id', empresaId ?? ''),
  ])

  // Métricas calculadas
  const checklist = scoreChecklist(checklistItens ?? [])
  const riscosAbertos = (riscos ?? []).filter((r: any) => r.status !== 'encerrado')
  const riscosCriticos = riscosAbertos.filter((r: any) => r.probabilidade_inerente * r.impacto_inerente >= 15)
  const fornSemDPA = (fornecedores ?? []).filter((f: any) => f.tipo_acesso !== 'sem_acesso_dados' && !f.possui_dpa)
  const docVencidos = (documentos ?? []).filter((d: any) => d.data_expiracao && new Date(d.data_expiracao) < hoje)
  const incAbertos = (incidentes ?? []).filter((i: any) => !['resolvido', 'encerrado'].includes(i.status))
  const titPendentes = (titulares ?? []).filter((t: any) => t.status === 'pendente')
  const consentAtivos = (consentimentos ?? []).filter((c: any) => c.aceito && !c.revogado)

  // Score geral de conformidade (média ponderada)
  const scoreGeral = Math.round(
    (checklist.pct * 0.4) +
    ((fornSemDPA.length === 0 ? 100 : Math.max(0, 100 - fornSemDPA.length * 20)) * 0.2) +
    ((riscosCriticos.length === 0 ? 100 : Math.max(0, 100 - riscosCriticos.length * 25)) * 0.2) +
    ((incAbertos.length === 0 ? 100 : Math.max(0, 100 - incAbertos.length * 15)) * 0.2)
  )

  const categoriaLabel: Record<string, string> = {
    privacidade: 'Privacidade', seguranca: 'Segurança', legal: 'Legal',
    operacional: 'Operacional', reputacional: 'Reputacional', tecnologico: 'Tecnológico',
  }

  const statusIncLabel: Record<string, string> = {
    identificado: 'Identificado', em_investigacao: 'Em investigação',
    contido: 'Contido', resolvido: 'Resolvido', encerrado: 'Encerrado',
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Controles — não imprimem */}
      <div className="print:hidden flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Conformidade LGPD</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerado em {dataRelatorio}</p>
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
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-widest">Relatório de Conformidade</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 print:text-xl">{empresa?.nome ?? 'Empresa'}</h1>
            {empresa?.cnpj && <p className="text-sm text-gray-500 mt-0.5">CNPJ: {empresa.cnpj}</p>}
          </div>
          <div className="text-right text-sm text-gray-500">
            <p className="font-semibold text-gray-700">{dataRelatorio}</p>
            {empresa?.dpo_nome && <p className="mt-1">DPO: {empresa.dpo_nome}</p>}
            {empresa?.dpo_email && <p>{empresa.dpo_email}</p>}
          </div>
        </div>

        {/* 1 — Score Geral */}
        <Secao titulo="1. Índice de Conformidade LGPD">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <MetricaBox label="Score Geral" value={`${scoreGeral}%`} sub="Conformidade estimada" destaque />
            <MetricaBox label="Checklist" value={`${checklist.pct}%`} sub={`${checklist.done}/${checklist.efetivos} itens`} />
            <MetricaBox label="Riscos Críticos" value={riscosCriticos.length} sub="Em aberto" />
            <MetricaBox label="Fornecedores sem DPA" value={fornSemDPA.length} sub="Pendentes" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
            <p><span className="font-medium">Metodologia:</span> Score ponderado — Checklist (40%), Fornecedores com DPA (20%), Ausência de riscos críticos (20%), Ausência de incidentes abertos (20%).</p>
          </div>
        </Secao>

        {/* 2 — Checklist */}
        <Secao titulo="2. Checklist de Adequação">
          <div className="space-y-3">
            {CHECKLIST.map(cat => {
              const map: Record<string, string> = {}
              for (const i of checklistItens ?? []) map[i.item_key] = i.status
              const done = cat.itens.filter(i => map[i.key] === 'concluido').length
              const na = cat.itens.filter(i => map[i.key] === 'nao_aplicavel').length
              const ef = cat.itens.length - na
              const pct = ef > 0 ? Math.round((done / ef) * 100) : 100
              return (
                <div key={cat.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{cat.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-10 text-right">{pct}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Secao>

        {/* 3 — Inventário */}
        <Secao titulo="3. Inventário de Dados">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricaBox label="Total de processos" value={(inventario ?? []).length} />
            <MetricaBox label="Completos" value={(inventario ?? []).filter((i: any) => i.status_registro === 'completo').length} />
            <MetricaBox label="Rascunhos" value={(inventario ?? []).filter((i: any) => i.status_registro === 'rascunho' || !i.status_registro).length} />
          </div>
          {(inventario ?? []).length > 0 && (
            <TabelaSimples
              headers={['Processo', 'Setor', 'Base Legal', 'Risco']}
              rows={(inventario ?? []).slice(0, 15).map((i: any) => [
                i.nome_processo || i.tipo_dado,
                i.setor_responsavel,
                i.base_legal,
                i.nivel_risco ?? 'baixo',
              ])}
            />
          )}
          {(inventario ?? []).length > 15 && (
            <p className="text-xs text-gray-400 mt-2">* Exibindo 15 de {(inventario ?? []).length} registros.</p>
          )}
        </Secao>

        {/* 4 — Riscos */}
        <Secao titulo="4. Gestão de Riscos">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricaBox label="Total" value={(riscos ?? []).length} />
            <MetricaBox label="Críticos" value={riscosCriticos.length} />
            <MetricaBox label="Em tratamento" value={(riscos ?? []).filter((r: any) => r.status === 'em_tratamento').length} />
            <MetricaBox label="Encerrados" value={(riscos ?? []).filter((r: any) => r.status === 'encerrado').length} />
          </div>
          {riscosAbertos.length > 0 && (
            <TabelaSimples
              headers={['Risco', 'Categoria', 'Nível', 'Estratégia', 'Status']}
              rows={riscosAbertos.slice(0, 10).map((r: any) => [
                r.titulo,
                categoriaLabel[r.categoria] ?? r.categoria,
                nivelRisco(r.probabilidade_inerente, r.impacto_inerente),
                r.estrategia ?? '—',
                r.status,
              ])}
            />
          )}
        </Secao>

        {/* 5 — Incidentes */}
        <Secao titulo="5. Incidentes de Segurança">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricaBox label="Total" value={(incidentes ?? []).length} />
            <MetricaBox label="Em aberto" value={incAbertos.length} />
            <MetricaBox label="Notificou ANPD" value={(incidentes ?? []).filter((i: any) => i.notificou_anpd).length} />
          </div>
          {(incidentes ?? []).length > 0 && (
            <TabelaSimples
              headers={['Título', 'Tipo', 'Severidade', 'Status', 'Data']}
              rows={(incidentes ?? []).slice(0, 10).map((i: any) => [
                i.titulo,
                i.tipo?.replace(/_/g, ' '),
                i.severidade,
                statusIncLabel[i.status] ?? i.status,
                i.data_descoberta ? formatDate(i.data_descoberta) : '—',
              ])}
            />
          )}
        </Secao>

        {/* 6 — Fornecedores */}
        <Secao titulo="6. Fornecedores e Terceiros">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricaBox label="Total" value={(fornecedores ?? []).length} />
            <MetricaBox label="Com DPA" value={(fornecedores ?? []).filter((f: any) => f.possui_dpa).length} />
            <MetricaBox label="Sem DPA" value={fornSemDPA.length} />
            <MetricaBox label="Internacionais" value={(fornecedores ?? []).filter((f: any) => f.transferencia_internacional).length} />
          </div>
          {fornSemDPA.length > 0 && (
            <>
              <p className="text-sm font-medium text-red-700 mb-2">Fornecedores sem DPA assinado:</p>
              <TabelaSimples
                headers={['Fornecedor', 'Categoria', 'Tipo de acesso', 'Diligência']}
                rows={fornSemDPA.map((f: any) => [
                  f.nome,
                  f.categoria,
                  f.tipo_acesso?.replace(/_/g, ' '),
                  f.status_diligencia,
                ])}
              />
            </>
          )}
        </Secao>

        {/* 7 — Documentos */}
        <Secao titulo="7. Documentos de Conformidade">
          <div className="grid grid-cols-4 gap-4 mb-4">
            <MetricaBox label="Total" value={(documentos ?? []).length} />
            <MetricaBox label="Publicados" value={(documentos ?? []).filter((d: any) => d.status === 'publicado').length} />
            <MetricaBox label="Em revisão" value={(documentos ?? []).filter((d: any) => d.status === 'em_revisao').length} />
            <MetricaBox label="Vencidos" value={docVencidos.length} />
          </div>
          {(documentos ?? []).length > 0 && (
            <TabelaSimples
              headers={['Documento', 'Tipo', 'Versão', 'Status', 'Expiração']}
              rows={(documentos ?? []).slice(0, 10).map((d: any) => [
                d.titulo,
                d.tipo?.replace(/_/g, ' '),
                `v${d.versao}`,
                d.status,
                d.data_expiracao ? formatDate(d.data_expiracao) : '—',
              ])}
            />
          )}
        </Secao>

        {/* 8 — Titulares e Consentimentos */}
        <Secao titulo="8. Direitos dos Titulares e Consentimentos">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricaBox label="Solicitações" value={(titulares ?? []).length} sub="Total recebidas" />
            <MetricaBox label="Pendentes" value={titPendentes.length} sub="Aguardando resposta" />
            <MetricaBox label="Consentimentos" value={(consentimentos ?? []).length} sub="Total registrados" />
            <MetricaBox label="Ativos" value={consentAtivos.length} sub="Não revogados" />
          </div>
        </Secao>

        {/* Rodapé */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-xs text-gray-400 flex justify-between">
          <span>Relatório gerado pela plataforma Serra Privacy</span>
          <span>{dataRelatorio}</span>
        </div>
      </div>
    </div>
  )
}
