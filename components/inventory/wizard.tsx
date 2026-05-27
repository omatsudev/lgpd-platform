'use client'

import {
  saveInventory,
  type Contract,
  type DataCategoryDetail,
  type InternationalTransfer,
  type InventoryData,
  type SecurityMeasure,
  type SharingRecipient,
} from '@/app/actions/inventory'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Activity,
  AlertTriangle,
  Archive,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  ClipboardList,
  Contact,
  Database,
  FileText,
  Globe,
  Info,
  Plus,
  RefreshCw,
  Scale,
  Share2,
  Shield,
  Trash2,
  Users,
} from 'lucide-react'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

// ─── Constantes ─────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Identificação', icon: Contact },
  { label: 'Processo', icon: Building2 },
  { label: 'Ciclo de Vida', icon: RefreshCw },
  { label: 'Dados', icon: Database },
  { label: 'Tratamento', icon: Share2 },
  { label: 'Base Legal', icon: Scale },
  { label: 'Titular', icon: Users },
  { label: 'Armazenamento', icon: Archive },
  { label: 'Transferência', icon: Globe },
  { label: 'Contratos', icon: FileText },
  { label: 'Impacto', icon: Activity },
  { label: 'Revisão', icon: ClipboardList },
]

// 6 fases conforme relatorio_lgpd.pdf §5 Etapa 2
const LIFECYCLE_PHASES = [
  { id: 'collection', label: 'Coleta' },
  { id: 'use', label: 'Uso' },
  { id: 'storage', label: 'Armazenamento' },
  { id: 'sharing', label: 'Compartilhamento' },
  { id: 'retention', label: 'Retenção' },
  { id: 'disposal', label: 'Descarte' },
]

const DATA_CATEGORIES = [
  {
    id: 'personal_identification',
    label: 'Identificação pessoal',
    desc: 'Nome, endereço, data de nascimento, telefone',
  },
  {
    id: 'government_data',
    label: 'Dados governamentais',
    desc: 'CPF, RG, CNH, título de eleitor, passaporte',
  },
  {
    id: 'electronic_identification',
    label: 'Identificação eletrônica',
    desc: 'IP, login, cookies, histórico de navegação, dispositivos',
  },
  {
    id: 'financial_data',
    label: 'Dados financeiros',
    desc: 'Conta bancária, cartão, renda, patrimônio, dívidas',
  },
  {
    id: 'consent_data',
    label: 'Consentimentos',
    desc: 'Coletados mediante autorização expressa do titular',
  },
  {
    id: 'personal_characteristics',
    label: 'Características pessoais',
    desc: 'Cor, altura, peso, aparência física',
  },
  {
    id: 'psychological_characteristics',
    label: 'Características psicológicas',
    desc: 'Personalidade, comportamento, preferências, opiniões',
  },
  {
    id: 'family_composition',
    label: 'Composição familiar',
    desc: 'Estado civil, filhos, cônjuge, dependentes',
  },
  {
    id: 'education',
    label: 'Educação',
    desc: 'Escolaridade, cursos, diplomas, certificados, histórico escolar',
  },
  { id: 'occupation', label: 'Profissão', desc: 'Cargo, salário, CTPS, histórico profissional' },
  {
    id: 'image_video_voice',
    label: 'Vídeo / Imagem / Voz',
    desc: 'Fotos, gravações de áudio/vídeo, reconhecimento facial',
  },
  {
    id: 'sensitive_data',
    label: 'Dados sensíveis (saúde)',
    desc: 'Origem racial, religião, saúde, biometria, orientação sexual, opinião política',
  },
  { id: 'other', label: 'Outros', desc: 'Outras categorias de dados não listadas acima' },
]

const LEGAL_BASES = [
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
const SECTORS = [
  'RH',
  'TI',
  'Financeiro',
  'Comercial',
  'Jurídico',
  'Marketing',
  'Operações',
  'Segurança',
  'Atendimento',
  'Diretoria',
]

// Tipos de armazenamento — relatorio_lgpd.pdf §5 Etapa 6 (múltiplos)
const STORAGE_TYPES = [
  { value: 'cloud', label: 'Nuvem (cloud)' },
  { value: 'local_server', label: 'Servidor local' },
  { value: 'paper', label: 'Físico / Papel' },
  { value: 'erp', label: 'ERP / Sistema' },
  { value: 'third_party', label: 'Terceiros' },
  { value: 'hybrid', label: 'Híbrido' },
]

const START_EVENTS = [
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

const END_DISPOSITIONS = [
  'Descarte seguro',
  'Anonimização',
  'Devolução ao titular',
  'Retenção estendida (com justificativa)',
]

const SECURITY_TYPES = [
  'Criptografia',
  'Controle de acesso',
  'Backup automático',
  'Antivírus / Antimalware',
  'Firewall',
  'Anonimização',
  'Pseudonimização',
  'Treinamento de funcionários',
  'Política interna de segurança',
  'Auditoria e monitoramento',
  'Outro',
]

const SAFEGUARD_TYPES = [
  'Cláusula contratual padrão (SCCs)',
  'Consentimento específico do titular',
  'Obrigação legal ou tratado internacional',
  'Decisão de adequação da ANPD',
  'Normas corporativas vinculantes (BCRs)',
  'Outro',
]

// ─── Tipos locais ────────────────────────────────────────────────────────────

type Phase = { active: boolean; controller: boolean; processor: boolean }
type FormData = Omit<InventoryData, 'companyId' | 'id'>
type StepErrors = Record<string, string>

const DEFAULT_PHASE: Phase = { active: false, controller: false, processor: false }

function createDefaultFormData(): FormData {
  return {
    identification: {
      controller: { name: '', address: '', email: '', phone: '' },
      dpo: '',
      legalRepresentative: '',
    },
    processName: '',
    responsibleDepartment: '',
    responsibleDepartments: [],
    processDescription: '',
    lifecyclePhases: {
      collection: { ...DEFAULT_PHASE },
      use: { ...DEFAULT_PHASE },
      storage: { ...DEFAULT_PHASE },
      sharing: { ...DEFAULT_PHASE },
      retention: { ...DEFAULT_PHASE },
      disposal: { ...DEFAULT_PHASE },
    },
    dataCategories: [],
    dataCategoriesDetail: [],
    dataDescription: '',
    processingFrequency: '',
    dataShared: false,
    sharedWith: '',
    sharedDetails: [],
    purpose: '',
    legalBasis: '',
    legalBases: [],
    consentCollectionMethod: '',
    dataSource: '',
    dataSources: [],
    dataSubjectCategory: '',
    dataSubjectCategories: [],
    storageType: '',
    storageTypes: [],
    storageLocation: '',
    retentionPeriod: '',
    retentionStartEvent: '',
    finalDisposition: '',
    disposalHoldPossible: false,
    responsible: '',
    securityMeasures: '',
    securityMeasuresDetail: [],
    internationalTransfers: [],
    contracts: [],
    requiresDpia: 'automatic',
    riskLevel: 'low',
    recordStatus: 'draft',
  }
}

// ─── Risco ───────────────────────────────────────────────────────────────────

function calculateRisk(data: FormData): 'low' | 'medium' | 'high' {
  const hasSensitiveData = data.dataCategories.includes('sensitive_data')
  const hasNoLegalBasis = data.legalBases.length === 0
  if (hasSensitiveData || hasNoLegalBasis) return 'high'
  if (data.dataShared || !data.retentionPeriod) return 'medium'
  return 'low'
}

function suggestDpia(data: FormData): boolean {
  return data.dataCategories.includes('sensitive_data') || data.dataShared
}

const riskConfig = {
  low: {
    label: 'Baixo',
    color: 'text-green-600',
    bg: 'bg-green-50 border-green-200',
    badge: 'success' as const,
  },
  medium: {
    label: 'Médio',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50 border-yellow-200',
    badge: 'warning' as const,
  },
  high: {
    label: 'Alto',
    color: 'text-red-600',
    bg: 'bg-red-50 border-red-200',
    badge: 'destructive' as const,
  },
}

// ─── Componentes auxiliares ──────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{children}</h3>
  )
}

function CheckBox({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="text-center py-6 text-sm text-gray-400 border border-dashed rounded-lg">
      {label}
    </div>
  )
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      {msg}
    </p>
  )
}

function errBorder(hasError: boolean) {
  return hasError ? 'border-red-400 focus:border-red-400' : ''
}

function Pill({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

// ─── Etapa 0 — Identificação ─────────────────────────────────────────────────

function StepIdentification({
  data,
  update,
  errors = {},
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
  errors?: StepErrors
}) {
  const id = data.identification
  const setController = (field: keyof typeof id.controller, value: string) =>
    update('identification', { ...id, controller: { ...id.controller, [field]: value } })

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <SectionTitle>Controlador</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Nome *</Label>
            <Input
              className={errBorder(!!errors.controller_name)}
              value={id.controller.name}
              onChange={(e) => setController('name', e.target.value)}
              placeholder="Razão social ou nome do controlador"
            />
            <FieldError msg={errors.controller_name} />
          </div>
          <div className="space-y-1.5">
            <Label>E-mail</Label>
            <Input
              type="email"
              value={id.controller.email}
              onChange={(e) => setController('email', e.target.value)}
              placeholder="contato@empresa.com.br"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Telefone</Label>
            <Input
              value={id.controller.phone}
              onChange={(e) => setController('phone', e.target.value)}
              placeholder="(11) 99999-9999"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Endereço</Label>
            <Input
              value={id.controller.address}
              onChange={(e) => setController('address', e.target.value)}
              placeholder="Rua, número, cidade, estado"
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <SectionTitle>DPO (Encarregado de Dados)</SectionTitle>
        <Input
          value={id.dpo}
          onChange={(e) => update('identification', { ...id, dpo: e.target.value })}
          placeholder="Ex: João Silva — dpo@empresa.com.br"
        />
      </div>
      <div className="space-y-3">
        <SectionTitle>Representante Legal</SectionTitle>
        <Input
          value={id.legalRepresentative}
          onChange={(e) => update('identification', { ...id, legalRepresentative: e.target.value })}
          placeholder="Ex: Maria Souza — Diretora Jurídica"
        />
      </div>
    </div>
  )
}

// ─── Etapa 1 — Processo ──────────────────────────────────────────────────────

function StepProcess({
  data,
  update,
  errors = {},
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
  errors?: StepErrors
}) {
  const [customDepartment, setCustomDepartment] = useState('')

  const toggleDepartment = (s: string) => {
    const cur = data.responsibleDepartments
    update('responsibleDepartments', cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s])
  }

  const addCustomDepartment = () => {
    if (!customDepartment.trim()) return
    if (!data.responsibleDepartments.includes(customDepartment.trim())) {
      update('responsibleDepartments', [...data.responsibleDepartments, customDepartment.trim()])
    }
    setCustomDepartment('')
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do Processo *</Label>
        <Input
          className={errBorder(!!errors.process_name)}
          value={data.processName}
          onChange={(e) => update('processName', e.target.value)}
          placeholder="Ex: Gestão de Recursos Humanos, Atendimento ao Cliente..."
        />
        <FieldError msg={errors.process_name} />
      </div>
      <div className="space-y-2">
        <Label>Setores envolvidos no tratamento</Label>
        <p className="text-xs text-gray-500">
          Selecione todos os setores que participam deste processo.
        </p>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <Pill
              key={s}
              label={s}
              selected={data.responsibleDepartments.includes(s)}
              onClick={() => toggleDepartment(s)}
            />
          ))}
        </div>
        {/* Setor customizado */}
        <div className="flex gap-2 mt-2">
          <Input
            className="h-8 text-sm"
            value={customDepartment}
            onChange={(e) => setCustomDepartment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDepartment())}
            placeholder="Outro setor..."
          />
          <Button type="button" variant="outline" size="sm" onClick={addCustomDepartment}>
            Adicionar
          </Button>
        </div>
        {/* Setores customizados selecionados */}
        {data.responsibleDepartments
          .filter((s) => !SECTORS.includes(s))
          .map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1 rounded-full border border-blue-400 bg-blue-50 px-3 py-1 text-xs text-blue-700 mr-1"
            >
              {s}
              <button
                type="button"
                onClick={() => toggleDepartment(s)}
                className="hover:text-red-500"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </span>
          ))}
      </div>
      <div className="space-y-2">
        <Label>Descrição do Processo</Label>
        <Textarea
          value={data.processDescription}
          onChange={(e) => update('processDescription', e.target.value)}
          placeholder="Descreva brevemente o processo e como ele envolve dados pessoais..."
          rows={4}
        />
      </div>
    </div>
  )
}

// ─── Etapa 2 — Ciclo de Vida ─────────────────────────────────────────────────

function StepLifecycle({
  data,
  update,
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
}) {
  const fases = data.lifecyclePhases as Record<string, Phase>

  const togglePhase = (faseId: string, field: keyof Phase, value: boolean) => {
    const updated = { ...fases, [faseId]: { ...fases[faseId], [field]: value } }
    if (field === 'active' && !value)
      updated[faseId] = { active: false, controller: false, processor: false }
    update('lifecyclePhases', updated)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Marque as fases do ciclo de vida e quem atua em cada uma (controlador e/ou operador).
      </p>
      <div className="space-y-3">
        {LIFECYCLE_PHASES.map((fase) => {
          const f = fases[fase.id] ?? DEFAULT_PHASE
          return (
            <div
              key={fase.id}
              className={`rounded-lg border p-4 transition-colors ${f.active ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}
            >
              <CheckBox
                checked={f.active}
                onChange={(v) => togglePhase(fase.id, 'active', v)}
                label={fase.label}
              />
              {f.active && (
                <div className="mt-3 ml-6 flex gap-6">
                  <CheckBox
                    checked={f.controller}
                    onChange={(v) => togglePhase(fase.id, 'controller', v)}
                    label="Controlador atua"
                  />
                  <CheckBox
                    checked={f.processor}
                    onChange={(v) => togglePhase(fase.id, 'processor', v)}
                    label="Operador atua"
                  />
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

function StepData({
  data,
  update,
  errors = {},
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
  errors?: StepErrors
}) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [tooltip, setTooltip] = useState<string | null>(null)

  const toggleCategory = (id: string) => {
    const current = data.dataCategories
    if (current.includes(id)) {
      update(
        'dataCategories',
        current.filter((c) => c !== id),
      )
      update(
        'dataCategoriesDetail',
        data.dataCategoriesDetail.filter((d) => d.categoryId !== id),
      )
      if (expandedCategory === id) setExpandedCategory(null)
    } else {
      update('dataCategories', [...current, id])
    }
  }

  const getCategoryDetail = (catId: string): DataCategoryDetail =>
    data.dataCategoriesDetail.find((d) => d.categoryId === catId) ?? {
      categoryId: catId,
      description: '',
      retentionPeriod: '',
      source: '',
      legalBasis: '',
      purpose: '',
      storageLocation: '',
      dataSubjectCategory: '',
      dpiaRequired: '',
      responsibleDepartment: '',
    }

  const updateCategoryDetail = (catId: string, field: keyof DataCategoryDetail, value: string) => {
    const existing = data.dataCategoriesDetail
    const idx = existing.findIndex((d) => d.categoryId === catId)
    if (idx >= 0) {
      const updated = [...existing]
      updated[idx] = { ...updated[idx], [field]: value }
      update('dataCategoriesDetail', updated)
    } else {
      update('dataCategoriesDetail', [...existing, { ...getCategoryDetail(catId), [field]: value }])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Selecione as categorias de dados pessoais tratados neste processo.
      </p>
      <FieldError msg={errors.data_categories} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {DATA_CATEGORIES.map((cat) => {
          const selected = data.dataCategories.includes(cat.id)
          const isSensivel = cat.id === 'sensitive_data'
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              onMouseEnter={() => setTooltip(cat.id)}
              onMouseLeave={() => setTooltip(null)}
              className={`relative text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${
                selected
                  ? isSensivel
                    ? 'border-red-400 bg-red-50 text-red-800'
                    : 'border-blue-400 bg-blue-50 text-blue-800'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{cat.label}</span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isSensivel && <AlertTriangle className="h-3.5 w-3.5 text-red-500" />}
                  {selected ? (
                    <CheckCircle2 className="h-4 w-4 text-current" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                </div>
              </div>
              {tooltip === cat.id && (
                <div className="absolute left-0 top-full mt-1 z-10 w-64 rounded-lg border border-gray-200 bg-white p-2.5 shadow-lg text-xs text-gray-600">
                  {cat.desc}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {data.dataCategories.includes('sensitive_data') && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Dados sensíveis:</strong> exigem maior cuidado jurídico. O nível de risk será
            classificado como <strong>Alto</strong> automaticamente.
          </span>
        </div>
      )}

      {data.dataCategories.length > 0 && (
        <div className="space-y-2">
          <SectionTitle>Detalhe por Categoria</SectionTitle>
          <p className="text-xs text-gray-500 -mt-2 mb-2">
            Expanda cada categoria para preencher campos específicos (base legal, retenção, fonte,
            etc.).
          </p>
          {data.dataCategories.map((catId) => {
            const cat = DATA_CATEGORIES.find((c) => c.id === catId)!
            const isExpanded = expandedCategory === catId
            const detail = getCategoryDetail(catId)
            return (
              <div key={catId} className="rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded ? null : catId)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">{cat.label}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="border-t border-gray-100 p-3 bg-gray-50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Descrição específica</Label>
                        <Input
                          className="h-8 text-sm"
                          value={detail.description}
                          onChange={(e) =>
                            updateCategoryDetail(catId, 'description', e.target.value)
                          }
                          placeholder="Dados específicos desta categoria..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tempo de retenção</Label>
                        <Input
                          className="h-8 text-sm"
                          value={detail.retentionPeriod}
                          onChange={(e) =>
                            updateCategoryDetail(catId, 'retentionPeriod', e.target.value)
                          }
                          placeholder="Ex: 5 anos, 20 anos..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Fonte</Label>
                        <Select
                          value={detail.source}
                          onValueChange={(v) => updateCategoryDetail(catId, 'source', v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="direto">Direto do titular</SelectItem>
                            <SelectItem value="terceiros">Terceiros</SelectItem>
                            <SelectItem value="publico">Fonte pública</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Base legal (art. 7º LGPD)</Label>
                        <Select
                          value={detail.legalBasis}
                          onValueChange={(v) => updateCategoryDetail(catId, 'legalBasis', v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            {LEGAL_BASES.map((bl) => (
                              <SelectItem key={bl} value={bl}>
                                {bl}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Finalidade</Label>
                        <Input
                          className="h-8 text-sm"
                          value={detail.purpose}
                          onChange={(e) => updateCategoryDetail(catId, 'purpose', e.target.value)}
                          placeholder="Finalidade específica para esta categoria..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Local de armazenamento</Label>
                        <Input
                          className="h-8 text-sm"
                          value={detail.storageLocation}
                          onChange={(e) =>
                            updateCategoryDetail(catId, 'storageLocation', e.target.value)
                          }
                          placeholder="Ex: Banco de dados X..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Setor responsável</Label>
                        <Input
                          className="h-8 text-sm"
                          value={detail.responsibleDepartment}
                          onChange={(e) =>
                            updateCategoryDetail(catId, 'responsibleDepartment', e.target.value)
                          }
                          placeholder="Ex: TI, RH..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Categoria do titular</Label>
                        <Input
                          className="h-8 text-sm"
                          value={detail.dataSubjectCategory}
                          onChange={(e) =>
                            updateCategoryDetail(catId, 'dataSubjectCategory', e.target.value)
                          }
                          placeholder="Ex: Funcionário, Cliente..."
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Necessidade de DPIA</Label>
                        <Select
                          value={detail.dpiaRequired}
                          onValueChange={(v) => updateCategoryDetail(catId, 'dpiaRequired', v)}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                            <SelectItem value="a_avaliar">A avaliar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
        <Textarea
          value={data.dataDescription}
          onChange={(e) => update('dataDescription', e.target.value)}
          placeholder="Detalhe os dados específicos tratados, se necessário..."
          rows={3}
        />
      </div>
    </div>
  )
}

// ─── Etapa 4 — Tratamento ────────────────────────────────────────────────────

function StepProcessing({
  data,
  update,
  errors = {},
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
  errors?: StepErrors
}) {
  const addSharingRecipient = () =>
    update('sharedDetails', [...data.sharedDetails, { recipient: '', purpose: '' }])
  const removeSharingRecipient = (i: number) =>
    update(
      'sharedDetails',
      data.sharedDetails.filter((_, idx) => idx !== i),
    )
  const updateSharingRecipient = (i: number, field: keyof SharingRecipient, value: string) =>
    update(
      'sharedDetails',
      data.sharedDetails.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    )

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Frequência do Tratamento *</Label>
        <div
          className={`grid grid-cols-3 gap-3 ${errors.processing_frequency ? 'ring-1 ring-red-400 rounded-lg p-1' : ''}`}
        >
          {['Contínuo', 'Eventual', 'Único'].map((freq) => (
            <button
              key={freq}
              type="button"
              onClick={() => update('processingFrequency', freq.toLowerCase())}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${data.processingFrequency === freq.toLowerCase() ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
            >
              {freq}
            </button>
          ))}
        </div>
        <FieldError msg={errors.processing_frequency} />
      </div>
      <div className="space-y-3">
        <Label>Os dados são compartilhados com terceiros?</Label>
        <div className="flex gap-3">
          {[
            { value: true, label: 'Sim' },
            { value: false, label: 'Não' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => update('dataShared', opt.value)}
              className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${data.dataShared === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {data.dataShared && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>
                O compartilhamento aumenta o nível de risk e pode exigir DPA com o terceiro.
              </span>
            </div>
            <SectionTitle>Destinatários do compartilhamento</SectionTitle>
            {data.sharedDetails.length === 0 && (
              <EmptyState label="Nenhum destinatário registrado." />
            )}
            {data.sharedDetails.map((item, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Destinatário {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSharingRecipient(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Com quem</Label>
                    <Input
                      className="h-8 text-sm"
                      value={item.recipient}
                      onChange={(e) => updateSharingRecipient(i, 'recipient', e.target.value)}
                      placeholder="Ex: e-Social, Redesim, Operadora..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Finalidade</Label>
                    <Input
                      className="h-8 text-sm"
                      value={item.purpose}
                      onChange={(e) => updateSharingRecipient(i, 'purpose', e.target.value)}
                      placeholder="Ex: Declaração fiscal..."
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSharingRecipient}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar destinatário
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Etapa 5 — Base Legal ────────────────────────────────────────────────────

function StepLegalBasis({
  data,
  update,
  errors = {},
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
  errors?: StepErrors
}) {
  const toggleLegalBasis = (bl: string) => {
    const cur = data.legalBases
    update('legalBases', cur.includes(bl) ? cur.filter((x) => x !== bl) : [...cur, bl])
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Finalidade do Tratamento *</Label>
        <Textarea
          className={errBorder(!!errors.purpose)}
          value={data.purpose}
          onChange={(e) => update('purpose', e.target.value)}
          placeholder="Descreva para qual finalidade os dados são tratados..."
          rows={3}
        />
        <FieldError msg={errors.purpose} />
      </div>
      <div className="space-y-2">
        <Label>Base(s) Legal(is) *</Label>
        <p className="text-xs text-gray-500">
          Selecione todas as bases legais aplicáveis (art. 7º LGPD). É possível selecionar mais de
          uma.
        </p>
        <FieldError msg={errors.legal_bases} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LEGAL_BASES.map((bl) => {
            const selected = data.legalBases.includes(bl)
            return (
              <button
                key={bl}
                type="button"
                onClick={() => toggleLegalBasis(bl)}
                className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${selected ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{bl}</span>
                  {selected ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-blue-600" />
                  ) : (
                    <Circle className="h-4 w-4 flex-shrink-0 text-gray-300" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {data.legalBases.length === 0 && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> A ausência de base legal é uma não-conformidade
            crítica.
          </p>
        )}
      </div>
      {data.legalBases.includes('Consentimento do titular') && (
        <div className="space-y-2">
          <Label>Forma de coleta do consentimento *</Label>
          <Input
            className={errBorder(!!errors.consent_collection_method)}
            value={data.consentCollectionMethod}
            onChange={(e) => update('consentCollectionMethod', e.target.value)}
            placeholder="Ex: Checkbox no site, termo assinado, WhatsApp..."
          />
          <FieldError msg={errors.consent_collection_method} />
          <p className="text-xs text-gray-500">
            O consentimento deve ser livre, informado, inequívoco e documentado.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Etapa 6 — Titular ───────────────────────────────────────────────────────

function StepDataSubject({
  data,
  update,
  errors = {},
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
  errors?: StepErrors
}) {
  const toggleDataSource = (v: string) => {
    const cur = data.dataSources
    update('dataSources', cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }
  const toggleCategory = (v: string) => {
    const cur = data.dataSubjectCategories
    update('dataSubjectCategories', cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }

  const FONTES = [
    { value: 'direto', label: 'Direto do titular' },
    { value: 'terceiros', label: 'Terceiros' },
    { value: 'publico', label: 'Fonte pública' },
  ]

  const CATEGORIAS_TITULAR = [
    { value: 'cliente', label: 'Cliente' },
    { value: 'funcionario', label: 'Funcionário' },
    { value: 'fornecedor', label: 'Fornecedor' },
    { value: 'lead', label: 'Lead / Prospect' },
    { value: 'parceiro', label: 'Parceiro' },
    { value: 'outro', label: 'Outro' },
  ]

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>
          Fonte dos dados *{' '}
          <span className="text-xs font-normal text-gray-400">(múltipla seleção)</span>
        </Label>
        <FieldError msg={errors.data_sources} />
        <div className="grid grid-cols-3 gap-3">
          {FONTES.map((opt) => {
            const active = data.dataSources.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleDataSource(opt.value)}
                className={`rounded-lg border p-3 text-sm font-medium transition-colors text-center ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>
          Categoria do titular *{' '}
          <span className="text-xs font-normal text-gray-400">(múltipla seleção)</span>
        </Label>
        <FieldError msg={errors.data_subject_categories} />
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIAS_TITULAR.map((opt) => {
            const active = data.dataSubjectCategories.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleCategory(opt.value)}
                className={`rounded-lg border p-3 text-sm font-medium transition-colors ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Etapa 7 — Armazenamento e Retenção ─────────────────────────────────────

function StepStorage({
  data,
  update,
  errors = {},
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
  errors?: StepErrors
}) {
  const toggleStorageType = (v: string) => {
    const cur = data.storageTypes
    update('storageTypes', cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }

  const addSecurityMeasure = () =>
    update('securityMeasuresDetail', [
      ...data.securityMeasuresDetail,
      { type: '', controlDescription: '', purpose: '' },
    ])
  const removeSecurityMeasure = (i: number) =>
    update(
      'securityMeasuresDetail',
      data.securityMeasuresDetail.filter((_, idx) => idx !== i),
    )
  const updateSecurityMeasure = (i: number, field: keyof SecurityMeasure, value: string) =>
    update(
      'securityMeasuresDetail',
      data.securityMeasuresDetail.map((item, idx) =>
        idx === i ? { ...item, [field]: value } : item,
      ),
    )

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Tipo(s) de armazenamento *</Label>
        <p className="text-xs text-gray-500">Selecione todos os tipos utilizados.</p>
        <FieldError msg={errors.storage_types} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STORAGE_TYPES.map((opt) => {
            const selected = data.storageTypes.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleStorageType(opt.value)}
                className={`rounded-lg border p-3 text-sm font-medium transition-colors ${selected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Onde exatamente? *</Label>
        <Input
          className={errBorder(!!errors.storage_location)}
          value={data.storageLocation}
          onChange={(e) => update('storageLocation', e.target.value)}
          placeholder="Ex: AWS S3, Google Drive, Servidor interno, Pastas físicas..."
        />
        <FieldError msg={errors.storage_location} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prazo de retenção</Label>
          <Input
            value={data.retentionPeriod}
            onChange={(e) => update('retentionPeriod', e.target.value)}
            placeholder="Ex: 5 anos, 20 anos..."
          />
          {!data.retentionPeriod && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Sem prazo definido aumenta o risk.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Responsável pelo tratamento</Label>
          <Input
            value={data.responsible}
            onChange={(e) => update('responsible', e.target.value)}
            placeholder="Nome ou setor..."
          />
        </div>
      </div>

      {/* Campos de retenção/descarte — politica_retencao_dados.pdf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Evento inicial (início do prazo)</Label>
          <Select
            value={data.retentionStartEvent}
            onValueChange={(v) => update('retentionStartEvent', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Quando começa a contar..." />
            </SelectTrigger>
            <SelectContent>
              {START_EVENTS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Destinação final</Label>
          <Select
            value={data.finalDisposition}
            onValueChange={(v) => update('finalDisposition', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Ao final do prazo..." />
            </SelectTrigger>
            <SelectContent>
              {END_DISPOSITIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Possibilidade de bloqueio de descarte?</Label>
        <div className="flex gap-3">
          {[
            { v: true, l: 'Sim — dado pode ser bloqueado' },
            { v: false, l: 'Não' },
          ].map((opt) => (
            <button
              key={String(opt.v)}
              type="button"
              onClick={() => update('disposalHoldPossible', opt.v)}
              className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${data.disposalHoldPossible === opt.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
            >
              {opt.l}
            </button>
          ))}
        </div>
        {data.disposalHoldPossible && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>
              Dados bloqueáveis podem ter o descarte suspenso por: ação trabalhista, investigação,
              auditoria, incidente ou obrigação regulatória.
            </span>
          </div>
        )}
      </div>

      {/* Medidas de segurança estruturadas */}
      <div className="space-y-3">
        <SectionTitle>Medidas de segurança e privacidade</SectionTitle>
        {data.securityMeasuresDetail.length === 0 && (
          <EmptyState label="Nenhuma medida registrada." />
        )}
        {data.securityMeasuresDetail.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase">Medida {i + 1}</span>
              <button
                type="button"
                onClick={() => removeSecurityMeasure(i)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Tipo</Label>
                <Select
                  value={item.type}
                  onValueChange={(v) => updateSecurityMeasure(i, 'type', v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {SECURITY_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Descrição do controle</Label>
                <Input
                  className="h-8 text-sm"
                  value={item.controlDescription}
                  onChange={(e) => updateSecurityMeasure(i, 'controlDescription', e.target.value)}
                  placeholder="Descreva o controle..."
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Finalidade</Label>
                <Input
                  className="h-8 text-sm"
                  value={item.purpose}
                  onChange={(e) => updateSecurityMeasure(i, 'purpose', e.target.value)}
                  placeholder="Proteger contra..."
                />
              </div>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addSecurityMeasure}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar medida de segurança
        </Button>
      </div>
    </div>
  )
}

// ─── Etapa 8 — Transferência Internacional ───────────────────────────────────

function StepInternationalTransfer({
  data,
  update,
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
}) {
  const items = data.internationalTransfers
  const add = () =>
    update('internationalTransfers', [
      ...items,
      { country: '', dataTransferred: '', safeguardType: '', purpose: '' },
    ])
  const remove = (i: number) =>
    update(
      'internationalTransfers',
      items.filter((_, idx) => idx !== i),
    )
  const set = (i: number, field: keyof InternationalTransfer, value: string) =>
    update(
      'internationalTransfers',
      items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    )

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Registre transferências internacionais de dados. Exigem garantias adequadas conforme art. 33
        da LGPD.
      </p>
      {items.length === 0 && <EmptyState label="Nenhuma transferência internacional registrada." />}
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Transferência {i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">País destino</Label>
              <Input
                className="h-8 text-sm"
                value={item.country}
                onChange={(e) => set(i, 'country', e.target.value)}
                placeholder="Ex: Estados Unidos, Portugal..."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo de garantia</Label>
              <Select value={item.safeguardType} onValueChange={(v) => set(i, 'safeguardType', v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {SAFEGUARD_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dados transferidos</Label>
              <Input
                className="h-8 text-sm"
                value={item.dataTransferred}
                onChange={(e) => set(i, 'dataTransferred', e.target.value)}
                placeholder="Descreva os dados..."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Finalidade</Label>
              <Input
                className="h-8 text-sm"
                value={item.purpose}
                onChange={(e) => set(i, 'purpose', e.target.value)}
                placeholder="Finalidade da transferência..."
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Adicionar transferência internacional
      </Button>
    </div>
  )
}

// ─── Etapa 9 — Contratos ─────────────────────────────────────────────────────

function StepContracts({
  data,
  update,
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
}) {
  const items = data.contracts
  const add = () =>
    update('contracts', [
      ...items,
      { processNumber: '', subject: '', managerEmail: '', purpose: '' },
    ])
  const remove = (i: number) =>
    update(
      'contracts',
      items.filter((_, idx) => idx !== i),
    )
  const set = (i: number, field: keyof Contract, value: string) =>
    update(
      'contracts',
      items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    )

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Registre contratos e DPAs relacionados ao tratamento de dados.
      </p>
      {items.length === 0 && <EmptyState label="Nenhum contrato registrado." />}
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Contrato {i + 1}</span>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Nº do processo</Label>
              <Input
                className="h-8 text-sm"
                value={item.processNumber}
                onChange={(e) => set(i, 'processNumber', e.target.value)}
                placeholder="Ex: 2024/001..."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">E-mail do gestor</Label>
              <Input
                className="h-8 text-sm"
                type="email"
                value={item.managerEmail}
                onChange={(e) => set(i, 'managerEmail', e.target.value)}
                placeholder="gestor@empresa.com.br"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Objeto do contrato</Label>
              <Input
                className="h-8 text-sm"
                value={item.subject}
                onChange={(e) => set(i, 'subject', e.target.value)}
                placeholder="Ex: Prestação de serviços de TI..."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Finalidade</Label>
              <Input
                className="h-8 text-sm"
                value={item.purpose}
                onChange={(e) => set(i, 'purpose', e.target.value)}
                placeholder="Finalidade do contrato..."
              />
            </div>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={add} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> Adicionar contrato
      </Button>
    </div>
  )
}

// ─── Etapa 10 — Impacto ──────────────────────────────────────────────────────

function StepImpact({
  data,
  update,
}: {
  data: FormData
  update: (f: keyof FormData, v: any) => void
}) {
  const dpiaRecommended = suggestDpia(data)
  const risk = calculateRisk(data)
  const riskInfo = riskConfig[risk]
  const dpiaFinal =
    data.requiresDpia === 'automatic' ? (dpiaRecommended ? 'sim' : 'nao') : data.requiresDpia

  return (
    <div className="space-y-5">
      <div className={`rounded-lg border p-4 ${riskInfo.bg}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`h-5 w-5 ${riskInfo.color}`} />
            <span className="font-semibold text-gray-800">Nível de risk calculado</span>
          </div>
          <Badge variant={riskInfo.badge}>{riskInfo.label}</Badge>
        </div>
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          {data.dataCategories.includes('sensitive_data') && (
            <p>• Dados sensíveis identificados → risk elevado</p>
          )}
          {data.legalBases.length === 0 && <p>• Sem base legal definida → alerta crítico</p>}
          {data.dataShared && <p>• Compartilhamento com terceiros → risk aumentado</p>}
          {!data.retentionPeriod && <p>• Sem prazo de retenção definido</p>}
          {risk === 'low' && <p>• Nenhum fator de risk crítico identificado</p>}
        </div>
      </div>
      <div className="space-y-3">
        <Label>Necessita de RIPD (Relatório de Impacto)?</Label>
        {dpiaRecommended && data.requiresDpia === 'automatic' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>
              O sistema sugere <strong>SIM</strong> com base nos dados identificados.
            </span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'automatic', label: `Automático (${dpiaRecommended ? 'Sim' : 'Não'})` },
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('requiresDpia', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${data.requiresDpia === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          RIPD final: <strong>{dpiaFinal === 'sim' ? 'Necessário' : 'Não necessário'}</strong>
        </p>
      </div>
    </div>
  )
}

// ─── Etapa 11 — Revisão ──────────────────────────────────────────────────────

function StepReview({ data, risk }: { data: FormData; risk: ReturnType<typeof calculateRisk> }) {
  const riskInfo = riskConfig[risk]
  const activePhases = Object.entries(data.lifecyclePhases as Record<string, Phase>)
    .filter(([, f]) => f.active)
    .map(([id]) => LIFECYCLE_PHASES.find((f) => f.id === id)?.label)
    .filter(Boolean)
  const categoryLabels = data.dataCategories
    .map((id) => DATA_CATEGORIES.find((c) => c.id === id)?.label)
    .filter(Boolean)

  const Row = ({ label, value }: { label: string; value?: string | null }) =>
    value ? (
      <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
        <span className="text-xs text-gray-500 w-44 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-800">{value}</span>
      </div>
    ) : null

  return (
    <div className="space-y-5">
      <div className={`flex items-center justify-between p-4 rounded-lg border ${riskInfo.bg}`}>
        <div className="flex items-center gap-2">
          <Shield className={`h-5 w-5 ${riskInfo.color}`} />
          <span className="font-semibold text-gray-800">Nível de risk</span>
        </div>
        <Badge variant={riskInfo.badge}>{riskInfo.label}</Badge>
      </div>

      {(data.identification.controller.name || data.identification.dpo) && (
        <div className="space-y-1">
          <SectionTitle>Identificação</SectionTitle>
          <Row label="Controlador" value={data.identification.controller.name} />
          <Row label="DPO" value={data.identification.dpo} />
          <Row label="Representante legal" value={data.identification.legalRepresentative} />
        </div>
      )}

      <div className="space-y-1">
        <SectionTitle>Processo</SectionTitle>
        <Row label="Nome do processo" value={data.processName} />
        <Row label="Setores envolvidos" value={data.responsibleDepartments.join(', ')} />
        <Row label="Descrição" value={data.processDescription} />
      </div>

      <div className="space-y-1">
        <SectionTitle>Dados e Tratamento</SectionTitle>
        <Row label="Categorias" value={categoryLabels.join(', ')} />
        <Row label="Fases ativas" value={activePhases.join(', ')} />
        <Row label="Frequência" value={data.processingFrequency} />
        <Row
          label="Compartilhamento"
          value={
            data.dataShared
              ? data.sharedDetails.length > 0
                ? data.sharedDetails.map((s) => `${s.recipient} (${s.purpose})`).join('; ')
                : data.sharedWith || 'Sim'
              : 'Não'
          }
        />
      </div>

      <div className="space-y-1">
        <SectionTitle>Base Legal e Finalidade</SectionTitle>
        <Row label="Finalidade" value={data.purpose} />
        <Row label="Bases legais" value={data.legalBases.join(', ')} />
        <Row label="Coleta consentimento" value={data.consentCollectionMethod} />
      </div>

      <div className="space-y-1">
        <SectionTitle>Armazenamento e Retenção</SectionTitle>
        <Row label="Tipos de armazenamento" value={data.storageTypes.join(', ')} />
        <Row label="Local" value={data.storageLocation} />
        <Row label="Prazo de retenção" value={data.retentionPeriod} />
        <Row label="Evento inicial" value={data.retentionStartEvent} />
        <Row label="Destinação final" value={data.finalDisposition} />
      </div>

      {data.securityMeasuresDetail.length > 0 && (
        <div className="space-y-1">
          <SectionTitle>Medidas de Segurança</SectionTitle>
          {data.securityMeasuresDetail.map((m, i) => (
            <Row key={i} label={m.type || `Medida ${i + 1}`} value={m.controlDescription} />
          ))}
        </div>
      )}

      {data.internationalTransfers.length > 0 && (
        <div className="space-y-1">
          <SectionTitle>Transferência Internacional</SectionTitle>
          {data.internationalTransfers.map((t, i) => (
            <Row
              key={i}
              label={t.country || `País ${i + 1}`}
              value={`${t.dataTransferred} — ${t.safeguardType}`}
            />
          ))}
        </div>
      )}

      {data.contracts.length > 0 && (
        <div className="space-y-1">
          <SectionTitle>Contratos</SectionTitle>
          {data.contracts.map((c, i) => (
            <Row key={i} label={c.processNumber || `Contrato ${i + 1}`} value={c.subject} />
          ))}
        </div>
      )}

      <div className="space-y-1">
        <SectionTitle>Impacto</SectionTitle>
        <Row
          label="RIPD"
          value={
            data.requiresDpia === 'automatic'
              ? `Automático (${suggestDpia(data) ? 'Sim' : 'Não'})`
              : data.requiresDpia
          }
        />
      </div>
    </div>
  )
}

// ─── Validação por etapa ──────────────────────────────────────────────────────

function validateStep(step: number, data: FormData): StepErrors {
  const e: StepErrors = {}
  switch (step) {
    case 0:
      if (!data.identification.controller.name.trim())
        e['controller_name'] = 'Nome do controlador é obrigatório'
      break
    case 1:
      if (!data.processName.trim()) e['process_name'] = 'Nome do processo é obrigatório'
      break
    case 3:
      if (data.dataCategories.length === 0)
        e['data_categories'] = 'Selecione pelo menos uma categoria de dados pessoais'
      break
    case 4:
      if (!data.processingFrequency)
        e['processing_frequency'] = 'Selecione a frequência do tratamento'
      break
    case 5:
      if (!data.purpose.trim()) e['purpose'] = 'Descreva a finalidade do tratamento'
      if (data.legalBases.length === 0)
        e['legal_bases'] = 'Selecione pelo menos uma base legal (art. 7º LGPD)'
      if (
        data.legalBases.includes('Consentimento do titular') &&
        !data.consentCollectionMethod.trim()
      )
        e['consent_collection_method'] = 'Informe como o consentimento é coletado'
      break
    case 6:
      if (data.dataSources.length === 0)
        e['data_sources'] = 'Selecione pelo menos uma fonte de dados'
      if (data.dataSubjectCategories.length === 0)
        e['data_subject_categories'] = 'Selecione pelo menos uma categoria de titular'
      break
    case 7:
      if (data.storageTypes.length === 0)
        e['storage_types'] = 'Selecione pelo menos um tipo de armazenamento'
      if (!data.storageLocation.trim())
        e['storage_location'] = 'Informe onde exatamente os dados são armazenados'
      break
  }
  return e
}

// ─── Wizard principal ────────────────────────────────────────────────────────

interface WizardProps {
  companyId: string
  initialData?: Partial<FormData>
  id?: string
}

export function InventoryWizard({ companyId, initialData, id }: WizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>({ ...createDefaultFormData(), ...initialData })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [stepErrors, setStepErrors] = useState<StepErrors>({})

  const update = (field: keyof FormData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }))
    // Limpa error do campo ao editar
    setStepErrors((prev) => {
      const next = { ...prev }
      // Mapeamento simples campo → chave de error
      const keyMap: Record<string, string> = {
        processName: 'processName',
        purpose: 'purpose',
        processingFrequency: 'processingFrequency',
        storageLocation: 'storageLocation',
        consentCollectionMethod: 'consentCollectionMethod',
        legalBases: 'legalBases',
        dataCategories: 'dataCategories',
        dataSources: 'dataSources',
        dataSubjectCategories: 'dataSubjectCategories',
        storageTypes: 'storageTypes',
        identification: 'controller_name',
      }
      const k = keyMap[field as string]
      if (k) delete next[k]
      return next
    })
  }

  const risk = calculateRisk(data)

  const handleNext = () => {
    const errs = validateStep(step, data)
    if (Object.keys(errs).length > 0) {
      setStepErrors(errs)
      return
    }
    setStepErrors({})
    setStep((s) => s + 1)
  }

  const handleSave = async (status: 'draft' | 'complete') => {
    setSaving(true)
    setSaveError(null)
    try {
      await saveInventory({
        ...data,
        companyId: companyId,
        id,
        riskLevel: risk,
        recordStatus: status,
      })
    } catch (err) {
      // Re-throw erros de redirect (NEXT_REDIRECT) — são navegação, não falhas
      if (isRedirectError(err)) throw err
      setSaving(false)
      setSaveError('Erro ao save. Verifique os campos obrigatórios e tente novamente.')
    }
  }

  const stepContent = [
    <StepIdentification key={0} data={data} update={update} errors={stepErrors} />,
    <StepProcess key={1} data={data} update={update} errors={stepErrors} />,
    <StepLifecycle key={2} data={data} update={update} />,
    <StepData key={3} data={data} update={update} errors={stepErrors} />,
    <StepProcessing key={4} data={data} update={update} errors={stepErrors} />,
    <StepLegalBasis key={5} data={data} update={update} errors={stepErrors} />,
    <StepDataSubject key={6} data={data} update={update} errors={stepErrors} />,
    <StepStorage key={7} data={data} update={update} errors={stepErrors} />,
    <StepInternationalTransfer key={8} data={data} update={update} />,
    <StepContracts key={9} data={data} update={update} />,
    <StepImpact key={10} data={data} update={update} />,
    <StepReview key={11} data={data} risk={risk} />,
  ]

  const progress = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/inventory')}
          className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {id ? 'Editar Inventário' : 'Novo Inventário'}
          </h1>
          <p className="text-sm text-gray-500">
            Etapa {step + 1} de {STEPS.length} — {STEPS[step].label}
          </p>
        </div>
        <div className="ml-auto">
          <Badge variant={riskConfig[risk].badge}>Risco {riskConfig[risk].label}</Badge>
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="hidden sm:flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <button
                key={i}
                onClick={() => {
                  setStepErrors({})
                  setStep(i)
                }}
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${i === step ? 'text-blue-600 font-semibold' : i < step ? 'text-green-600' : 'text-gray-400'}`}
              >
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${i === step ? 'border-blue-500 bg-blue-50' : i < step ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                >
                  {i < step ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
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
            {(() => {
              const Icon = STEPS[step].icon
              return <Icon className="h-5 w-5 text-blue-600" />
            })()}
            {STEPS[step].label}
          </CardTitle>
        </CardHeader>
        <CardContent>{stepContent[step]}</CardContent>
      </Card>

      {saveError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {saveError}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => {
            setStepErrors({})
            setStep((s) => s - 1)
          }}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => handleSave('draft')}
            disabled={saving || !data.processName}
            className="text-gray-500"
          >
            Salvar rascunho
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={() => handleSave('complete')} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Inventário'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
