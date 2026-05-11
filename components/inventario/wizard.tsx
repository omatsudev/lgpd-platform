'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  salvarInventarioProfissional,
  type InventarioData,
  type CategoriaDetalhe,
  type CompartilhamentoItem,
  type MedidaSegurancaItem,
  type TransferenciaItem,
  type ContratoItem,
} from '@/app/actions/inventario'
import {
  CheckCircle2, Circle, AlertTriangle, Shield, ChevronRight, ChevronLeft,
  Info, Building2, RefreshCw, Share2, Database, Scale, Users, Archive,
  Activity, ClipboardList, Contact, Globe, FileText, Plus, Trash2,
  ChevronDown, ChevronUp,
} from 'lucide-react'

// ─── Constantes ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Identificação', icon: Contact       },
  { label: 'Processo',      icon: Building2     },
  { label: 'Ciclo de Vida', icon: RefreshCw     },
  { label: 'Dados',         icon: Database      },
  { label: 'Tratamento',    icon: Share2        },
  { label: 'Base Legal',    icon: Scale         },
  { label: 'Titular',       icon: Users         },
  { label: 'Armazenamento', icon: Archive       },
  { label: 'Transferência', icon: Globe         },
  { label: 'Contratos',     icon: FileText      },
  { label: 'Impacto',       icon: Activity      },
  { label: 'Revisão',       icon: ClipboardList },
]

// 6 fases conforme relatorio_lgpd.pdf §5 Etapa 2
const FASES = [
  { id: 'coleta',           label: 'Coleta'           },
  { id: 'uso',              label: 'Uso'               },
  { id: 'armazenamento',    label: 'Armazenamento'     },
  { id: 'compartilhamento', label: 'Compartilhamento'  },
  { id: 'retencao',         label: 'Retenção'          },
  { id: 'descarte',         label: 'Descarte'          },
]

const CATEGORIAS = [
  { id: 'identificacao_pessoal',        label: 'Identificação pessoal',        desc: 'Nome, endereço, data de nascimento, telefone' },
  { id: 'dados_governamentais',         label: 'Dados governamentais',         desc: 'CPF, RG, CNH, título de eleitor, passaporte' },
  { id: 'identificacao_eletronica',     label: 'Identificação eletrônica',     desc: 'IP, login, cookies, histórico de navegação, dispositivos' },
  { id: 'dados_financeiros',            label: 'Dados financeiros',            desc: 'Conta bancária, cartão, renda, patrimônio, dívidas' },
  { id: 'consentimentos',               label: 'Consentimentos',               desc: 'Coletados mediante autorização expressa do titular' },
  { id: 'caracteristicas_pessoais',     label: 'Características pessoais',     desc: 'Cor, altura, peso, aparência física' },
  { id: 'caracteristicas_psicologicas', label: 'Características psicológicas', desc: 'Personalidade, comportamento, preferências, opiniões' },
  { id: 'composicao_familiar',          label: 'Composição familiar',          desc: 'Estado civil, filhos, cônjuge, dependentes' },
  { id: 'educacao',                     label: 'Educação',                     desc: 'Escolaridade, cursos, diplomas, certificados, histórico escolar' },
  { id: 'profissao',                    label: 'Profissão',                    desc: 'Cargo, salário, CTPS, histórico profissional' },
  { id: 'imagem_video_voz',             label: 'Vídeo / Imagem / Voz',        desc: 'Fotos, gravações de áudio/vídeo, reconhecimento facial' },
  { id: 'dados_sensiveis',              label: 'Dados sensíveis (saúde)',      desc: 'Origem racial, religião, saúde, biometria, orientação sexual, opinião política' },
  { id: 'outros',                       label: 'Outros',                       desc: 'Outras categorias de dados não listadas acima' },
]

const BASES_LEGAIS = [
  'Consentimento do titular',
  'Execução de contrato',
  'Cumprimento de obrigação legal',
  'Execução de políticas públicas',
  'Estudos por órgão de pesquisa',
  'Exercício regular de direitos',
  'Proteção da vida',
  'Tutela da saúde',
  'Legítimo interesse',
  'Proteção ao crédito',
]

// Setores comuns — relatorio_lgpd.pdf §5 Etapa 1
const SETORES = ['RH', 'TI', 'Financeiro', 'Comercial', 'Jurídico', 'Marketing', 'Operações', 'Segurança', 'Atendimento', 'Diretoria']

// Tipos de armazenamento — relatorio_lgpd.pdf §5 Etapa 6 (múltiplos)
const TIPOS_ARMAZENAMENTO = [
  { value: 'nuvem',          label: 'Nuvem (cloud)'   },
  { value: 'servidor_local', label: 'Servidor local'  },
  { value: 'papel',          label: 'Físico / Papel'  },
  { value: 'erp',            label: 'ERP / Sistema'   },
  { value: 'terceiro',       label: 'Terceiros'        },
  { value: 'hibrido',        label: 'Híbrido'          },
]

const EVENTOS_INICIAIS = [
  'Desligamento do funcionário',
  'Encerramento do contrato',
  'Fim do atendimento',
  'Revogação do consentimento',
  'Encerramento do processo seletivo',
  'Data do pagamento',
  'Data de emissão do documento',
  'Data do acidente',
  'Outro',
]

const DESTINACOES_FINAIS = [
  'Descarte seguro',
  'Anonimização',
  'Devolução ao titular',
  'Retenção estendida (com justificativa)',
]

const TIPOS_SEGURANCA = [
  'Criptografia', 'Controle de acesso', 'Backup automático',
  'Antivírus / Antimalware', 'Firewall', 'Anonimização',
  'Pseudonimização', 'Treinamento de funcionários',
  'Política interna de segurança', 'Auditoria e monitoramento', 'Outro',
]

const TIPOS_GARANTIA = [
  'Cláusula contratual padrão (SCCs)',
  'Consentimento específico do titular',
  'Obrigação legal ou tratado internacional',
  'Decisão de adequação da ANPD',
  'Normas corporativas vinculantes (BCRs)',
  'Outro',
]

// ─── Tipos locais ────────────────────────────────────────────────────────────

type Fase = { ativo: boolean; controlador: boolean; operador: boolean }
type FormData = Omit<InventarioData, 'company_id' | 'id'>

const DEFAULT_FASE: Fase = { ativo: false, controlador: false, operador: false }

function defaultData(): FormData {
  return {
    identificacao: {
      controlador: { nome: '', endereco: '', email: '', telefone: '' },
      dpo: '',
      representante_legal: '',
    },
    process_name: '',
    responsible_department: '',
    responsible_departments: [],
    process_description: '',
    lifecycle_phases: {
      coleta:           { ...DEFAULT_FASE },
      uso:              { ...DEFAULT_FASE },
      armazenamento:    { ...DEFAULT_FASE },
      compartilhamento: { ...DEFAULT_FASE },
      retencao:         { ...DEFAULT_FASE },
      descarte:         { ...DEFAULT_FASE },
    },
    data_categories: [],
    data_categories_detail: [],
    data_description: '',
    processing_frequency: '',
    data_shared: false,
    shared_with: '',
    shared_details: [],
    purpose: '',
    legal_basis: '',
    legal_bases: [],
    consent_collection_method: '',
    data_source: '',
    data_subject_category: '',
    storage_type: '',
    storage_types: [],
    storage_location: '',
    retention_period: '',
    evento_inicial: '',
    destinacao_final: '',
    bloqueio_possivel: false,
    responsible: '',
    security_measures: '',
    security_measures_detail: [],
    transferencia_internacional: [],
    contratos: [],
    requires_dpia: 'automatic',
    risk_level: 'low',
    record_status: 'draft',
  }
}

// ─── Risco ───────────────────────────────────────────────────────────────────

function calcularRisco(data: FormData): 'baixo' | 'medio' | 'alto' {
  const temSensiveis = data.data_categories.includes('dados_sensiveis')
  const semBaseLegal = data.legal_bases.length === 0
  if (temSensiveis || semBaseLegal) return 'alto'
  if (data.data_shared || !data.retention_period) return 'medio'
  return 'baixo'
}

function sugerirRIPD(data: FormData): boolean {
  return data.data_categories.includes('dados_sensiveis') || data.data_shared
}

const riscoConfig = {
  baixo: { label: 'Baixo', color: 'text-green-600',  bg: 'bg-green-50 border-green-200',   badge: 'success'     as const },
  medio: { label: 'Médio', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', badge: 'warning'     as const },
  alto:  { label: 'Alto',  color: 'text-red-600',    bg: 'bg-red-50 border-red-200',       badge: 'destructive' as const },
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{children}</h3>
}

function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function EmptyState({ label }: { label: string }) {
  return <div className="text-center py-6 text-sm text-gray-400 border border-dashed rounded-lg">{label}</div>
}

function Pill({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Etapa 0 — Identificação ─────────────────────────────────────────────────

function StepIdentificacao({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const id = data.identificacao
  const setControlador = (field: keyof typeof id.controlador, value: string) =>
    update('identificacao', { ...id, controlador: { ...id.controlador, [field]: value } })

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <SectionTitle>Controlador</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input value={id.controlador.nome} onChange={e => setControlador('nome', e.target.value)} placeholder="Razão social ou nome do controlador" />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input type="email" value={id.controlador.email} onChange={e => setControlador('email', e.target.value)} placeholder="contato@empresa.com.br" />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input value={id.controlador.telefone} onChange={e => setControlador('telefone', e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input value={id.controlador.endereco} onChange={e => setControlador('endereco', e.target.value)} placeholder="Rua, número, cidade, estado" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <SectionTitle>DPO (Encarregado de Dados)</SectionTitle>
        <Input value={id.dpo} onChange={e => update('identificacao', { ...id, dpo: e.target.value })} placeholder="Ex: João Silva — dpo@empresa.com.br" />
      </div>
      <div className="space-y-3">
        <SectionTitle>Representante Legal</SectionTitle>
        <Input value={id.representante_legal} onChange={e => update('identificacao', { ...id, representante_legal: e.target.value })} placeholder="Ex: Maria Souza — Diretora Jurídica" />
      </div>
    </div>
  )
}

// ─── Etapa 1 — Processo ──────────────────────────────────────────────────────

function StepProcesso({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const [outroSetor, setOutroSetor] = useState('')

  const toggleSetor = (s: string) => {
    const cur = data.responsible_departments
    update('responsible_departments', cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s])
  }

  const addOutro = () => {
    if (!outroSetor.trim()) return
    if (!data.responsible_departments.includes(outroSetor.trim())) {
      update('responsible_departments', [...data.responsible_departments, outroSetor.trim()])
    }
    setOutroSetor('')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do Processo *</Label>
        <Input value={data.process_name} onChange={e => update('process_name', e.target.value)} placeholder="Ex: Gestão de Recursos Humanos, Atendimento ao Cliente..." />
      </div>
      <div className="space-y-2">
        <Label>Setores envolvidos no tratamento</Label>
        <p className="text-xs text-gray-500">Selecione todos os setores que participam deste processo.</p>
        <div className="flex flex-wrap gap-2">
          {SETORES.map(s => (
            <Pill key={s} label={s} selected={data.responsible_departments.includes(s)} onClick={() => toggleSetor(s)} />
          ))}
        </div>
        {/* Setor customizado */}
        <div className="flex gap-2 mt-2">
          <Input
            className="h-8 text-sm"
            value={outroSetor}
            onChange={e => setOutroSetor(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addOutro())}
            placeholder="Outro setor..."
          />
          <Button type="button" variant="outline" size="sm" onClick={addOutro}>Adicionar</Button>
        </div>
        {/* Setores customizados selecionados */}
        {data.responsible_departments.filter(s => !SETORES.includes(s)).map(s => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full border border-blue-400 bg-blue-50 px-3 py-1 text-xs text-blue-700 mr-1">
            {s}
            <button type="button" onClick={() => toggleSetor(s)} className="hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Descrição do Processo</Label>
        <Textarea value={data.process_description} onChange={e => update('process_description', e.target.value)} placeholder="Descreva brevemente o processo e como ele envolve dados pessoais..." rows={4} />
      </div>
    </div>
  )
}

// ─── Etapa 2 — Ciclo de Vida ─────────────────────────────────────────────────

function StepCicloVida({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const fases = data.lifecycle_phases as Record<string, Fase>

  const toggleFase = (faseId: string, field: keyof Fase, value: boolean) => {
    const updated = { ...fases, [faseId]: { ...fases[faseId], [field]: value } }
    if (field === 'ativo' && !value) updated[faseId] = { ativo: false, controlador: false, operador: false }
    update('lifecycle_phases', updated)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Marque as fases do ciclo de vida e quem atua em cada uma (controlador e/ou operador).</p>
      <div className="space-y-3">
        {FASES.map(fase => {
          const f = fases[fase.id] ?? DEFAULT_FASE
          return (
            <div key={fase.id} className={`rounded-lg border p-4 transition-colors ${f.ativo ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <CheckBox checked={f.ativo} onChange={v => toggleFase(fase.id, 'ativo', v)} label={fase.label} />
              {f.ativo && (
                <div className="mt-3 ml-6 flex gap-6">
                  <CheckBox checked={f.controlador} onChange={v => toggleFase(fase.id, 'controlador', v)} label="Controlador atua" />
                  <CheckBox checked={f.operador}    onChange={v => toggleFase(fase.id, 'operador', v)}    label="Operador atua"    />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Etapa 3 — Dados ─────────────────────────────────────────────────────────

function StepDados({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<string | null>(null)

  const toggleCategoria = (id: string) => {
    const current = data.data_categories
    if (current.includes(id)) {
      update('data_categories', current.filter(c => c !== id))
      update('data_categories_detail', data.data_categories_detail.filter(d => d.categoria_id !== id))
      if (expandedCat === id) setExpandedCat(null)
    } else {
      update('data_categories', [...current, id])
    }
  }

  const getDetail = (catId: string): CategoriaDetalhe =>
    data.data_categories_detail.find(d => d.categoria_id === catId) ?? {
      categoria_id: catId, descricao: '', tempo_retencao: '', fonte: '',
      base_legal: '', finalidade: '', local_armazenamento: '',
      categoria_titular: '', necessidade_dpia: '', setor_responsavel: '',
    }

  const updateDetail = (catId: string, field: keyof CategoriaDetalhe, value: string) => {
    const existing = data.data_categories_detail
    const idx = existing.findIndex(d => d.categoria_id === catId)
    if (idx >= 0) {
      const updated = [...existing]; updated[idx] = { ...updated[idx], [field]: value }
      update('data_categories_detail', updated)
    } else {
      update('data_categories_detail', [...existing, { ...getDetail(catId), [field]: value }])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Selecione as categorias de dados pessoais tratados neste processo.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CATEGORIAS.map(cat => {
          const selected = data.data_categories.includes(cat.id)
          const isSensivel = cat.id === 'dados_sensiveis'
          return (
            <button key={cat.id} type="button" onClick={() => toggleCategoria(cat.id)}
              onMouseEnter={() => setTooltip(cat.id)} onMouseLeave={() => setTooltip(null)}
              className={`relative text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                selected ? isSensivel ? 'border-red-400 bg-red-50 text-red-800' : 'border-blue-400 bg-blue-50 text-blue-800'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{cat.label}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isSensivel && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                  {selected ? <CheckCircle2 className="h-4 w-4 text-current" /> : <Circle className="h-4 w-4 text-gray-300" />}
                </div>
              </div>
              {tooltip === cat.id && (
                <div className="absolute left-0 top-full mt-1 z-10 w-64 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg text-xs text-gray-600">{cat.desc}</div>
              )}
            </button>
          )
        })}
      </div>

      {data.data_categories.includes('dados_sensiveis') && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span><strong>Dados sensíveis:</strong> exigem maior cuidado jurídico. O nível de risco será classificado como <strong>Alto</strong> automaticamente.</span>
        </div>
      )}

      {data.data_categories.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Detalhe por Categoria</SectionTitle>
          <p className="text-xs text-gray-500 -mt-2 mb-2">Expanda cada categoria para preencher campos específicos (base legal, retenção, fonte, etc.).</p>
          {data.data_categories.map(catId => {
            const cat = CATEGORIAS.find(c => c.id === catId)!
            const isExpanded = expandedCat === catId
            const detail = getDetail(catId)
            return (
              <div key={catId} className="rounded-lg border border-gray-200 overflow-hidden">
                <button type="button" onClick={() => setExpandedCat(isExpanded ? null : catId)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors">
                  <span className="font-medium text-gray-700">{cat.label}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Descrição específica</Label>
                        <Input className="h-8 text-sm" value={detail.descricao} onChange={e => updateDetail(catId, 'descricao', e.target.value)} placeholder="Dados específicos desta categoria..." /></div>
                      <div className="space-y-1"><Label className="text-xs">Tempo de retenção</Label>
                        <Input className="h-8 text-sm" value={detail.tempo_retencao} onChange={e => updateDetail(catId, 'tempo_retencao', e.target.value)} placeholder="Ex: 5 anos, 20 anos..." /></div>
                      <div className="space-y-1"><Label className="text-xs">Fonte</Label>
                        <Select value={detail.fonte} onValueChange={v => updateDetail(catId, 'fonte', v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="direto">Direto do titular</SelectItem>
                            <SelectItem value="terceiros">Terceiros</SelectItem>
                            <SelectItem value="publico">Fonte pública</SelectItem>
                          </SelectContent>
                        </Select></div>
                      <div className="space-y-1"><Label className="text-xs">Base legal (art. 7º LGPD)</Label>
                        <Select value={detail.base_legal} onValueChange={v => updateDetail(catId, 'base_legal', v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>{BASES_LEGAIS.map(bl => <SelectItem key={bl} value={bl}>{bl}</SelectItem>)}</SelectContent>
                        </Select></div>
                      <div className="space-y-1 sm:col-span-2"><Label className="text-xs">Finalidade</Label>
                        <Input className="h-8 text-sm" value={detail.finalidade} onChange={e => updateDetail(catId, 'finalidade', e.target.value)} placeholder="Finalidade específica para esta categoria..." /></div>
                      <div className="space-y-1"><Label className="text-xs">Local de armazenamento</Label>
                        <Input className="h-8 text-sm" value={detail.local_armazenamento} onChange={e => updateDetail(catId, 'local_armazenamento', e.target.value)} placeholder="Ex: Banco de dados X..." /></div>
                      <div className="space-y-1"><Label className="text-xs">Setor responsável</Label>
                        <Input className="h-8 text-sm" value={detail.setor_responsavel} onChange={e => updateDetail(catId, 'setor_responsavel', e.target.value)} placeholder="Ex: TI, RH..." /></div>
                      <div className="space-y-1"><Label className="text-xs">Categoria do titular</Label>
                        <Input className="h-8 text-sm" value={detail.categoria_titular} onChange={e => updateDetail(catId, 'categoria_titular', e.target.value)} placeholder="Ex: Funcionário, Cliente..." /></div>
                      <div className="space-y-1"><Label className="text-xs">Necessidade de DPIA</Label>
                        <Select value={detail.necessidade_dpia} onValueChange={v => updateDetail(catId, 'necessidade_dpia', v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                            <SelectItem value="a_avaliar">A avaliar</SelectItem>
                          </SelectContent>
                        </Select></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="space-y-2">
        <Label>Descrição adicional dos dados</Label>
        <Textarea value={data.data_description} onChange={e => update('data_description', e.target.value)} placeholder="Detalhe os dados específicos tratados, se necessário..." rows={3} />
      </div>
    </div>
  )
}

// ─── Etapa 4 — Tratamento ────────────────────────────────────────────────────

function StepTratamento({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const addCompartilhamento = () => update('shared_details', [...data.shared_details, { com_quem: '', finalidade: '' }])
  const removeCompartilhamento = (i: number) => update('shared_details', data.shared_details.filter((_, idx) => idx !== i))
  const updateCompartilhamento = (i: number, field: keyof CompartilhamentoItem, value: string) =>
    update('shared_details', data.shared_details.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Frequência do Tratamento *</Label>
        <div className="grid grid-cols-3 gap-3">
          {['Contínuo', 'Eventual', 'Único'].map(freq => (
            <button key={freq} type="button" onClick={() => update('processing_frequency', freq.toLowerCase())}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${data.processing_frequency === freq.toLowerCase() ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
              {freq}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Label>Os dados são compartilhados com terceiros?</Label>
        <div className="flex gap-3">
          {[{ value: true, label: 'Sim' }, { value: false, label: 'Não' }].map(opt => (
            <button key={String(opt.value)} type="button" onClick={() => update('data_shared', opt.value)}
              className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${data.data_shared === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        {data.data_shared && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>O compartilhamento aumenta o nível de risco e pode exigir DPA com o terceiro.</span>
            </div>
            <SectionTitle>Destinatários do compartilhamento</SectionTitle>
            {data.shared_details.length === 0 && <EmptyState label="Nenhum destinatário registrado." />}
            {data.shared_details.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Destinatário {i + 1}</span>
                  <button type="button" onClick={() => removeCompartilhamento(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-xs">Com quem</Label>
                    <Input className="h-8 text-sm" value={item.com_quem} onChange={e => updateCompartilhamento(i, 'com_quem', e.target.value)} placeholder="Ex: e-Social, Redesim, Operadora..." /></div>
                  <div className="space-y-1"><Label className="text-xs">Finalidade</Label>
                    <Input className="h-8 text-sm" value={item.finalidade} onChange={e => updateCompartilhamento(i, 'finalidade', e.target.value)} placeholder="Ex: Declaração fiscal..." /></div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addCompartilhamento} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Adicionar destinatário
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Etapa 5 — Base Legal ────────────────────────────────────────────────────

function StepBaseLegal({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const toggleBase = (bl: string) => {
    const cur = data.legal_bases
    update('legal_bases', cur.includes(bl) ? cur.filter(x => x !== bl) : [...cur, bl])
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Finalidade do Tratamento *</Label>
        <Textarea value={data.purpose} onChange={e => update('purpose', e.target.value)} placeholder="Descreva para qual finalidade os dados são tratados..." rows={3} />
      </div>
      <div className="space-y-2">
        <Label>Base(s) Legal(is) *</Label>
        <p className="text-xs text-gray-500">Selecione todas as bases legais aplicáveis (art. 7º LGPD). É possível selecionar mais de uma.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BASES_LEGAIS.map(bl => {
            const selected = data.legal_bases.includes(bl)
            return (
              <button key={bl} type="button" onClick={() => toggleBase(bl)}
                className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${selected ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span>{bl}</span>
                  {selected ? <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-600" /> : <Circle className="h-4 w-4 flex-shrink-0 text-gray-300" />}
                </div>
              </button>
            )
          })}
        </div>
        {data.legal_bases.length === 0 && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> A ausência de base legal é uma não-conformidade crítica.
          </p>
        )}
      </div>
      {data.legal_bases.includes('Consentimento do titular') && (
        <div className="space-y-2">
          <Label>Forma de coleta do consentimento *</Label>
          <Input value={data.consent_collection_method} onChange={e => update('consent_collection_method', e.target.value)} placeholder="Ex: Checkbox no site, termo assinado, WhatsApp..." />
          <p className="text-xs text-gray-500">O consentimento deve ser livre, informado, inequívoco e documentado.</p>
        </div>
      )}
    </div>
  )
}

// ─── Etapa 6 — Titular ───────────────────────────────────────────────────────

function StepTitular({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Fonte dos dados *</Label>
        <div className="grid grid-cols-3 gap-3">
          {[{ value: 'direto', label: 'Direto do titular' }, { value: 'terceiros', label: 'Terceiros' }, { value: 'publico', label: 'Fonte pública' }].map(opt => (
            <button key={opt.value} type="button" onClick={() => update('data_source', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors text-center ${data.data_source === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Categoria do titular *</Label>
        <div className="grid grid-cols-2 gap-3">
          {[{ value: 'cliente', label: 'Cliente' }, { value: 'funcionario', label: 'Funcionário' }, { value: 'fornecedor', label: 'Fornecedor' }, { value: 'lead', label: 'Lead / Prospect' }, { value: 'parceiro', label: 'Parceiro' }, { value: 'outro', label: 'Outro' }].map(opt => (
            <button key={opt.value} type="button" onClick={() => update('data_subject_category', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${data.data_subject_category === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Etapa 7 — Armazenamento e Retenção ─────────────────────────────────────

function StepArmazenamento({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const toggleTipo = (v: string) => {
    const cur = data.storage_types
    update('storage_types', cur.includes(v) ? cur.filter(x => x !== v) : [...cur, v])
  }

  const addMedida = () => update('security_measures_detail', [...data.security_measures_detail, { tipo: '', descricao_controle: '', finalidade: '' }])
  const removeMedida = (i: number) => update('security_measures_detail', data.security_measures_detail.filter((_, idx) => idx !== i))
  const updateMedida = (i: number, field: keyof MedidaSegurancaItem, value: string) =>
    update('security_measures_detail', data.security_measures_detail.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Tipo(s) de armazenamento *</Label>
        <p className="text-xs text-gray-500">Selecione todos os tipos utilizados.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TIPOS_ARMAZENAMENTO.map(opt => {
            const selected = data.storage_types.includes(opt.value)
            return (
              <button key={opt.value} type="button" onClick={() => toggleTipo(opt.value)}
                className={`rounded-lg border p-3 text-sm font-medium transition-colors ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Onde exatamente? *</Label>
        <Input value={data.storage_location} onChange={e => update('storage_location', e.target.value)} placeholder="Ex: AWS S3, Google Drive, Servidor interno, Pastas físicas..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prazo de retenção</Label>
          <Input value={data.retention_period} onChange={e => update('retention_period', e.target.value)} placeholder="Ex: 5 anos, 20 anos..." />
          {!data.retention_period && <p className="text-xs text-yellow-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Sem prazo definido aumenta o risco.</p>}
        </div>
        <div className="space-y-2">
          <Label>Responsável pelo tratamento</Label>
          <Input value={data.responsible} onChange={e => update('responsible', e.target.value)} placeholder="Nome ou setor..." />
        </div>
      </div>

      {/* Campos de retenção/descarte — politica_retencao_dados.pdf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Evento inicial (início do prazo)</Label>
          <Select value={data.evento_inicial} onValueChange={v => update('evento_inicial', v)}>
            <SelectTrigger><SelectValue placeholder="Quando começa a contar..." /></SelectTrigger>
            <SelectContent>{EVENTOS_INICIAIS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Destinação final</Label>
          <Select value={data.destinacao_final} onValueChange={v => update('destinacao_final', v)}>
            <SelectTrigger><SelectValue placeholder="Ao final do prazo..." /></SelectTrigger>
            <SelectContent>{DESTINACOES_FINAIS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Possibilidade de bloqueio de descarte?</Label>
        <div className="flex gap-3">
          {[{ v: true, l: 'Sim — dado pode ser bloqueado' }, { v: false, l: 'Não' }].map(opt => (
            <button key={String(opt.v)} type="button" onClick={() => update('bloqueio_possivel', opt.v)}
              className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${data.bloqueio_possivel === opt.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
              {opt.l}
            </button>
          ))}
        </div>
        {data.bloqueio_possivel && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>Dados bloqueáveis podem ter o descarte suspenso por: ação trabalhista, investigação, auditoria, incidente ou obrigação regulatória.</span>
          </div>
        )}
      </div>

      {/* Medidas de segurança estruturadas */}
      <div className="space-y-3">
        <SectionTitle>Medidas de segurança e privacidade</SectionTitle>
        {data.security_measures_detail.length === 0 && <EmptyState label="Nenhuma medida registrada." />}
        {data.security_measures_detail.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Medida {i + 1}</span>
              <button type="button" onClick={() => removeMedida(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1"><Label className="text-xs">Tipo</Label>
                <Select value={item.tipo} onValueChange={v => updateMedida(i, 'tipo', v)}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{TIPOS_SEGURANCA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select></div>
              <div className="space-y-1"><Label className="text-xs">Descrição do controle</Label>
                <Input className="h-8 text-sm" value={item.descricao_controle} onChange={e => updateMedida(i, 'descricao_controle', e.target.value)} placeholder="Descreva o controle..." /></div>
              <div className="space-y-1"><Label className="text-xs">Finalidade</Label>
                <Input className="h-8 text-sm" value={item.finalidade} onChange={e => updateMedida(i, 'finalidade', e.target.value)} placeholder="Proteger contra..." /></div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addMedida} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> Adicionar medida de segurança
        </Button>
      </div>
    </div>
  )
}

// ─── Etapa 8 — Transferência Internacional ───────────────────────────────────

function StepTransferencia({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const items = data.transferencia_internacional
  const add = () => update('transferencia_internacional', [...items, { pais: '', dados_transferidos: '', tipo_garantia: '', finalidade: '' }])
  const remove = (i: number) => update('transferencia_internacional', items.filter((_, idx) => idx !== i))
  const set = (i: number, field: keyof TransferenciaItem, value: string) =>
    update('transferencia_internacional', items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Registre transferências internacionais de dados. Exigem garantias adequadas conforme art. 33 da LGPD.</p>
      {items.length === 0 && <EmptyState label="Nenhuma transferência internacional registrada." />}
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Transferência {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">País destino</Label>
              <Input className="h-8 text-sm" value={item.pais} onChange={e => set(i, 'pais', e.target.value)} placeholder="Ex: Estados Unidos, Portugal..." /></div>
            <div className="space-y-1"><Label className="text-xs">Tipo de garantia</Label>
              <Select value={item.tipo_garantia} onValueChange={v => set(i, 'tipo_garantia', v)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{TIPOS_GARANTIA.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select></div>
            <div className="space-y-1"><Label className="text-xs">Dados transferidos</Label>
              <Input className="h-8 text-sm" value={item.dados_transferidos} onChange={e => set(i, 'dados_transferidos', e.target.value)} placeholder="Descreva os dados..." /></div>
            <div className="space-y-1"><Label className="text-xs">Finalidade</Label>
              <Input className="h-8 text-sm" value={item.finalidade} onChange={e => set(i, 'finalidade', e.target.value)} placeholder="Finalidade da transferência..." /></div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full"><Plus className="h-4 w-4 mr-2" /> Adicionar transferência internacional</Button>
    </div>
  )
}

// ─── Etapa 9 — Contratos ─────────────────────────────────────────────────────

function StepContratos({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const items = data.contratos
  const add = () => update('contratos', [...items, { numero_processo: '', objeto: '', email_gestor: '', finalidade: '' }])
  const remove = (i: number) => update('contratos', items.filter((_, idx) => idx !== i))
  const set = (i: number, field: keyof ContratoItem, value: string) =>
    update('contratos', items.map((item, idx) => idx === i ? { ...item, [field]: value } : item))

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Registre contratos e DPAs relacionados ao tratamento de dados.</p>
      {items.length === 0 && <EmptyState label="Nenhum contrato registrado." />}
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Contrato {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Nº do processo</Label>
              <Input className="h-8 text-sm" value={item.numero_processo} onChange={e => set(i, 'numero_processo', e.target.value)} placeholder="Ex: 2024/001..." /></div>
            <div className="space-y-1"><Label className="text-xs">E-mail do gestor</Label>
              <Input className="h-8 text-sm" type="email" value={item.email_gestor} onChange={e => set(i, 'email_gestor', e.target.value)} placeholder="gestor@empresa.com.br" /></div>
            <div className="space-y-1"><Label className="text-xs">Objeto do contrato</Label>
              <Input className="h-8 text-sm" value={item.objeto} onChange={e => set(i, 'objeto', e.target.value)} placeholder="Ex: Prestação de serviços de TI..." /></div>
            <div className="space-y-1"><Label className="text-xs">Finalidade</Label>
              <Input className="h-8 text-sm" value={item.finalidade} onChange={e => set(i, 'finalidade', e.target.value)} placeholder="Finalidade do contrato..." /></div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full"><Plus className="h-4 w-4 mr-2" /> Adicionar contrato</Button>
    </div>
  )
}

// ─── Etapa 10 — Impacto ──────────────────────────────────────────────────────

function StepImpacto({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const ripd_sugerido = sugerirRIPD(data)
  const risco = calcularRisco(data)
  const riscoInfo = riscoConfig[risco]
  const ripdFinal = data.requires_dpia === 'automatic' ? (ripd_sugerido ? 'sim' : 'nao') : data.requires_dpia

  return (
    <div className="space-y-5">
      <div className={`rounded-lg border p-4 ${riscoInfo.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${riscoInfo.color}`} />
            <span className="font-semibold text-gray-800">Nível de risco calculado</span>
          </div>
          <Badge variant={riscoInfo.badge}>{riscoInfo.label}</Badge>
        </div>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          {data.data_categories.includes('dados_sensiveis') && <p>• Dados sensíveis identificados → risco elevado</p>}
          {data.legal_bases.length === 0 && <p>• Sem base legal definida → alerta crítico</p>}
          {data.data_shared && <p>• Compartilhamento com terceiros → risco aumentado</p>}
          {!data.retention_period && <p>• Sem prazo de retenção definido</p>}
          {risco === 'baixo' && <p>• Nenhum fator de risco crítico identificado</p>}
        </div>
      </div>
      <div className="space-y-3">
        <Label>Necessita de RIPD (Relatório de Impacto)?</Label>
        {ripd_sugerido && data.requires_dpia === 'automatic' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>O sistema sugere <strong>SIM</strong> com base nos dados identificados.</span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {[{ value: 'automatic', label: `Automático (${ripd_sugerido ? 'Sim' : 'Não'})` }, { value: 'sim', label: 'Sim' }, { value: 'nao', label: 'Não' }].map(opt => (
            <button key={opt.value} type="button" onClick={() => update('requires_dpia', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${data.requires_dpia === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">RIPD final: <strong>{ripdFinal === 'sim' ? 'Necessário' : 'Não necessário'}</strong></p>
      </div>
    </div>
  )
}

// ─── Etapa 11 — Revisão ──────────────────────────────────────────────────────

function StepRevisao({ data, risco }: { data: FormData; risco: ReturnType<typeof calcularRisco> }) {
  const riscoInfo = riscoConfig[risco]
  const fasesAtivas = Object.entries(data.lifecycle_phases as Record<string, Fase>)
    .filter(([, f]) => f.ativo).map(([id]) => FASES.find(f => f.id === id)?.label).filter(Boolean)
  const categoriaLabels = data.data_categories.map(id => CATEGORIAS.find(c => c.id === id)?.label).filter(Boolean)

  const Row = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
        <span className="text-xs text-gray-500 w-44 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-800">{value}</span>
      </div>
    ) : null

  return (
    <div className="space-y-5">
      <div className={`flex items-center justify-between p-4 rounded-lg border ${riscoInfo.bg}`}>
        <div className="flex items-center gap-2">
          <Shield className={`h-5 w-5 ${riscoInfo.color}`} />
          <span className="font-semibold text-gray-800">Nível de risco</span>
        </div>
        <Badge variant={riscoInfo.badge}>{riscoInfo.label}</Badge>
      </div>

      {(data.identificacao.controlador.nome || data.identificacao.dpo) && (
        <div className="space-y-1">
          <SectionTitle>Identificação</SectionTitle>
          <Row label="Controlador" value={data.identificacao.controlador.nome} />
          <Row label="DPO" value={data.identificacao.dpo} />
          <Row label="Representante legal" value={data.identificacao.representante_legal} />
        </div>
      )}

      <div className="space-y-1">
        <SectionTitle>Processo</SectionTitle>
        <Row label="Nome do processo" value={data.process_name} />
        <Row label="Setores envolvidos" value={data.responsible_departments.join(', ')} />
        <Row label="Descrição" value={data.process_description} />
      </div>

      <div className="space-y-1">
        <SectionTitle>Dados e Tratamento</SectionTitle>
        <Row label="Categorias" value={categoriaLabels.join(', ')} />
        <Row label="Fases ativas" value={fasesAtivas.join(', ')} />
        <Row label="Frequência" value={data.processing_frequency} />
        <Row label="Compartilhamento" value={
          data.data_shared
            ? data.shared_details.length > 0
              ? data.shared_details.map(s => `${s.com_quem} (${s.finalidade})`).join('; ')
              : data.shared_with || 'Sim'
            : 'Não'
        } />
      </div>

      <div className="space-y-1">
        <SectionTitle>Base Legal e Finalidade</SectionTitle>
        <Row label="Finalidade" value={data.purpose} />
        <Row label="Bases legais" value={data.legal_bases.join(', ')} />
        <Row label="Coleta consentimento" value={data.consent_collection_method} />
      </div>

      <div className="space-y-1">
        <SectionTitle>Armazenamento e Retenção</SectionTitle>
        <Row label="Tipos de armazenamento" value={data.storage_types.join(', ')} />
        <Row label="Local" value={data.storage_location} />
        <Row label="Prazo de retenção" value={data.retention_period} />
        <Row label="Evento inicial" value={data.evento_inicial} />
        <Row label="Destinação final" value={data.destinacao_final} />
      </div>

      {data.security_measures_detail.length > 0 && (
        <div className="space-y-1">
          <SectionTitle>Medidas de Segurança</SectionTitle>
          {data.security_measures_detail.map((m, i) => <Row key={i} label={m.tipo || `Medida ${i + 1}`} value={m.descricao_controle} />)}
        </div>
      )}

      {data.transferencia_internacional.length > 0 && (
        <div className="space-y-1">
          <SectionTitle>Transferência Internacional</SectionTitle>
          {data.transferencia_internacional.map((t, i) => <Row key={i} label={t.pais || `País ${i + 1}`} value={`${t.dados_transferidos} — ${t.tipo_garantia}`} />)}
        </div>
      )}

      {data.contratos.length > 0 && (
        <div className="space-y-1">
          <SectionTitle>Contratos</SectionTitle>
          {data.contratos.map((c, i) => <Row key={i} label={c.numero_processo || `Contrato ${i + 1}`} value={c.objeto} />)}
        </div>
      )}

      <div className="space-y-1">
        <SectionTitle>Impacto</SectionTitle>
        <Row label="RIPD" value={data.requires_dpia === 'automatic' ? `Automático (${sugerirRIPD(data) ? 'Sim' : 'Não'})` : data.requires_dpia} />
      </div>
    </div>
  )
}

// ─── Wizard principal ────────────────────────────────────────────────────────

interface WizardProps {
  companyId: string
  initialData?: Partial<FormData>
  id?: string
}

export function InventarioWizard({ companyId, initialData, id }: WizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>({ ...defaultData(), ...initialData })
  const [saving, setSaving] = useState(false)

  const update = (field: keyof FormData, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const risco = calcularRisco(data)

  const handleSave = async (status: 'draft' | 'complete') => {
    setSaving(true)
    try {
      await salvarInventarioProfissional({ ...data, company_id: companyId, id, risk_level: risco, record_status: status })
    } catch {
      setSaving(false)
    }
  }

  const stepContent = [
    <StepIdentificacao key={0}  data={data} update={update} />,
    <StepProcesso      key={1}  data={data} update={update} />,
    <StepCicloVida     key={2}  data={data} update={update} />,
    <StepDados         key={3}  data={data} update={update} />,
    <StepTratamento    key={4}  data={data} update={update} />,
    <StepBaseLegal     key={5}  data={data} update={update} />,
    <StepTitular       key={6}  data={data} update={update} />,
    <StepArmazenamento key={7}  data={data} update={update} />,
    <StepTransferencia key={8}  data={data} update={update} />,
    <StepContratos     key={9}  data={data} update={update} />,
    <StepImpacto       key={10} data={data} update={update} />,
    <StepRevisao       key={11} data={data} risco={risco}   />,
  ]

  const progress = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/inventario')}
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{id ? 'Editar Inventário' : 'Novo Inventário'}</h1>
          <p className="text-sm text-gray-500">Etapa {step + 1} de {STEPS.length} — {STEPS[step].label}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={riscoConfig[risco].badge}>Risco {riscoConfig[risco].label}</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="hidden sm:flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <button key={i} onClick={() => setStep(i)}
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${i === step ? 'text-blue-600 font-semibold' : i < step ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${i === step ? 'border-blue-500 bg-blue-50' : i < step ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                  {i < step ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <span className="hidden lg:block">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5 text-blue-600" /> })()}
            {STEPS[step].label}
          </CardTitle>
        </CardHeader>
        <CardContent>{stepContent[step]}</CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => handleSave('draft')} disabled={saving || !data.process_name} className="text-gray-500">
            Salvar rascunho
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}>Próximo <ChevronRight className="h-4 w-4 ml-1" /></Button>
          ) : (
            <Button onClick={() => handleSave('complete')} disabled={saving || !data.process_name || !data.legal_bases.length || !data.purpose}>
              {saving ? 'Salvando...' : 'Salvar Inventário'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
