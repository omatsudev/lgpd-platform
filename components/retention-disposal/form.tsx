'use client'

import {
  deleteRetentionDisposal,
  saveRetentionDisposal,
  type RetentionDisposalData,
} from '@/app/actions/retention-disposal'
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
import {
  CATEGORIAS_DADOS,
  DESTINACOES_FINAIS,
  EVENTOS_INICIAIS,
  FUNDAMENTOS_JURIDICOS,
  RETENTION_BASE_TABLE,
} from '@/lib/retention-base-table'
import { BookOpen, FileArchive, Lock, Scale, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

// ─── Tipos locais ─────────────────────────────────────────────────────────

type FormState = Omit<RetentionDisposalData, 'company_id' | 'id'>

function defaultState(): FormState {
  return {
    data_type: '',
    category: '',
    retention_period: '',
    retention_start_event: '',
    event_date: '',
    expiration_date: '',
    legal_basis: '',
    prescription_period: '',
    decadence_period: '',
    hold_possible: false,
    final_disposition: '',
    hold_active: false,
    hold_reason: '',
    notes: '',
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────

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

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
          onClick={() => onChange(!checked)}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </div>
      </div>
      <div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </label>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────

interface RetentionDisposalFormProps {
  companyId: string
  id?: string
  initialData?: any
}

export function RetentionDisposalForm({ companyId, id, initialData }: RetentionDisposalFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showBaseTable, setShowBaseTable] = useState(false)

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      data_type: initialData.data_type ?? '',
      category: initialData.category ?? '',
      retention_period: initialData.retention_period ?? '',
      retention_start_event: initialData.retention_start_event ?? '',
      event_date: initialData.event_date ?? '',
      expiration_date: initialData.expiration_date ?? '',
      legal_basis: initialData.legal_basis ?? '',
      prescription_period: initialData.prescription_period ?? '',
      decadence_period: initialData.decadence_period ?? '',
      hold_possible: initialData.hold_possible ?? false,
      final_disposition: initialData.final_disposition ?? '',
      hold_active: initialData.hold_active ?? false,
      hold_reason: initialData.hold_reason ?? '',
      notes: initialData.notes ?? '',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const fillFromTable = (item: (typeof RETENTION_BASE_TABLE)[0]) => {
    setData((prev) => ({
      ...prev,
      data_type: item.dataType,
      category: item.category,
      retention_period: item.retentionPeriod,
      retention_start_event: item.startEvent,
      legal_basis: item.legalBasis,
      prescription_period: item.prescriptionPeriod ?? '',
      decadence_period: item.decadencePeriod ?? '',
      hold_possible: item.holdPossible,
      final_disposition: item.finalDisposition,
    }))
    setShowBaseTable(false)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.data_type.trim()) errs.data_type = 'Tipo de dado é obrigatório'
    if (!data.category.trim()) errs.category = 'Categoria é obrigatória'
    if (!data.retention_period.trim()) errs.retention_period = 'Prazo de retenção é obrigatório'
    if (!data.retention_start_event.trim())
      errs.retention_start_event = 'Evento inicial é obrigatório'
    if (!data.legal_basis.trim())
      errs.legal_basis = 'Fundamento jurídico é obrigatório'
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
      await saveRetentionDisposal({ ...data, company_id: companyId, id })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = async (formData: FormData) => {
    startDeleting(async () => {
      await deleteRetentionDisposal(formData)
    })
  }

  return (
    <div className="space-y-6">
      {/* Atalho: tabela base */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>
                Use a tabela base de retenção para pré-preencher os campos automaticamente.
              </span>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
              onClick={() => setShowBaseTable((v) => !v)}
            >
              {showBaseTable ? 'Fechar' : 'Ver tabela base'}
            </Button>
          </div>

          {showBaseTable && (
            <div className="mt-3 divide-y divide-blue-200 rounded-lg border border-blue-200 bg-white overflow-hidden">
              {RETENTION_BASE_TABLE.map((item) => (
                <button
                  key={item.dataType}
                  type="button"
                  onClick={() => fillFromTable(item)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">{item.dataType}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.retentionPeriod} · {item.startEvent}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={FileArchive}
            title="Identificação do Dado"
            subtitle="Tipo e categoria do dado pessoal"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="data_type">Tipo de dado *</Label>
            <Input
              id="data_type"
              value={data.data_type}
              onChange={(e) => update('data_type', e.target.value)}
              placeholder="Ex: Documentos Trabalhistas, Dados de Clientes..."
            />
            {errors.data_type && <p className="text-xs text-red-500">{errors.data_type}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={data.category} onValueChange={(v) => update('category', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_DADOS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Política de Retenção */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={BookOpen}
            title="Política de Retenção"
            subtitle="Prazo, evento inicial e fundamento legal"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="retention_period">Prazo de retenção *</Label>
            <Input
              id="retention_period"
              value={data.retention_period}
              onChange={(e) => update('retention_period', e.target.value)}
              placeholder="Ex: 5 anos, 10 anos, 30 dias..."
            />
            {errors.retention_period && (
              <p className="text-xs text-red-500">{errors.retention_period}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Evento inicial *</Label>
            <Select
              value={data.retention_start_event}
              onValueChange={(v) => update('retention_start_event', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o evento que inicia a contagem" />
              </SelectTrigger>
              <SelectContent>
                {EVENTOS_INICIAIS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.retention_start_event && (
              <p className="text-xs text-red-500">{errors.retention_start_event}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="event_date">Data do evento</Label>
              <Input
                id="event_date"
                type="date"
                value={data.event_date}
                onChange={(e) => update('event_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expiration_date">Data de vencimento</Label>
              <Input
                id="expiration_date"
                type="date"
                value={data.expiration_date}
                onChange={(e) => update('expiration_date', e.target.value)}
              />
              <p className="text-xs text-gray-400">Calculada automaticamente quando possível</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fundamento jurídico *</Label>
            <Select
              value={data.legal_basis}
              onValueChange={(v) => update('legal_basis', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fundamento legal" />
              </SelectTrigger>
              <SelectContent>
                {FUNDAMENTOS_JURIDICOS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.legal_basis && (
              <p className="text-xs text-red-500">{errors.legal_basis}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prescription_period">Prazo prescricional</Label>
              <Input
                id="prescription_period"
                value={data.prescription_period}
                onChange={(e) => update('prescription_period', e.target.value)}
                placeholder="Ex: 5 anos"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="decadence_period">Prazo decadencial</Label>
              <Input
                id="decadence_period"
                value={data.decadence_period}
                onChange={(e) => update('decadence_period', e.target.value)}
                placeholder="Ex: 5 anos"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Destinação e Bloqueio */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Lock}
            title="Destinação e Bloqueio"
            subtitle="O que fazer quando o prazo vencer"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Destinação final</Label>
            <Select
              value={data.final_disposition}
              onValueChange={(v) => update('final_disposition', v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="O que fazer com os dados ao fim do prazo" />
              </SelectTrigger>
              <SelectContent>
                {DESTINACOES_FINAIS.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Toggle
            checked={data.hold_possible}
            onChange={(v) => update('hold_possible', v)}
            label="Possibilidade de bloqueio"
            description="Os dados podem ser holdItems antes do descarte (ex.: portabilidade, investigação)"
          />

          {!id && data.hold_possible && (
            <Toggle
              checked={data.hold_active}
              onChange={(v) => update('hold_active', v)}
              label="Bloqueio ativo agora"
              description="Marque se os dados já estão em estado de bloqueio"
            />
          )}

          {data.hold_active && (
            <div className="space-y-1.5">
              <Label htmlFor="hold_reason">Motivo do bloqueio</Label>
              <Textarea
                id="hold_reason"
                value={data.hold_reason}
                onChange={(e) => update('hold_reason', e.target.value)}
                placeholder="Descreva o motivo do bloqueio..."
                rows={2}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção 4: Notas */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Scale} title="Notas e Observações" />
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Informações adicionais, histórico de decisões, observações..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {id && (
          <form action={handleDelete}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Registro'}
            </Button>
          </form>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <Button
            variant="outline"
            onClick={() => router.push('/retention-disposal')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Criar Registro'}
          </Button>
        </div>
      </div>
    </div>
  )
}
