'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  salvarRetencaoDescarte,
  deletarRetencaoDescarte,
  type RetencaoDescarteData,
} from '@/app/actions/retencao-descarte'
import {
  EVENTOS_INICIAIS,
  DESTINACOES_FINAIS,
  FUNDAMENTOS_JURIDICOS,
  CATEGORIAS_DADOS,
  RETENCAO_BASE_TABLE,
} from '@/lib/retencao-base-table'
import { FileArchive, Scale, Lock, BookOpen, Sparkles } from 'lucide-react'

// ─── Tipos locais ─────────────────────────────────────────────────────────

type FormState = Omit<RetencaoDescarteData, 'company_id' | 'id'>

function defaultState(): FormState {
  return {
    tipo_dado: '',
    categoria: '',
    prazo_retencao: '',
    evento_inicial: '',
    data_evento: '',
    data_vencimento: '',
    fundamento_juridico: '',
    prazo_prescricional: '',
    prazo_decadencial: '',
    possibilidade_bloqueio: false,
    destinacao_final: '',
    bloqueio_ativo: false,
    motivo_bloqueio: '',
    notas: '',
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) {
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

function Toggle({ checked, onChange, label, description }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description?: string
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <div className="relative mt-0.5">
        <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div
          className={`w-10 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
          onClick={() => onChange(!checked)}
        >
          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
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

interface RetencaoDescarteFormProps {
  companyId: string
  id?: string
  initialData?: any
}

export function RetencaoDescarteForm({ companyId, id, initialData }: RetencaoDescarteFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showBaseTable, setShowBaseTable] = useState(false)

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      tipo_dado: initialData.tipo_dado ?? '',
      categoria: initialData.categoria ?? '',
      prazo_retencao: initialData.prazo_retencao ?? '',
      evento_inicial: initialData.evento_inicial ?? '',
      data_evento: initialData.data_evento ?? '',
      data_vencimento: initialData.data_vencimento ?? '',
      fundamento_juridico: initialData.fundamento_juridico ?? '',
      prazo_prescricional: initialData.prazo_prescricional ?? '',
      prazo_decadencial: initialData.prazo_decadencial ?? '',
      possibilidade_bloqueio: initialData.possibilidade_bloqueio ?? false,
      destinacao_final: initialData.destinacao_final ?? '',
      bloqueio_ativo: initialData.bloqueio_ativo ?? false,
      motivo_bloqueio: initialData.motivo_bloqueio ?? '',
      notas: initialData.notas ?? '',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const preencherDaTabela = (item: typeof RETENCAO_BASE_TABLE[0]) => {
    setData(prev => ({
      ...prev,
      tipo_dado: item.tipo_dado,
      categoria: item.categoria,
      prazo_retencao: item.prazo_retencao,
      evento_inicial: item.evento_inicial,
      fundamento_juridico: item.fundamento_juridico,
      prazo_prescricional: item.prazo_prescricional ?? '',
      prazo_decadencial: item.prazo_decadencial ?? '',
      possibilidade_bloqueio: item.possibilidade_bloqueio,
      destinacao_final: item.destinacao_final,
    }))
    setShowBaseTable(false)
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.tipo_dado.trim()) errs.tipo_dado = 'Tipo de dado é obrigatório'
    if (!data.categoria.trim()) errs.categoria = 'Categoria é obrigatória'
    if (!data.prazo_retencao.trim()) errs.prazo_retencao = 'Prazo de retenção é obrigatório'
    if (!data.evento_inicial.trim()) errs.evento_inicial = 'Evento inicial é obrigatório'
    if (!data.fundamento_juridico.trim()) errs.fundamento_juridico = 'Fundamento jurídico é obrigatório'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await salvarRetencaoDescarte({ ...data, company_id: companyId, id })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = async (formData: FormData) => {
    startDeleting(async () => { await deletarRetencaoDescarte(formData) })
  }

  return (
    <div className="space-y-6">
      {/* Atalho: tabela base */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>Use a tabela base de retenção para pré-preencher os campos automaticamente.</span>
            </div>
            <Button size="sm" variant="outline" className="text-blue-700 border-blue-300 hover:bg-blue-100" onClick={() => setShowBaseTable(v => !v)}>
              {showBaseTable ? 'Fechar' : 'Ver tabela base'}
            </Button>
          </div>

          {showBaseTable && (
            <div className="mt-3 divide-y divide-blue-200 rounded-lg border border-blue-200 bg-white overflow-hidden">
              {RETENCAO_BASE_TABLE.map((item) => (
                <button
                  key={item.tipo_dado}
                  type="button"
                  onClick={() => preencherDaTabela(item)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900">{item.tipo_dado}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {item.prazo_retencao} · {item.evento_inicial}
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
          <SectionHeader icon={FileArchive} title="Identificação do Dado" subtitle="Tipo e categoria do dado pessoal" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tipo_dado">Tipo de dado *</Label>
            <Input
              id="tipo_dado"
              value={data.tipo_dado}
              onChange={e => update('tipo_dado', e.target.value)}
              placeholder="Ex: Documentos Trabalhistas, Dados de Clientes..."
            />
            {errors.tipo_dado && <p className="text-xs text-red-500">{errors.tipo_dado}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categoria *</Label>
            <Select value={data.categoria} onValueChange={v => update('categoria', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIAS_DADOS.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoria && <p className="text-xs text-red-500">{errors.categoria}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Política de Retenção */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={BookOpen} title="Política de Retenção" subtitle="Prazo, evento inicial e fundamento legal" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="prazo_retencao">Prazo de retenção *</Label>
            <Input
              id="prazo_retencao"
              value={data.prazo_retencao}
              onChange={e => update('prazo_retencao', e.target.value)}
              placeholder="Ex: 5 anos, 10 anos, 30 dias..."
            />
            {errors.prazo_retencao && <p className="text-xs text-red-500">{errors.prazo_retencao}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Evento inicial *</Label>
            <Select value={data.evento_inicial} onValueChange={v => update('evento_inicial', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o evento que inicia a contagem" />
              </SelectTrigger>
              <SelectContent>
                {EVENTOS_INICIAIS.map(e => (
                  <SelectItem key={e} value={e}>{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.evento_inicial && <p className="text-xs text-red-500">{errors.evento_inicial}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data_evento">Data do evento</Label>
              <Input id="data_evento" type="date" value={data.data_evento} onChange={e => update('data_evento', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_vencimento">Data de vencimento</Label>
              <Input id="data_vencimento" type="date" value={data.data_vencimento} onChange={e => update('data_vencimento', e.target.value)} />
              <p className="text-xs text-gray-400">Calculada automaticamente quando possível</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Fundamento jurídico *</Label>
            <Select value={data.fundamento_juridico} onValueChange={v => update('fundamento_juridico', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fundamento legal" />
              </SelectTrigger>
              <SelectContent>
                {FUNDAMENTOS_JURIDICOS.map(f => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.fundamento_juridico && <p className="text-xs text-red-500">{errors.fundamento_juridico}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prazo_prescricional">Prazo prescricional</Label>
              <Input id="prazo_prescricional" value={data.prazo_prescricional} onChange={e => update('prazo_prescricional', e.target.value)} placeholder="Ex: 5 anos" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prazo_decadencial">Prazo decadencial</Label>
              <Input id="prazo_decadencial" value={data.prazo_decadencial} onChange={e => update('prazo_decadencial', e.target.value)} placeholder="Ex: 5 anos" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Destinação e Bloqueio */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Lock} title="Destinação e Bloqueio" subtitle="O que fazer quando o prazo vencer" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Destinação final</Label>
            <Select value={data.destinacao_final} onValueChange={v => update('destinacao_final', v)}>
              <SelectTrigger>
                <SelectValue placeholder="O que fazer com os dados ao fim do prazo" />
              </SelectTrigger>
              <SelectContent>
                {DESTINACOES_FINAIS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Toggle
            checked={data.possibilidade_bloqueio}
            onChange={v => update('possibilidade_bloqueio', v)}
            label="Possibilidade de bloqueio"
            description="Os dados podem ser bloqueados antes do descarte (ex.: portabilidade, investigação)"
          />

          {!id && data.possibilidade_bloqueio && (
            <Toggle
              checked={data.bloqueio_ativo}
              onChange={v => update('bloqueio_ativo', v)}
              label="Bloqueio ativo agora"
              description="Marque se os dados já estão em estado de bloqueio"
            />
          )}

          {data.bloqueio_ativo && (
            <div className="space-y-1.5">
              <Label htmlFor="motivo_bloqueio">Motivo do bloqueio</Label>
              <Textarea
                id="motivo_bloqueio"
                value={data.motivo_bloqueio}
                onChange={e => update('motivo_bloqueio', e.target.value)}
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
            value={data.notas}
            onChange={e => update('notas', e.target.value)}
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
          <Button variant="outline" onClick={() => router.push('/retencao-descarte')} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Criar Registro'}
          </Button>
        </div>
      </div>
    </div>
  )
}
