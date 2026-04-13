'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { salvarRisco, deletarRisco, type RiscoData } from '@/app/actions/riscos'
import { AlertTriangle, Target, Wrench } from 'lucide-react'

// ─── Constantes ────────────────────────────────────────────────────────────

const CATEGORIAS = [
  { value: 'privacidade', label: 'Privacidade' },
  { value: 'seguranca', label: 'Segurança da Informação' },
  { value: 'legal', label: 'Legal / Regulatório' },
  { value: 'operacional', label: 'Operacional' },
  { value: 'reputacional', label: 'Reputacional' },
  { value: 'tecnologico', label: 'Tecnológico' },
]

const ORIGENS = [
  { value: 'inventario', label: 'Inventário de Dados' },
  { value: 'incidente', label: 'Incidente de Segurança' },
  { value: 'auditoria', label: 'Auditoria' },
  { value: 'fornecedor', label: 'Fornecedor' },
  { value: 'interno', label: 'Análise Interna' },
  { value: 'outro', label: 'Outro' },
]

const ESTRATEGIAS = [
  { value: 'mitigar', label: 'Mitigar', desc: 'Implementar controles para reduzir probabilidade ou impacto' },
  { value: 'aceitar', label: 'Aceitar', desc: 'Risco dentro do apetite, sem ação adicional' },
  { value: 'transferir', label: 'Transferir', desc: 'Transferir o risco (seguro, terceirização)' },
  { value: 'evitar', label: 'Evitar', desc: 'Cessar a atividade que gera o risco' },
]

const STATUS_OPTIONS = [
  { value: 'identificado', label: 'Identificado' },
  { value: 'em_tratamento', label: 'Em Tratamento' },
  { value: 'monitorando', label: 'Monitorando' },
  { value: 'encerrado', label: 'Encerrado' },
]

const ESCALA = [1, 2, 3, 4, 5]
const PROB_LABELS: Record<number, string> = {
  1: 'Raro', 2: 'Improvável', 3: 'Possível', 4: 'Provável', 5: 'Quase certo',
}
const IMP_LABELS: Record<number, string> = {
  1: 'Insignificante', 2: 'Menor', 3: 'Moderado', 4: 'Maior', 5: 'Catastrófico',
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

function EscalaSelector({
  label, value, onChange, labelMap,
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
        {ESCALA.map(n => (
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
      {value > 0 && (
        <p className="text-xs text-gray-500">{labelMap[value]}</p>
      )}
    </div>
  )
}

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-blue-50 rounded-lg"><Icon className="h-5 w-5 text-blue-600" /></div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// ─── Componente principal ──────────────────────────────────────────────────

type FormState = Omit<RiscoData, 'empresa_id' | 'id'>

function defaultState(): FormState {
  return {
    titulo: '', descricao: '', categoria: '', origem: '',
    inventario_id: '', incidente_id: '',
    probabilidade_inerente: 3, impacto_inerente: 3,
    probabilidade_residual: 0, impacto_residual: 0,
    estrategia: '', plano_acao: '', responsavel: '', prazo: '',
    status: 'identificado',
  }
}

interface RiscoFormProps {
  empresaId: string
  id?: string
  initialData?: any
}

export function RiscoForm({ empresaId, id, initialData }: RiscoFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      titulo: initialData.titulo ?? '',
      descricao: initialData.descricao ?? '',
      categoria: initialData.categoria ?? '',
      origem: initialData.origem ?? '',
      inventario_id: initialData.inventario_id ?? '',
      incidente_id: initialData.incidente_id ?? '',
      probabilidade_inerente: initialData.probabilidade_inerente ?? 3,
      impacto_inerente: initialData.impacto_inerente ?? 3,
      probabilidade_residual: initialData.probabilidade_residual ?? 0,
      impacto_residual: initialData.impacto_residual ?? 0,
      estrategia: initialData.estrategia ?? '',
      plano_acao: initialData.plano_acao ?? '',
      responsavel: initialData.responsavel ?? '',
      prazo: initialData.prazo ?? '',
      status: initialData.status ?? 'identificado',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.titulo.trim()) errs.titulo = 'Título é obrigatório'
    if (!data.categoria) errs.categoria = 'Categoria é obrigatória'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await salvarRisco({ ...data, empresa_id: empresaId, id })
    } catch { setSaving(false) }
  }

  const handleDelete = (formData: FormData) => {
    startDeleting(async () => { await deletarRisco(formData) })
  }

  const scoreInerente = data.probabilidade_inerente * data.impacto_inerente
  const temResidual = data.probabilidade_residual > 0 && data.impacto_residual > 0
  const scoreResidual = temResidual ? data.probabilidade_residual * data.impacto_residual : null

  return (
    <div className="space-y-6">
      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={AlertTriangle} title="Identificação do Risco" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input id="titulo" value={data.titulo} onChange={e => update('titulo', e.target.value)} placeholder="Descreva o risco de forma clara e objetiva" />
            {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" value={data.descricao} onChange={e => update('descricao', e.target.value)} placeholder="Contexto, causa raiz e potenciais consequências..." rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Categoria *</Label>
              <Select value={data.categoria} onValueChange={v => update('categoria', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              {errors.categoria && <p className="text-xs text-red-500">{errors.categoria}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Origem</Label>
              <Select value={data.origem} onValueChange={v => update('origem', v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{ORIGENS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={data.status} onValueChange={v => update('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Avaliação inerente */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Target} title="Avaliação de Risco Inerente" subtitle="Antes de qualquer controle ou medida de mitigação" />
        </CardHeader>
        <CardContent className="space-y-5">
          <EscalaSelector label="Probabilidade" value={data.probabilidade_inerente} onChange={v => update('probabilidade_inerente', v)} labelMap={PROB_LABELS} />
          <EscalaSelector label="Impacto" value={data.impacto_inerente} onChange={v => update('impacto_inerente', v)} labelMap={IMP_LABELS} />

          <div className={`flex items-center justify-between p-4 rounded-lg border ${scoreColor(data.probabilidade_inerente, data.impacto_inerente)}`}>
            <div>
              <p className="text-sm font-medium">Risco Inerente</p>
              <p className="text-xs opacity-75">Score = Probabilidade × Impacto</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{scoreInerente}</p>
              <p className="text-sm font-semibold">{scoreLabel(data.probabilidade_inerente, data.impacto_inerente)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Tratamento */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Wrench} title="Plano de Tratamento" subtitle="Estratégia e ações para reduzir o risco" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Estratégia de tratamento</Label>
            <div className="grid grid-cols-2 gap-2">
              {ESTRATEGIAS.map(e => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => update('estrategia', e.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    data.estrategia === e.value
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <p className="text-sm font-medium">{e.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{e.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plano_acao">Plano de ação</Label>
            <Textarea id="plano_acao" value={data.plano_acao} onChange={e => update('plano_acao', e.target.value)} placeholder="Descreva as ações específicas para tratar este risco..." rows={4} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input id="responsavel" value={data.responsavel} onChange={e => update('responsavel', e.target.value)} placeholder="Nome ou setor responsável" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prazo">Prazo</Label>
              <Input id="prazo" type="date" value={data.prazo} onChange={e => update('prazo', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 4: Risco residual */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Target} title="Avaliação de Risco Residual" subtitle="Após a implementação dos controles (opcional)" />
        </CardHeader>
        <CardContent className="space-y-5">
          <EscalaSelector label="Probabilidade residual" value={data.probabilidade_residual || 0} onChange={v => update('probabilidade_residual', v)} labelMap={{ 0: 'Não avaliado', ...PROB_LABELS }} />
          <EscalaSelector label="Impacto residual" value={data.impacto_residual || 0} onChange={v => update('impacto_residual', v)} labelMap={{ 0: 'Não avaliado', ...IMP_LABELS }} />

          {scoreResidual !== null && (
            <div className={`flex items-center justify-between p-4 rounded-lg border ${scoreColor(data.probabilidade_residual, data.impacto_residual)}`}>
              <div>
                <p className="text-sm font-medium">Risco Residual</p>
                <p className="text-xs opacity-75">Redução de {scoreInerente - scoreResidual} pontos</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{scoreResidual}</p>
                <p className="text-sm font-semibold">{scoreLabel(data.probabilidade_residual, data.impacto_residual)}</p>
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
          <Button variant="outline" onClick={() => router.push('/riscos')} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Registrar Risco'}
          </Button>
        </div>
      </div>
    </div>
  )
}
