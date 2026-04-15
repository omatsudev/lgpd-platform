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
import { salvarInventarioProfissional, type InventarioData } from '@/app/actions/inventario'
import {
  CheckCircle2, Circle, AlertTriangle, Shield, ChevronRight, ChevronLeft,
  Info, Building2, RefreshCw, Share2, Database, Scale, Users, Archive,
  Activity, ClipboardList,
} from 'lucide-react'

// ─── Constantes ────────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Processo', icon: Building2 },
  { label: 'Ciclo de Vida', icon: RefreshCw },
  { label: 'Dados', icon: Database },
  { label: 'Tratamento', icon: Share2 },
  { label: 'Base Legal', icon: Scale },
  { label: 'Titular', icon: Users },
  { label: 'Armazenamento', icon: Archive },
  { label: 'Impacto', icon: Activity },
  { label: 'Revisão', icon: ClipboardList },
]

const FASES = [
  { id: 'coleta', label: 'Coleta' },
  { id: 'retencao', label: 'Retenção' },
  { id: 'processamento', label: 'Processamento' },
  { id: 'compartilhamento', label: 'Compartilhamento' },
  { id: 'eliminacao', label: 'Eliminação' },
]

const CATEGORIAS = [
  { id: 'identificacao_pessoal', label: 'Identificação pessoal', desc: 'Nome, endereço, data de nascimento, telefone' },
  { id: 'dados_governamentais', label: 'Dados governamentais', desc: 'CPF, RG, CNH, título de eleitor, passaporte' },
  { id: 'dados_eletronicos', label: 'Dados eletrônicos', desc: 'IP, login, cookies, histórico de navegação, dispositivos' },
  { id: 'dados_financeiros', label: 'Dados financeiros', desc: 'Conta bancária, cartão, renda, patrimônio, dívidas' },
  { id: 'dados_consentimento', label: 'Dados sob consentimento', desc: 'Coletados mediante autorização expressa do titular' },
  { id: 'caracteristicas_pessoais', label: 'Características pessoais', desc: 'Cor, altura, peso, aparência física' },
  { id: 'caracteristicas_psicologicas', label: 'Características psicológicas', desc: 'Personalidade, comportamento, preferências, opiniões' },
  { id: 'composicao_familiar', label: 'Composição familiar', desc: 'Estado civil, filhos, cônjuge, dependentes' },
  { id: 'educacao_treinamento', label: 'Educação e treinamento', desc: 'Escolaridade, cursos, diplomas, certificados' },
  { id: 'dados_academicos', label: 'Dados acadêmicos', desc: 'Notas, frequência, histórico escolar' },
  { id: 'profissao_emprego', label: 'Profissão e emprego', desc: 'Cargo, salário, CTPS, histórico profissional' },
  { id: 'imagem_video_voz', label: 'Imagem, vídeo e voz', desc: 'Fotos, gravações de áudio/vídeo, reconhecimento facial' },
  { id: 'dados_sensiveis', label: 'Dados sensíveis', desc: 'Origem racial, religião, saúde, biometria, orientação sexual, opinião política' },
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

// ─── Tipos ────────────────────────────────────────────────────────────────

type Fase = { ativo: boolean; controlador: boolean; operador: boolean }
type FormData = Omit<InventarioData, 'company_id' | 'id'>

const DEFAULT_FASE: Fase = { ativo: false, controlador: false, operador: false }

function defaultData(): FormData {
  return {
    process_name: '',
    responsible_department: '',
    process_description: '',
    lifecycle_phases: {
      coleta: { ...DEFAULT_FASE },
      retencao: { ...DEFAULT_FASE },
      processamento: { ...DEFAULT_FASE },
      compartilhamento: { ...DEFAULT_FASE },
      eliminacao: { ...DEFAULT_FASE },
    },
    data_categories: [],
    data_description: '',
    processing_frequency: '',
    data_shared: false,
    shared_with: '',
    purpose: '',
    legal_basis: '',
    consent_collection_method: '',
    data_source: '',
    data_subject_category: '',
    storage_type: '',
    storage_location: '',
    retention_period: '',
    responsible: '',
    security_measures: '',
    requires_dpia: 'automatic',
    risk_level: 'low',
    record_status: 'draft',
  }
}

// ─── Cálculo de risco ──────────────────────────────────────────────────────

function calcularRisco(data: FormData): 'baixo' | 'medio' | 'alto' {
  const temSensiveis = data.data_categories.includes('dados_sensiveis')
  const semBaseLegal = !data.legal_basis
  if (temSensiveis || semBaseLegal) return 'alto'
  if (data.data_shared || !data.retention_period) return 'medio'
  return 'baixo'
}

function sugerirRIPD(data: FormData): boolean {
  return data.data_categories.includes('dados_sensiveis') || data.data_shared
}

const riscoConfig = {
  baixo: { label: 'Baixo', color: 'text-green-600', bg: 'bg-green-50 border-green-200', badge: 'success' as const },
  medio: { label: 'Médio', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', badge: 'warning' as const },
  alto: { label: 'Alto', color: 'text-red-600', bg: 'bg-red-50 border-red-200', badge: 'destructive' as const },
}

// ─── Componentes de apoio ──────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-xs text-red-500 mt-1">{msg}</p>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{children}</h3>
}

function CheckBox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────

function Step1({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Nome do Processo *</Label>
        <Input
          value={data.process_name}
          onChange={e => update('process_name', e.target.value)}
          placeholder="Ex: Gestão de Recursos Humanos, Atendimento ao Cliente..."
        />
      </div>
      <div className="space-y-2">
        <Label>Setor Responsável</Label>
        <Input
          value={data.responsible_department}
          onChange={e => update('responsible_department', e.target.value)}
          placeholder="Ex: RH, Comercial, TI, Financeiro..."
        />
      </div>
      <div className="space-y-2">
        <Label>Descrição do Processo</Label>
        <Textarea
          value={data.process_description}
          onChange={e => update('process_description', e.target.value)}
          placeholder="Descreva brevemente o processo e como ele envolve dados pessoais..."
          rows={4}
        />
      </div>
    </div>
  )
}

function Step2({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const fases = data.lifecycle_phases as Record<string, Fase>

  const toggleFase = (faseId: string, field: keyof Fase, value: boolean) => {
    const updated = {
      ...fases,
      [faseId]: { ...fases[faseId], [field]: value },
    }
    if (field === 'ativo' && !value) {
      updated[faseId] = { ativo: false, controlador: false, operador: false }
    }
    update('lifecycle_phases', updated)
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">Marque as fases do ciclo de vida dos dados e quem atua em cada uma.</p>
      <div className="space-y-3">
        {FASES.map(fase => {
          const f = fases[fase.id] ?? DEFAULT_FASE
          return (
            <div key={fase.id} className={`rounded-lg border p-4 transition-colors ${f.ativo ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <CheckBox
                checked={f.ativo}
                onChange={v => toggleFase(fase.id, 'ativo', v)}
                label={fase.label}
              />
              {f.ativo && (
                <div className="mt-3 ml-6 flex gap-6">
                  <CheckBox
                    checked={f.controlador}
                    onChange={v => toggleFase(fase.id, 'controlador', v)}
                    label="Controlador atua"
                  />
                  <CheckBox
                    checked={f.operador}
                    onChange={v => toggleFase(fase.id, 'operador', v)}
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

function Step3({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const [tooltip, setTooltip] = useState<string | null>(null)

  const toggle = (id: string) => {
    const current = data.data_categories
    const next = current.includes(id) ? current.filter(c => c !== id) : [...current, id]
    update('data_categories', next)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Selecione as categorias de dados pessoais tratados neste processo.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {CATEGORIAS.map(cat => {
          const selected = data.data_categories.includes(cat.id)
          const isSensivel = cat.id === 'dados_sensiveis'
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
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
      {data.data_categories.includes('dados_sensiveis') && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <span><strong>Dados sensíveis:</strong> exigem maior cuidado jurídico. O nível de risco será classificado como <strong>Alto</strong> automaticamente.</span>
        </div>
      )}
      <div className="space-y-2">
        <Label>Descrição adicional dos dados</Label>
        <Textarea
          value={data.data_description}
          onChange={e => update('data_description', e.target.value)}
          placeholder="Detalhe os dados específicos tratados, se necessário..."
          rows={3}
        />
      </div>
    </div>
  )
}

function Step4({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Frequência do Tratamento *</Label>
        <div className="grid grid-cols-3 gap-3">
          {['Contínuo', 'Eventual', 'Único'].map(freq => (
            <button
              key={freq}
              type="button"
              onClick={() => update('processing_frequency', freq.toLowerCase())}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                data.processing_frequency === freq.toLowerCase()
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {freq}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Os dados são compartilhados com terceiros?</Label>
        <div className="flex gap-3">
          {[
            { value: true, label: 'Sim' },
            { value: false, label: 'Não' },
          ].map(opt => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => update('data_shared', opt.value)}
              className={`flex-1 rounded-lg border p-3 text-sm font-medium transition-colors ${
                data.data_shared === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {data.data_shared && (
          <div className="space-y-2">
            <Label>Com quem são compartilhados?</Label>
            <Input
              value={data.shared_with}
              onChange={e => update('shared_with', e.target.value)}
              placeholder="Ex: Operadoras de saúde, parceiros comerciais, autoridades..."
            />
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-700">
              <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
              <span>O compartilhamento aumenta o nível de risco e pode exigir DPA (Acordo de Tratamento de Dados) com o terceiro.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Step5({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Finalidade do Tratamento *</Label>
        <Textarea
          value={data.purpose}
          onChange={e => update('purpose', e.target.value)}
          placeholder="Descreva para qual finalidade os dados são tratados. Ex: Gestão de folha de pagamento, envio de comunicações de marketing..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Base Legal *</Label>
        <Select value={data.legal_basis} onValueChange={v => update('legal_basis', v)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a base legal..." />
          </SelectTrigger>
          <SelectContent>
            {BASES_LEGAIS.map(bl => (
              <SelectItem key={bl} value={bl}>{bl}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!data.legal_basis && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> A ausência de base legal é uma não-conformidade crítica.
          </p>
        )}
      </div>

      {data.legal_basis === 'Consentimento do titular' && (
        <div className="space-y-2">
          <Label>Forma de coleta do consentimento *</Label>
          <Input
            value={data.consent_collection_method}
            onChange={e => update('consent_collection_method', e.target.value)}
            placeholder="Ex: Checkbox no site, termo assinado, WhatsApp..."
          />
          <p className="text-xs text-gray-500">O consentimento deve ser livre, informado, inequívoco e documentado.</p>
        </div>
      )}
    </div>
  )
}

function Step6({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Fonte dos dados *</Label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'direto', label: 'Direto do titular' },
            { value: 'terceiros', label: 'Terceiros' },
            { value: 'publico', label: 'Fonte pública' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('data_source', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors text-center ${
                data.data_source === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Categoria do titular *</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'cliente', label: 'Cliente' },
            { value: 'funcionario', label: 'Funcionário' },
            { value: 'fornecedor', label: 'Fornecedor' },
            { value: 'lead', label: 'Lead / Prospect' },
            { value: 'parceiro', label: 'Parceiro' },
            { value: 'outro', label: 'Outro' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('data_subject_category', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                data.data_subject_category === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step7({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Tipo de armazenamento *</Label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'fisico', label: 'Local físico' },
            { value: 'nuvem', label: 'Nuvem (cloud)' },
            { value: 'hibrido', label: 'Híbrido' },
            { value: 'terceiro', label: 'Sistema de terceiro' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('storage_type', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                data.storage_type === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Onde exatamente? *</Label>
        <Input
          value={data.storage_location}
          onChange={e => update('storage_location', e.target.value)}
          placeholder="Ex: Servidor interno, AWS S3, Google Drive, Planilha Excel..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Prazo de retenção</Label>
          <Input
            value={data.retention_period}
            onChange={e => update('retention_period', e.target.value)}
            placeholder="Ex: 5 anos, enquanto vigente o contrato..."
          />
          {!data.retention_period && (
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Sem prazo definido aumenta o risco.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label>Responsável pelo tratamento</Label>
          <Input
            value={data.responsible}
            onChange={e => update('responsible', e.target.value)}
            placeholder="Nome ou setor..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Medidas de segurança adotadas</Label>
        <Textarea
          value={data.security_measures}
          onChange={e => update('security_measures', e.target.value)}
          placeholder="Ex: Criptografia, controle de acesso, backup automático, antivírus..."
          rows={3}
        />
      </div>
    </div>
  )
}

function Step8({ data, update }: { data: FormData; update: (f: keyof FormData, v: any) => void }) {
  const ripd_sugerido = sugerirRIPD(data)
  const risco = calcularRisco(data)
  const riscoInfo = riscoConfig[risco]

  const ripdFinal = data.requires_dpia === 'automatic' ? (ripd_sugerido ? 'sim' : 'nao') : data.requires_dpia

  return (
    <div className="space-y-5">
      {/* Risco calculado */}
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
          {!data.legal_basis && <p>• Sem base legal definida → alerta crítico</p>}
          {data.data_shared && <p>• Compartilhamento com terceiros → risco aumentado</p>}
          {!data.retention_period && <p>• Sem prazo de retenção definido</p>}
          {risco === 'baixo' && <p>• Nenhum fator de risco crítico identificado</p>}
        </div>
      </div>

      {/* RIPD */}
      <div className="space-y-3">
        <Label>Necessita de RIPD (Relatório de Impacto)?</Label>
        {ripd_sugerido && data.requires_dpia === 'automatic' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            <span>O sistema sugere <strong>SIM</strong> com base nos dados identificados (dados sensíveis ou compartilhamento com terceiros).</span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'automatic', label: `Automático (${ripd_sugerido ? 'Sim' : 'Não'})` },
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => update('requires_dpia', opt.value)}
              className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                data.requires_dpia === opt.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          RIPD final: <strong>{ripdFinal === 'sim' ? 'Necessário' : 'Não necessário'}</strong>
        </p>
      </div>
    </div>
  )
}

function Step9({ data, risco }: { data: FormData; risco: ReturnType<typeof calcularRisco> }) {
  const riscoInfo = riscoConfig[risco]
  const fasesAtivas = Object.entries(data.lifecycle_phases as Record<string, Fase>)
    .filter(([, f]) => f.ativo)
    .map(([id]) => FASES.find(f => f.id === id)?.label)
    .filter(Boolean)

  const categoriaLabels = data.data_categories.map(
    id => CATEGORIAS.find(c => c.id === id)?.label
  ).filter(Boolean)

  const Row = ({ label, value }: { label: string; value?: string | null }) => (
    value ? (
      <div className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
        <span className="text-xs text-gray-500 w-40 flex-shrink-0">{label}</span>
        <span className="text-sm text-gray-800">{value}</span>
      </div>
    ) : null
  )

  return (
    <div className="space-y-5">
      <div className={`flex items-center justify-between p-4 rounded-lg border ${riscoInfo.bg}`}>
        <div className="flex items-center gap-2">
          <Shield className={`h-5 w-5 ${riscoInfo.color}`} />
          <span className="font-semibold text-gray-800">Nível de risco</span>
        </div>
        <Badge variant={riscoInfo.badge}>{riscoInfo.label}</Badge>
      </div>

      <div className="space-y-1">
        <SectionTitle>Processo</SectionTitle>
        <Row label="Nome do processo" value={data.process_name} />
        <Row label="Setor" value={data.responsible_department} />
        <Row label="Descrição" value={data.process_description} />
      </div>

      <div className="space-y-1">
        <SectionTitle>Dados e Tratamento</SectionTitle>
        <Row label="Categorias" value={categoriaLabels.join(', ')} />
        <Row label="Fases ativas" value={fasesAtivas.join(', ')} />
        <Row label="Frequência" value={data.processing_frequency} />
        <Row label="Compartilhamento" value={data.data_shared ? `Sim — ${data.shared_with}` : 'Não'} />
      </div>

      <div className="space-y-1">
        <SectionTitle>Base Legal e Finalidade</SectionTitle>
        <Row label="Finalidade" value={data.purpose} />
        <Row label="Base legal" value={data.legal_basis} />
        {data.consent_collection_method && (
          <Row label="Coleta de consentimento" value={data.consent_collection_method} />
        )}
      </div>

      <div className="space-y-1">
        <SectionTitle>Titular e Armazenamento</SectionTitle>
        <Row label="Fonte dos dados" value={data.data_source} />
        <Row label="Categoria do titular" value={data.data_subject_category} />
        <Row label="Tipo de armazenamento" value={data.storage_type} />
        <Row label="Local" value={data.storage_location} />
        <Row label="Prazo de retenção" value={data.retention_period} />
      </div>

      <div className="space-y-1">
        <SectionTitle>Impacto</SectionTitle>
        <Row label="RIPD" value={data.requires_dpia === 'automatic' ? `Automático (${sugerirRIPD(data) ? 'Sim' : 'Não'})` : data.requires_dpia} />
      </div>
    </div>
  )
}

// ─── Wizard principal ──────────────────────────────────────────────────────

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
      await salvarInventarioProfissional({
        ...data,
        company_id: companyId,
        id,
        risk_level: risco,
        record_status: status,
      })
    } catch (e) {
      setSaving(false)
    }
  }

  const stepContent = [
    <Step1 key={0} data={data} update={update} />,
    <Step2 key={1} data={data} update={update} />,
    <Step3 key={2} data={data} update={update} />,
    <Step4 key={3} data={data} update={update} />,
    <Step5 key={4} data={data} update={update} />,
    <Step6 key={5} data={data} update={update} />,
    <Step7 key={6} data={data} update={update} />,
    <Step8 key={7} data={data} update={update} />,
    <Step9 key={8} data={data} risco={risco} />,
  ]

  const progress = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/inventory')} className="flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 transition-colors">
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

      {/* Progress */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="hidden sm:flex justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            return (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                  i === step ? 'text-blue-600 font-semibold' :
                  i < step ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  i === step ? 'border-blue-500 bg-blue-50' :
                  i < step ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}>
                  {i < step
                    ? <CheckCircle2 className="h-4 w-4 text-green-500" />
                    : <Icon className="h-3.5 w-3.5" />
                  }
                </div>
                <span className="hidden lg:block">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Step content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {(() => { const Icon = STEPS[step].icon; return <Icon className="h-5 w-5 text-blue-600" /> })()}
            {STEPS[step].label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stepContent[step]}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => handleSave('draft')}
            disabled={saving || !data.process_name}
            className="text-gray-500"
          >
            Salvar rascunho
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(s => s + 1)}>
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => handleSave('complete')}
              disabled={saving || !data.process_name || !data.legal_basis || !data.purpose}
            >
              {saving ? 'Salvando...' : 'Salvar Inventário'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
