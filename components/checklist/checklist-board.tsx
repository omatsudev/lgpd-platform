'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { atualizarItemChecklist } from '@/app/actions/checklist'
import { CHECKLIST, type ChecklistItem } from '@/lib/checklist-items'
import {
  CheckCircle2, Circle, Clock, MinusCircle, ChevronDown, ChevronUp,
  Shield, Database, ClipboardCheck, Users, Lock, Truck, GraduationCap, FileSearch,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────

type StatusItem = {
  status: 'pendente' | 'em_andamento' | 'concluido' | 'nao_aplicavel'
  observacao?: string
  responsavel?: string
  data_conclusao?: string
}

type EstadoChecklist = Record<string, StatusItem>

// ─── Constantes ───────────────────────────────────────────────────────────

const ICON_MAP: Record<string, any> = {
  Shield, Database, ClipboardCheck, Users, Lock, Truck, GraduationCap, FileSearch,
}

const STATUS_CONFIG = {
  pendente:      { label: 'Pendente',      icon: Circle,       color: 'text-gray-400',  bg: 'bg-gray-100  text-gray-700'  },
  em_andamento:  { label: 'Em andamento',  icon: Clock,        color: 'text-yellow-500', bg: 'bg-yellow-100 text-yellow-800' },
  concluido:     { label: 'Concluído',     icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 text-green-800' },
  nao_aplicavel: { label: 'N/A',           icon: MinusCircle,  color: 'text-gray-300',  bg: 'bg-gray-50   text-gray-400'  },
}

const PRIORIDADE_CONFIG = {
  critica: { label: 'Crítica', variant: 'destructive' as const },
  alta:    { label: 'Alta',    variant: 'warning' as const },
  media:   { label: 'Média',   variant: 'secondary' as const },
  baixa:   { label: 'Baixa',   variant: 'secondary' as const },
}

// ─── Sub-componentes ──────────────────────────────────────────────────────

function ItemRow({
  item,
  estado,
  empresaId,
  categoria,
}: {
  item: ChecklistItem
  estado?: StatusItem
  empresaId: string
  categoria: string
}) {
  const [aberto, setAberto] = useState(false)
  const [pending, startTransition] = useTransition()
  const [form, setForm] = useState<StatusItem>({
    status: estado?.status ?? 'pendente',
    observacao: estado?.observacao ?? '',
    responsavel: estado?.responsavel ?? '',
    data_conclusao: estado?.data_conclusao ?? '',
  })

  const statusConf = STATUS_CONFIG[form.status]
  const Icon = statusConf.icon

  const handleSave = (novoStatus?: StatusItem['status']) => {
    const dados = novoStatus ? { ...form, status: novoStatus } : form
    if (novoStatus) setForm(prev => ({ ...prev, status: novoStatus }))

    const fd = new FormData()
    fd.set('empresa_id', empresaId)
    fd.set('item_key', item.key)
    fd.set('categoria', categoria)
    fd.set('status', dados.status)
    fd.set('observacao', dados.observacao ?? '')
    fd.set('responsavel', dados.responsavel ?? '')
    fd.set('data_conclusao', dados.data_conclusao ?? '')

    startTransition(() => atualizarItemChecklist(fd))
  }

  return (
    <div className={`border rounded-lg transition-all ${form.status === 'nao_aplicavel' ? 'opacity-50' : ''}`}>
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 rounded-lg"
        onClick={() => setAberto(prev => !prev)}
      >
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${statusConf.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className={`text-sm font-medium ${form.status === 'concluido' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {item.titulo}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={PRIORIDADE_CONFIG[item.prioridade].variant} className="text-xs">
                {PRIORIDADE_CONFIG[item.prioridade].label}
              </Badge>
              {item.referencia && (
                <span className="text-xs text-blue-500 font-mono">{item.referencia}</span>
              )}
              {aberto ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{item.descricao}</p>
          {!aberto && form.responsavel && (
            <p className="text-xs text-gray-400 mt-1">Responsável: {form.responsavel}</p>
          )}
        </div>
      </div>

      {aberto && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Botões de status rápido */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>).map(s => {
              const conf = STATUS_CONFIG[s]
              const StatusIcon = conf.icon
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSave(s)}
                  disabled={pending}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.status === s
                      ? `${conf.bg} border-transparent`
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />
                  {conf.label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Responsável</Label>
              <Input
                value={form.responsavel}
                onChange={e => setForm(prev => ({ ...prev, responsavel: e.target.value }))}
                placeholder="Nome ou setor"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data de conclusão</Label>
              <Input
                type="date"
                value={form.data_conclusao}
                onChange={e => setForm(prev => ({ ...prev, data_conclusao: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={form.observacao}
              onChange={e => setForm(prev => ({ ...prev, observacao: e.target.value }))}
              placeholder="Evidências, links, notas..."
              rows={2}
              className="text-sm"
            />
          </div>

          <Button size="sm" onClick={() => handleSave()} disabled={pending}>
            {pending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────

interface ChecklistBoardProps {
  empresaId: string
  estadoInicial: EstadoChecklist
}

export function ChecklistBoard({ empresaId, estadoInicial }: ChecklistBoardProps) {
  const [categoriasAbertas, setCategoriasAbertas] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHECKLIST.map(c => [c.id, true]))
  )

  const [estado] = useState<EstadoChecklist>(estadoInicial)

  const toggleCategoria = (id: string) =>
    setCategoriasAbertas(prev => ({ ...prev, [id]: !prev[id] }))

  // Calcula progresso global
  const totalItens = CHECKLIST.reduce((acc, c) => acc + c.itens.length, 0)
  const concluidos = CHECKLIST.reduce((acc, c) =>
    acc + c.itens.filter(i => estado[i.key]?.status === 'concluido').length, 0
  )
  const naoAplicaveis = CHECKLIST.reduce((acc, c) =>
    acc + c.itens.filter(i => estado[i.key]?.status === 'nao_aplicavel').length, 0
  )
  const efetivos = totalItens - naoAplicaveis
  const percentual = efetivos > 0 ? Math.round((concluidos / efetivos) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Progresso global */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Adequação geral</p>
              <p className="text-3xl font-bold text-gray-900">{percentual}%</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p><span className="font-medium text-green-600">{concluidos}</span> concluídos</p>
              <p><span className="font-medium text-gray-900">{efetivos}</span> aplicáveis</p>
            </div>
          </div>
          <Progress value={percentual} className="h-3" />
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-green-500" /> Concluído</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-yellow-500" /> Em andamento</span>
            <span className="flex items-center gap-1"><Circle className="h-3 w-3" /> Pendente</span>
            <span className="flex items-center gap-1"><MinusCircle className="h-3 w-3" /> N/A</span>
          </div>
        </CardContent>
      </Card>

      {/* Categorias */}
      {CHECKLIST.map(cat => {
        const CatIcon = ICON_MAP[cat.icon] ?? Shield
        const total = cat.itens.length
        const done = cat.itens.filter(i => estado[i.key]?.status === 'concluido').length
        const na = cat.itens.filter(i => estado[i.key]?.status === 'nao_aplicavel').length
        const efetivoCat = total - na
        const pct = efetivoCat > 0 ? Math.round((done / efetivoCat) * 100) : 100
        const aberto = categoriasAbertas[cat.id]

        return (
          <Card key={cat.id}>
            <CardHeader
              className="pb-0 cursor-pointer"
              onClick={() => toggleCategoria(cat.id)}
            >
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CatIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-500">{done} de {efetivoCat} concluídos {na > 0 ? `· ${na} N/A` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24">
                    <Progress value={pct} className="h-2" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-10 text-right">{pct}%</span>
                  {aberto ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            </CardHeader>

            {aberto && (
              <CardContent className="pt-3 space-y-2">
                {cat.itens.map(item => (
                  <ItemRow
                    key={item.key}
                    item={item}
                    estado={estado[item.key]}
                    empresaId={empresaId}
                    categoria={cat.id}
                  />
                ))}
              </CardContent>
            )}
          </Card>
        )
      })}
    </div>
  )
}
