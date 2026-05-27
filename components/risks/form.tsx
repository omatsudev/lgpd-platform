'use client'

import { deleteRisk, saveRisk, type RiskData } from '@/app/actions/risks'
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
import { AlertTriangle, Target, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

// ─── Constantes ────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'privacy', label: 'Privacidade' },
  { value: 'security', label: 'Segurança da Informação' },
  { value: 'legal', label: 'Legal / Regulatório' },
  { value: 'operational', label: 'Operacional' },
  { value: 'reputational', label: 'Reputacional' },
  { value: 'technological', label: 'Tecnológico' },
]

const ORIGINS = [
  { value: 'inventory', label: 'Inventário de Dados' },
  { value: 'incident', label: 'Incidente de Segurança' },
  { value: 'audit', label: 'Auditoria' },
  { value: 'supplier', label: 'Fornecedor' },
  { value: 'internal', label: 'Análise Interna' },
  { value: 'other', label: 'Outro' },
]

const STRATEGIES = [
  {
    value: 'mitigate',
    label: 'Mitigar',
    desc: 'Implementar controles para reduzir probabilidade ou impacto',
  },
  { value: 'accept', label: 'Aceitar', desc: 'Risco dentro do apetite, sem ação adicional' },
  { value: 'transfer', label: 'Transferir', desc: 'Transferir o risco (seguro, terceirização)' },
  { value: 'avoid', label: 'Evitar', desc: 'Cessar a atividade que gera o risco' },
]

const STATUS_OPTIONS = [
  { value: 'identified', label: 'Identificado' },
  { value: 'under_treatment', label: 'Em Tratamento' },
  { value: 'monitoring', label: 'Monitorando' },
  { value: 'closed', label: 'Encerrado' },
]

const SCALE = [1, 2, 3, 4, 5]
const PROB_LABELS: Record<number, string> = {
  1: 'Raro',
  2: 'Improvável',
  3: 'Possível',
  4: 'Provável',
  5: 'Quase certo',
}
const IMPACT_LABELS: Record<number, string> = {
  1: 'Insignificante',
  2: 'Menor',
  3: 'Moderado',
  4: 'Maior',
  5: 'Catastrófico',
}

function scoreColor(prob: number, imp: number) {
  const s = prob * imp
  if (s >= 15) return 'text-red-600 bg-red-50 border-red-200'
  if (s >= 9) return 'text-orange-600 bg-orange-50 border-orange-200'
  if (s >= 4) return 'text-yellow-700 bg-yellow-50 border-yellow-200'
  return 'text-green-700 bg-green-50 border-green-200'
}

function scoreLabel(prob: number, imp: number) {
  const s = prob * imp
  if (s >= 15) return 'Crítico'
  if (s >= 9) return 'Alto'
  if (s >= 4) return 'Médio'
  return 'Baixo'
}

function ScaleSelector({
  label,
  value,
  onChange,
  labelMap,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  labelMap: Record<number, string>
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
              value === n
                ? 'border-blue-500 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {value > 0 && <p className="text-xs text-gray-500">{labelMap[value]}</p>}
    </div>
  )
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

// ─── Componente principal ──────────────────────────────────────────────────

type FormState = Omit<RiskData, 'company_id' | 'id'>

function defaultState(): FormState {
  return {
    title: '',
    description: '',
    category: '',
    origin: '',
    inventory_id: '',
    incident_id: '',
    inherent_probability: 3,
    inherent_impact: 3,
    residual_probability: 0,
    residual_impact: 0,
    strategy: '',
    action_plan: '',
    responsible: '',
    deadline: '',
    status: 'identified',
  }
}

interface RiskFormProps {
  companyId: string
  id?: string
  initialData?: any
}

export function RiscoForm({ companyId, id, initialData }: RiskFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      title: initialData.title ?? '',
      description: initialData.description ?? '',
      category: initialData.category ?? '',
      origin: initialData.origin ?? '',
      inventory_id: initialData.inventory_id ?? '',
      incident_id: initialData.incident_id ?? '',
      inherent_probability: initialData.inherent_probability ?? 3,
      inherent_impact: initialData.inherent_impact ?? 3,
      residual_probability: initialData.residual_probability ?? 0,
      residual_impact: initialData.residual_impact ?? 0,
      strategy: initialData.strategy ?? '',
      action_plan: initialData.action_plan ?? '',
      responsible: initialData.responsible ?? '',
      deadline: initialData.deadline ?? '',
      status: initialData.status ?? 'identified',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.title.trim()) errs.title = 'Título é obrigatório'
    if (!data.category) errs.category = 'Categoria é obrigatória'
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
      await saveRisk({ ...data, company_id: companyId, id })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = (formData: FormData) => {
    startDeleting(async () => {
      await deleteRisk(formData)
    })
  }

  const inherentScore = data.inherent_probability * data.inherent_impact
  const hasResidual = data.residual_probability > 0 && data.residual_impact > 0
  const residualScore = hasResidual ? data.residual_probability * data.residual_impact : null

  return (
    <div className="space-y-6">
      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={AlertTriangle} title="Identificação do Risco" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Descreva o risco de forma clara e objetiva"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Contexto, causa raiz e potenciais consequências..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={data.category} onValueChange={(v) => update('category', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Select value={data.origin} onValueChange={(v) => update('origin', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ORIGINS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </CardContent>
      </Card>

      {/* Seção 2: Avaliação inerente */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Target}
            title="Avaliação de Risco Inerente"
            subtitle="Antes de qualquer controle ou medida de mitigação"
          />
        </CardHeader>
        <CardContent className="space-y-5">
          <ScaleSelector
            label="Probabilidade"
            value={data.inherent_probability}
            onChange={(v) => update('inherent_probability', v)}
            labelMap={PROB_LABELS}
          />
          <ScaleSelector
            label="Impacto"
            value={data.inherent_impact}
            onChange={(v) => update('inherent_impact', v)}
            labelMap={IMPACT_LABELS}
          />
          <div
            className={`flex items-center justify-between p-4 rounded-lg border ${scoreColor(data.inherent_probability, data.inherent_impact)}`}
          >
            <div>
              <p className="text-sm font-medium">Risco Inerente</p>
              <p className="text-xs opacity-75">Score = Probabilidade × Impacto</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{inherentScore}</p>
              <p className="text-sm font-semibold">
                {scoreLabel(data.inherent_probability, data.inherent_impact)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Tratamento */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Wrench}
            title="Plano de Tratamento"
            subtitle="Estratégia e ações para reduzir o risco"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Estratégia de tratamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {STRATEGIES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update('strategy', s.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    data.strategy === s.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium">{s.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="action_plan">Plano de ação</Label>
            <Textarea
              id="action_plan"
              value={data.action_plan}
              onChange={(e) => update('action_plan', e.target.value)}
              placeholder="Descreva as ações específicas para tratar este risco..."
              rows={4}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="responsible">Responsável</Label>
              <Input
                id="responsible"
                value={data.responsible}
                onChange={(e) => update('responsible', e.target.value)}
                placeholder="Nome ou setor responsável"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deadline">Prazo</Label>
              <Input
                id="deadline"
                type="date"
                value={data.deadline}
                onChange={(e) => update('deadline', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 4: Risco residual */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Target}
            title="Avaliação de Risco Residual"
            subtitle="Após a implementação dos controles (opcional)"
          />
        </CardHeader>
        <CardContent className="space-y-5">
          <ScaleSelector
            label="Probabilidade residual"
            value={data.residual_probability || 0}
            onChange={(v) => update('residual_probability', v)}
            labelMap={{ 0: 'Não avaliado', ...PROB_LABELS }}
          />
          <ScaleSelector
            label="Impacto residual"
            value={data.residual_impact || 0}
            onChange={(v) => update('residual_impact', v)}
            labelMap={{ 0: 'Não avaliado', ...IMPACT_LABELS }}
          />
          {residualScore !== null && (
            <div
              className={`flex items-center justify-between p-4 rounded-lg border ${scoreColor(data.residual_probability, data.residual_impact)}`}
            >
              <div>
                <p className="text-sm font-medium">Risco Residual</p>
                <p className="text-xs opacity-75">
                  Redução de {inherentScore - residualScore} pontos
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{residualScore}</p>
                <p className="text-sm font-semibold">
                  {scoreLabel(data.residual_probability, data.residual_impact)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {id && (
          <form action={handleDelete}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Risco'}
            </Button>
          </form>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <Button variant="outline" onClick={() => router.push('/risks')} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Registrar Risco'}
          </Button>
        </div>
      </div>
    </div>
  )
}
