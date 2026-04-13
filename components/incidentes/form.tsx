'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { salvarIncidente, deletarIncidente, type IncidenteData } from '@/app/actions/incidentes'
import { AlertTriangle, CheckCircle2, Shield, Users, Wrench, Bell } from 'lucide-react'

// ─── Constantes ────────────────────────────────────────────────────────────

const TIPOS = [
  { value: 'vazamento_dados', label: 'Vazamento de Dados' },
  { value: 'acesso_nao_autorizado', label: 'Acesso Não Autorizado' },
  { value: 'perda_dados', label: 'Perda de Dados' },
  { value: 'alteracao_indevida', label: 'Alteração Indevida' },
  { value: 'uso_indevido', label: 'Uso Indevido' },
  { value: 'ransomware', label: 'Ransomware' },
  { value: 'phishing', label: 'Phishing' },
  { value: 'outro', label: 'Outro' },
]

const SEVERIDADES = [
  { value: 'baixa', label: 'Baixa', desc: 'Impacto mínimo, dados não sensíveis, poucos titulares' },
  { value: 'media', label: 'Média', desc: 'Impacto moderado ou dados pessoais comuns' },
  { value: 'alta', label: 'Alta', desc: 'Dados sensíveis ou grande número de titulares afetados' },
  { value: 'critica', label: 'Crítica', desc: 'Dados sensíveis em escala, risco imediato aos titulares' },
]

const STATUS_OPTIONS = [
  { value: 'identificado', label: 'Identificado' },
  { value: 'em_investigacao', label: 'Em Investigação' },
  { value: 'contido', label: 'Contido' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'encerrado', label: 'Encerrado' },
]

const CATEGORIAS_DADOS = [
  { id: 'identificacao_pessoal', label: 'Identificação pessoal' },
  { id: 'dados_governamentais', label: 'Dados governamentais (CPF, RG...)' },
  { id: 'dados_financeiros', label: 'Dados financeiros' },
  { id: 'dados_sensiveis', label: 'Dados sensíveis (saúde, biometria...)' },
  { id: 'dados_eletronicos', label: 'Dados eletrônicos (IP, login...)' },
  { id: 'dados_criancas', label: 'Dados de crianças/adolescentes' },
  { id: 'outros', label: 'Outros' },
]

const severidadeColors: Record<string, string> = {
  baixa: 'border-green-300 bg-green-50 text-green-800',
  media: 'border-yellow-300 bg-yellow-50 text-yellow-800',
  alta: 'border-red-300 bg-red-50 text-red-800',
  critica: 'border-red-500 bg-red-100 text-red-900 font-semibold',
}

// ─── Tipo local ───────────────────────────────────────────────────────────

type FormState = Omit<IncidenteData, 'empresa_id' | 'id'>

function defaultState(): FormState {
  return {
    titulo: '',
    tipo: '',
    severidade: 'media',
    status: 'identificado',
    data_ocorrencia: '',
    data_descoberta: new Date().toISOString().split('T')[0],
    descricao: '',
    dados_afetados: '',
    categorias_dados_afetados: [],
    numero_titulares_afetados: '',
    causa_raiz: '',
    medidas_imediatas: '',
    medidas_corretivas: '',
    responsavel: '',
    notificou_anpd: false,
    data_notificacao_anpd: '',
    protocolo_anpd: '',
    notificou_titulares: false,
    data_notificacao_titulares: '',
  }
}

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

// ─── Componente principal ─────────────────────────────────────────────────

interface IncidenteFormProps {
  empresaId: string
  id?: string
  initialData?: any
}

export function IncidenteForm({ empresaId, id, initialData }: IncidenteFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      titulo: initialData.titulo ?? '',
      tipo: initialData.tipo ?? '',
      severidade: initialData.severidade ?? 'media',
      status: initialData.status ?? 'identificado',
      data_ocorrencia: initialData.data_ocorrencia ?? '',
      data_descoberta: initialData.data_descoberta ?? new Date().toISOString().split('T')[0],
      descricao: initialData.descricao ?? '',
      dados_afetados: initialData.dados_afetados ?? '',
      categorias_dados_afetados: initialData.categorias_dados_afetados ?? [],
      numero_titulares_afetados: initialData.numero_titulares_afetados ?? '',
      causa_raiz: initialData.causa_raiz ?? '',
      medidas_imediatas: initialData.medidas_imediatas ?? '',
      medidas_corretivas: initialData.medidas_corretivas ?? '',
      responsavel: initialData.responsavel ?? '',
      notificou_anpd: initialData.notificou_anpd ?? false,
      data_notificacao_anpd: initialData.data_notificacao_anpd ?? '',
      protocolo_anpd: initialData.protocolo_anpd ?? '',
      notificou_titulares: initialData.notificou_titulares ?? false,
      data_notificacao_titulares: initialData.data_notificacao_titulares ?? '',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const toggleCategoria = (cat: string) => {
    setData(prev => ({
      ...prev,
      categorias_dados_afetados: prev.categorias_dados_afetados.includes(cat)
        ? prev.categorias_dados_afetados.filter(c => c !== cat)
        : [...prev.categorias_dados_afetados, cat],
    }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.titulo.trim()) errs.titulo = 'Título é obrigatório'
    if (!data.tipo) errs.tipo = 'Tipo é obrigatório'
    if (!data.data_descoberta) errs.data_descoberta = 'Data de descoberta é obrigatória'
    if (!data.descricao.trim()) errs.descricao = 'Descrição é obrigatória'
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
      await salvarIncidente({ ...data, empresa_id: empresaId, id })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = async (formData: FormData) => {
    startDeleting(async () => {
      await deletarIncidente(formData)
    })
  }

  const precisaNotificarANPD = data.severidade === 'alta' || data.severidade === 'critica'

  return (
    <div className="space-y-6">
      {/* Alerta para incidentes graves */}
      {precisaNotificarANPD && !data.notificou_anpd && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-start gap-2 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                <span className="font-medium">Notificação obrigatória: </span>
                Incidentes de severidade alta/crítica devem ser comunicados à ANPD em até 3 dias úteis (Art. 48 LGPD).
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={AlertTriangle} title="Identificação do Incidente" subtitle="Informações básicas sobre o incidente" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título do incidente *</Label>
            <Input
              id="titulo"
              value={data.titulo}
              onChange={e => update('titulo', e.target.value)}
              placeholder="Ex: Vazamento de dados de clientes no sistema ERP"
            />
            {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de incidente *</Label>
              <Select value={data.tipo} onValueChange={v => update('tipo', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.tipo && <p className="text-xs text-red-500">{errors.tipo}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={data.status} onValueChange={v => update('status', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Severidade *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEVERIDADES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => update('severidade', s.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    data.severidade === s.value
                      ? severidadeColors[s.value]
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
              <Label htmlFor="data_ocorrencia">Data de ocorrência</Label>
              <Input
                id="data_ocorrencia"
                type="date"
                value={data.data_ocorrencia}
                onChange={e => update('data_ocorrencia', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_descoberta">Data de descoberta *</Label>
              <Input
                id="data_descoberta"
                type="date"
                value={data.data_descoberta}
                onChange={e => update('data_descoberta', e.target.value)}
              />
              {errors.data_descoberta && <p className="text-xs text-red-500">{errors.data_descoberta}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="responsavel">Responsável pela investigação</Label>
            <Input
              id="responsavel"
              value={data.responsavel}
              onChange={e => update('responsavel', e.target.value)}
              placeholder="Nome ou setor responsável"
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Detalhamento */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Shield} title="Detalhamento do Incidente" subtitle="Dados afetados e análise da causa" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição do incidente *</Label>
            <Textarea
              id="descricao"
              value={data.descricao}
              onChange={e => update('descricao', e.target.value)}
              placeholder="Descreva o que aconteceu, como foi detectado e o contexto do incidente..."
              rows={4}
            />
            {errors.descricao && <p className="text-xs text-red-500">{errors.descricao}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Categorias de dados afetados</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CATEGORIAS_DADOS.map(cat => (
                <label key={cat.id} className="flex items-center gap-2 cursor-pointer select-none p-2 rounded border border-transparent hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={data.categorias_dados_afetados.includes(cat.id)}
                    onChange={() => toggleCategoria(cat.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dados_afetados">Dados afetados (descrição)</Label>
              <Textarea
                id="dados_afetados"
                value={data.dados_afetados}
                onChange={e => update('dados_afetados', e.target.value)}
                placeholder="Descreva quais dados foram expostos ou comprometidos..."
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="numero_titulares_afetados">Titulares afetados</Label>
              <Input
                id="numero_titulares_afetados"
                value={data.numero_titulares_afetados}
                onChange={e => update('numero_titulares_afetados', e.target.value)}
                placeholder="Ex: Aproximadamente 500, Desconhecido"
              />
              <Label htmlFor="causa_raiz" className="mt-3 block">Causa raiz</Label>
              <Textarea
                id="causa_raiz"
                value={data.causa_raiz}
                onChange={e => update('causa_raiz', e.target.value)}
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
          <SectionHeader icon={Wrench} title="Resposta ao Incidente" subtitle="Medidas tomadas para contenção e correção" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="medidas_imediatas">Medidas imediatas tomadas</Label>
            <Textarea
              id="medidas_imediatas"
              value={data.medidas_imediatas}
              onChange={e => update('medidas_imediatas', e.target.value)}
              placeholder="O que foi feito imediatamente após descoberta? (bloqueio, isolamento, backup...)"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="medidas_corretivas">Medidas corretivas / preventivas</Label>
            <Textarea
              id="medidas_corretivas"
              value={data.medidas_corretivas}
              onChange={e => update('medidas_corretivas', e.target.value)}
              placeholder="Quais melhorias foram implementadas para evitar recorrência?"
              rows={3}
            />
          </div>
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
          {/* ANPD */}
          <div className="p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Autoridade Nacional de Proteção de Dados (ANPD)</p>
                <p className="text-xs text-gray-500">Prazo: até 3 dias úteis após a descoberta para incidentes graves</p>
              </div>
              {data.notificou_anpd && <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Notificado</Badge>}
            </div>
            <CheckBox
              checked={data.notificou_anpd}
              onChange={v => update('notificou_anpd', v)}
              label="A ANPD foi notificada sobre este incidente"
            />
            {data.notificou_anpd && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="data_notificacao_anpd">Data da notificação</Label>
                  <Input
                    id="data_notificacao_anpd"
                    type="date"
                    value={data.data_notificacao_anpd}
                    onChange={e => update('data_notificacao_anpd', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="protocolo_anpd">Protocolo ANPD</Label>
                  <Input
                    id="protocolo_anpd"
                    value={data.protocolo_anpd}
                    onChange={e => update('protocolo_anpd', e.target.value)}
                    placeholder="Número do protocolo"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Titulares */}
          <div className="p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-gray-900">Titulares dos Dados</p>
                <p className="text-xs text-gray-500">Comunicar quando o incidente puder causar risco ou dano relevante</p>
              </div>
              {data.notificou_titulares && <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Notificados</Badge>}
            </div>
            <CheckBox
              checked={data.notificou_titulares}
              onChange={v => update('notificou_titulares', v)}
              label="Os titulares afetados foram comunicados"
            />
            {data.notificou_titulares && (
              <div className="pt-1">
                <Label htmlFor="data_notificacao_titulares">Data da comunicação aos titulares</Label>
                <Input
                  id="data_notificacao_titulares"
                  type="date"
                  value={data.data_notificacao_titulares}
                  onChange={e => update('data_notificacao_titulares', e.target.value)}
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
          <Button variant="outline" onClick={() => router.push('/incidentes')} disabled={saving}>
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
