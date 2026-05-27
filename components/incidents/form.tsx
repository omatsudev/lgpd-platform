'use client'

import { deleteIncident, saveIncident, type IncidentData } from '@/app/actions/incidents'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Bell, CheckCircle2, FileText, Shield, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

// ─── Constantes ────────────────────────────────────────────────────────────

const TYPES = [
  { value: 'data_breach', label: 'Vazamento de Dados' },
  { value: 'unauthorized_access', label: 'Acesso Não Autorizado' },
  { value: 'data_loss', label: 'Perda de Dados' },
  { value: 'improper_modification', label: 'Alteração Indevida' },
  { value: 'misuse', label: 'Uso Indevido' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'other', label: 'Outro' },
]

const SEVERITIES = [
  { value: 'low', label: 'Baixa', desc: 'Impacto mínimo, dados não sensíveis, poucos titulares' },
  { value: 'medium', label: 'Média', desc: 'Impacto moderado ou dados pessoais comuns' },
  { value: 'high', label: 'Alta', desc: 'Dados sensíveis ou grande número de titulares afetados' },
  {
    value: 'critical',
    label: 'Crítica',
    desc: 'Dados sensíveis em escala, risco imediato aos titulares',
  },
]

const STATUS_OPTIONS = [
  { value: 'identified', label: 'Identificado' },
  { value: 'under_investigation', label: 'Em Investigação' },
  { value: 'contained', label: 'Contido' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Encerrado' },
]

const DATA_CATEGORIES = [
  { id: 'personal_identification', label: 'Identificação pessoal' },
  { id: 'government_data', label: 'Dados governamentais (CPF, RG...)' },
  { id: 'financial_data', label: 'Dados financeiros' },
  { id: 'sensitive_data', label: 'Dados sensíveis (saúde, biometria...)' },
  { id: 'electronic_data', label: 'Dados eletrônicos (IP, login...)' },
  { id: 'children_data', label: 'Dados de crianças/adolescentes' },
  { id: 'other', label: 'Outros' },
]

const severityColors: Record<string, string> = {
  low: 'border-green-300 bg-green-50 text-green-800',
  medium: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  high: 'border-red-300 bg-red-50 text-red-800',
  critical: 'border-red-500 bg-red-100 text-red-900 font-semibold',
}

// ─── Tipo local ───────────────────────────────────────────────────────────

type FormState = Omit<IncidentData, 'company_id' | 'id'>

function defaultState(): FormState {
  return {
    title: '',
    type: '',
    severity: 'medium',
    status: 'identified',
    occurrence_date: '',
    discovery_date: new Date().toISOString().split('T')[0],
    description: '',
    affected_data: '',
    affected_data_categories: [],
    affected_subjects_count: '',
    root_cause: '',
    immediate_measures: '',
    corrective_measures: '',
    responsible: '',
    notified_anpd: false,
    anpd_notification_date: '',
    anpd_protocol: '',
    notified_subjects: false,
    subjects_notification_date: '',
    operadores_envolvidos: '',
    relatorio_impacto: '',
  }
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: any
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
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

// ─── Componente principal ─────────────────────────────────────────────────

interface IncidentFormProps {
  companyId: string
  id?: string
  initialData?: any
}

export function IncidentForm({ companyId, id, initialData }: IncidentFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      title: initialData.title ?? '',
      type: initialData.type ?? '',
      severity: initialData.severity ?? 'medium',
      status: initialData.status ?? 'identified',
      occurrence_date: initialData.occurrence_date ?? '',
      discovery_date: initialData.discovery_date ?? new Date().toISOString().split('T')[0],
      description: initialData.description ?? '',
      affected_data: initialData.affected_data ?? '',
      affected_data_categories: initialData.affected_data_categories ?? [],
      affected_subjects_count: initialData.affected_subjects_count ?? '',
      root_cause: initialData.root_cause ?? '',
      immediate_measures: initialData.immediate_measures ?? '',
      corrective_measures: initialData.corrective_measures ?? '',
      responsible: initialData.responsible ?? '',
      notified_anpd: initialData.notified_anpd ?? false,
      anpd_notification_date: initialData.anpd_notification_date ?? '',
      anpd_protocol: initialData.anpd_protocol ?? '',
      notified_subjects: initialData.notified_subjects ?? false,
      subjects_notification_date: initialData.subjects_notification_date ?? '',
      operadores_envolvidos: initialData.operadores_envolvidos ?? '',
      relatorio_impacto: initialData.relatorio_impacto ?? '',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const toggleCategory = (cat: string) => {
    setData((prev) => ({
      ...prev,
      affected_data_categories: prev.affected_data_categories.includes(cat)
        ? prev.affected_data_categories.filter((c) => c !== cat)
        : [...prev.affected_data_categories, cat],
    }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.title.trim()) errs.title = 'Título é obrigatório'
    if (!data.type) errs.type = 'Tipo é obrigatório'
    if (!data.discovery_date) errs.discovery_date = 'Data de descoberta é obrigatória'
    if (!data.description.trim()) errs.description = 'Descrição é obrigatória'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await saveIncident({ ...data, company_id: companyId, id })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = async (formData: FormData) => {
    startDeleting(async () => {
      await deleteIncident(formData)
    })
  }

  const needsAnpdNotification = data.severity === 'high' || data.severity === 'critical'

  return (
    <div className="space-y-6">
      {needsAnpdNotification && !data.notified_anpd && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-medium">Notificação obrigatória: </span>
                Incidentes de severidade alta/crítica devem ser comunicados à ANPD em até 3 dias
                úteis (Art. 48 LGPD).
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={AlertTriangle}
            title="Identificação do Incidente"
            subtitle="Informações básicas sobre o incidente"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título do incidente *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ex: Vazamento de dados de clientes no sistema ERP"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de incidente *</Label>
              <Select value={data.type} onValueChange={(v) => update('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={data.status} onValueChange={(v) => update('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Severidade *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEVERITIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update('severity', s.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    data.severity === s.value
                      ? severityColors[s.value]
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs mt-0.5 opacity-75">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="occurrence_date">Data de ocorrência</Label>
              <Input
                id="occurrence_date"
                type="date"
                value={data.occurrence_date}
                onChange={(e) => update('occurrence_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discovery_date">Data de descoberta *</Label>
              <Input
                id="discovery_date"
                type="date"
                value={data.discovery_date}
                onChange={(e) => update('discovery_date', e.target.value)}
              />
              {errors.discovery_date && (
                <p className="text-xs text-red-500">{errors.discovery_date}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="responsible">Responsável pela investigação</Label>
            <Input
              id="responsible"
              value={data.responsible}
              onChange={(e) => update('responsible', e.target.value)}
              placeholder="Nome ou setor responsável"
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Detalhamento */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Shield}
            title="Detalhamento do Incidente"
            subtitle="Dados afetados e análise da causa"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição do incidente *</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Descreva o que aconteceu, como foi detectado e o contexto do incidente..."
              rows={4}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categorias de dados afetados</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DATA_CATEGORIES.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer select-none p-2 rounded border border-transparent hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={data.affected_data_categories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="affected_data">Dados afetados (descrição)</Label>
              <Textarea
                id="affected_data"
                value={data.affected_data}
                onChange={(e) => update('affected_data', e.target.value)}
                placeholder="Descreva quais dados foram expostos ou comprometidos..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="affected_subjects_count">Titulares afetados</Label>
              <Input
                id="affected_subjects_count"
                value={data.affected_subjects_count}
                onChange={(e) => update('affected_subjects_count', e.target.value)}
                placeholder="Ex: Aproximadamente 500, Desconhecido"
              />
              <Label htmlFor="root_cause" className="mt-3 block">
                Causa raiz
              </Label>
              <Textarea
                id="root_cause"
                value={data.root_cause}
                onChange={(e) => update('root_cause', e.target.value)}
                placeholder="Qual foi a origem do incidente?"
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Resposta */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Wrench}
            title="Resposta ao Incidente"
            subtitle="Medidas tomadas para contenção e correção"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="immediate_measures">Medidas imediatas tomadas</Label>
            <Textarea
              id="immediate_measures"
              value={data.immediate_measures}
              onChange={(e) => update('immediate_measures', e.target.value)}
              placeholder="O que foi feito imediatamente após descoberta? (bloqueio, isolamento, backup...)"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="corrective_measures">Medidas corretivas / preventivas</Label>
            <Textarea
              id="corrective_measures"
              value={data.corrective_measures}
              onChange={(e) => update('corrective_measures', e.target.value)}
              placeholder="Quais melhorias foram implementadas para evitar recorrência?"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="operadores_envolvidos">Operadores envolvidos</Label>
            <Textarea
              id="operadores_envolvidos"
              value={data.operadores_envolvidos}
              onChange={(e) => update('operadores_envolvidos', e.target.value)}
              placeholder="Liste os operadores de dados envolvidos no incidente (fornecedores, parceiros, subcontratados...)"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 3b: Relatório de Impacto */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={FileText}
            title="Relatório de Impacto"
            subtitle="DPIA / Avaliação de impacto à proteção de dados"
          />
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.relatorio_impacto}
            onChange={(e) => update('relatorio_impacto', e.target.value)}
            placeholder="Descreva o impacto potencial do incidente aos titulares: riscos identificados, probabilidade de dano, gravidade, mitigações adotadas..."
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Seção 4: Notificações */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Bell}
            title="Notificações Regulatórias"
            subtitle="LGPD Art. 48: comunicação à ANPD e titulares"
          />
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">
                  Autoridade Nacional de Proteção de Dados (ANPD)
                </p>
                <p className="text-xs text-gray-500">
                  Prazo: até 3 dias úteis após a descoberta para incidentes graves
                </p>
              </div>
              {data.notified_anpd && (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Notificado
                </Badge>
              )}
            </div>
            <CheckBox
              checked={data.notified_anpd}
              onChange={(v) => update('notified_anpd', v)}
              label="A ANPD foi notificada sobre este incidente"
            />
            {data.notified_anpd && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="anpd_notification_date">Data da notificação</Label>
                  <Input
                    id="anpd_notification_date"
                    type="date"
                    value={data.anpd_notification_date}
                    onChange={(e) => update('anpd_notification_date', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="anpd_protocol">Protocolo ANPD</Label>
                  <Input
                    id="anpd_protocol"
                    value={data.anpd_protocol}
                    onChange={(e) => update('anpd_protocol', e.target.value)}
                    placeholder="Número do protocolo"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Titulares dos Dados</p>
                <p className="text-xs text-gray-500">
                  Comunicar quando o incidente puder causar risco ou dano relevante
                </p>
              </div>
              {data.notified_subjects && (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Notificados
                </Badge>
              )}
            </div>
            <CheckBox
              checked={data.notified_subjects}
              onChange={(v) => update('notified_subjects', v)}
              label="Os titulares afetados foram comunicados"
            />
            {data.notified_subjects && (
              <div className="pt-1">
                <Label htmlFor="subjects_notification_date">
                  Data da comunicação aos titulares
                </Label>
                <Input
                  id="subjects_notification_date"
                  type="date"
                  value={data.subjects_notification_date}
                  onChange={(e) => update('subjects_notification_date', e.target.value)}
                  className="mt-1.5"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {id && (
          <form action={handleDelete}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Incidente'}
            </Button>
          </form>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <Button variant="outline" onClick={() => router.push('/incidents')} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Registrar Incidente'}
          </Button>
        </div>
      </div>
    </div>
  )
}
