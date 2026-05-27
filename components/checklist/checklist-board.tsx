'use client'

import { useState, useRef } from 'react'
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
  Check,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────

type ChecklistStatus = 'pending' | 'in_progress' | 'completed' | 'not_applicable'

type ItemState = {
  status: ChecklistStatus
  notes?: string
  responsible?: string
  completion_date?: string
}

type ChecklistState = Record<string, ItemState>

// ─── Constantes ───────────────────────────────────────────────────────────

const ICON_MAP: Record<string, any> = {
  Shield, Database, ClipboardCheck, Users, Lock, Truck, GraduationCap, FileSearch,
}

const STATUS_CONFIG: Record<ChecklistStatus, { label: string; icon: any; color: string; bg: string }> = {
  pending:        { label: 'Pendente',      icon: Circle,       color: 'text-gray-400',   bg: 'bg-gray-100 text-gray-700'    },
  in_progress:    { label: 'Em andamento',  icon: Clock,        color: 'text-yellow-500', bg: 'bg-yellow-100 text-yellow-800' },
  completed:      { label: 'Concluído',     icon: CheckCircle2, color: 'text-green-500',  bg: 'bg-green-100 text-green-800'  },
  not_applicable: { label: 'N/A',           icon: MinusCircle,  color: 'text-gray-300',   bg: 'bg-gray-50 text-gray-400'     },
}

const PRIORITY_CONFIG = {
  critical: { label: 'Crítica', variant: 'destructive' as const },
  high:     { label: 'Alta',    variant: 'warning' as const },
  medium:   { label: 'Média',   variant: 'secondary' as const },
  low:      { label: 'Baixa',   variant: 'secondary' as const },
}

// ─── Sub-componentes ──────────────────────────────────────────────────────

function ItemRow({
  item,
  state,
  companyId,
  category,
  onStatusChange,
}: {
  item: ChecklistItem
  state?: ItemState
  companyId: string
  category: string
  onStatusChange: (key: string, status: ChecklistStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const [savingStatus, setSavingStatus] = useState<ChecklistStatus | null>(null)
  const [savingDetails, setSavingDetails] = useState(false)
  const [savedDetails, setSavedDetails] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [form, setForm] = useState<ItemState>({
    status: state?.status ?? 'pending',
    notes: state?.notes ?? '',
    responsible: state?.responsible ?? '',
    completion_date: state?.completion_date ?? '',
  })

  const statusConf = STATUS_CONFIG[form.status]
  const Icon = statusConf.icon

  // Monta e envia o FormData diretamente — sem useTransition para não vazar pending para outros itens
  const persist = async (payload: ItemState) => {
    const fd = new FormData()
    fd.set('company_id', companyId)
    fd.set('item_key', item.key)
    fd.set('category', category)
    fd.set('status', payload.status)
    fd.set('notes', payload.notes ?? '')
    fd.set('responsible', payload.responsible ?? '')
    fd.set('completion_date', payload.completion_date ?? '')
    await atualizarItemChecklist(fd)
  }

  // Clique num botão de status: atualiza imediatamente (otimista) e salva em background
  const handleStatusClick = async (newStatus: ChecklistStatus) => {
    if (savingStatus) return
    const previousStatus = form.status
    setForm(prev => ({ ...prev, status: newStatus }))
    onStatusChange(item.key, newStatus)
    setSavingStatus(newStatus)
    setSaveError(null)
    try {
      await persist({ ...form, status: newStatus })
    } catch (err) {
      // Reverte estado otimista e mostra o erro
      setForm(prev => ({ ...prev, status: previousStatus }))
      onStatusChange(item.key, previousStatus)
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      setSaveError(msg)
      console.error('[checklist] save status failed:', msg)
    } finally {
      setSavingStatus(null)
    }
  }

  // Botão Salvar: grava responsável, data e observações
  const handleSaveDetails = async () => {
    if (savingDetails) return
    setSavingDetails(true)
    setSavedDetails(false)
    setSaveError(null)
    try {
      await persist(form)
      setSavedDetails(true)
      if (savedTimer.current) clearTimeout(savedTimer.current)
      savedTimer.current = setTimeout(() => setSavedDetails(false), 2500)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      setSaveError(msg)
      console.error('[checklist] save details failed:', msg)
    } finally {
      setSavingDetails(false)
    }
  }

  return (
    <div className={`border rounded-lg transition-all ${form.status === 'not_applicable' ? 'opacity-50' : ''}`}>
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 rounded-lg"
        onClick={() => setOpen(prev => !prev)}
      >
        <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${statusConf.color}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className={`text-sm font-medium ${form.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {item.title}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={PRIORITY_CONFIG[item.priority].variant} className="text-xs">
                {PRIORITY_CONFIG[item.priority].label}
              </Badge>
              {item.referencia && (
                <span className="text-xs text-blue-500 font-mono">{item.referencia}</span>
              )}
              {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
          {!open && form.responsible && (
            <p className="text-xs text-gray-400 mt-1">Responsável: {form.responsible}</p>
          )}
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
          {/* Botões de status — cada um salva sozinho ao clicar */}
          <div className="flex flex-wrap gap-2">
            {(Object.keys(STATUS_CONFIG) as ChecklistStatus[]).map(s => {
              const conf = STATUS_CONFIG[s]
              const StatusIcon = conf.icon
              const isSavingThis = savingStatus === s
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStatusClick(s)}
                  disabled={savingStatus !== null}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    form.status === s
                      ? `${conf.bg} border-transparent`
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                  } disabled:opacity-60`}
                >
                  {isSavingThis
                    ? <Clock className="h-3.5 w-3.5 animate-spin" />
                    : <StatusIcon className="h-3.5 w-3.5" />
                  }
                  {conf.label}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Responsável</Label>
              <Input
                value={form.responsible}
                onChange={e => setForm(prev => ({ ...prev, responsible: e.target.value }))}
                placeholder="Nome ou setor"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data de conclusão</Label>
              <Input
                type="date"
                value={form.completion_date}
                onChange={e => setForm(prev => ({ ...prev, completion_date: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Observações</Label>
            <Textarea
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Evidências, links, notas..."
              rows={2}
              className="text-sm"
            />
          </div>

          {saveError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
              ✕ {saveError}
            </p>
          )}

          <div className="flex items-center gap-3">
            <Button size="sm" onClick={handleSaveDetails} disabled={savingDetails}>
              {savingDetails ? 'Salvando...' : 'Salvar'}
            </Button>
            {savedDetails && (
              <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                <Check className="h-3.5 w-3.5" /> Salvo
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────

interface ChecklistBoardProps {
  companyId: string
  initialState: ChecklistState
}

export function ChecklistBoard({ companyId, initialState }: ChecklistBoardProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CHECKLIST.map(c => [c.id, true]))
  )

  // Estado mutável — atualizado quando qualquer item muda de status
  const [state, setState] = useState<ChecklistState>(initialState)

  const handleStatusChange = (key: string, status: ChecklistStatus) => {
    setState(prev => ({ ...prev, [key]: { ...prev[key], status } }))
  }

  const toggleCategory = (id: string) =>
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }))

  const totalItems = CHECKLIST.reduce((acc, c) => acc + c.items.length, 0)
  const completed = CHECKLIST.reduce((acc, c) =>
    acc + c.items.filter(i => state[i.key]?.status === 'completed').length, 0
  )
  const notApplicable = CHECKLIST.reduce((acc, c) =>
    acc + c.items.filter(i => state[i.key]?.status === 'not_applicable').length, 0
  )
  const effective = totalItems - notApplicable
  const percentage = effective > 0 ? Math.round((completed / effective) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Progresso global */}
      <Card>
        <CardContent className="pt-6 pb-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Adequação geral</p>
              <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p><span className="font-medium text-green-600">{completed}</span> concluídos</p>
              <p><span className="font-medium text-gray-900">{effective}</span> aplicáveis</p>
            </div>
          </div>
          <Progress value={percentage} className="h-3" />
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
        const total = cat.items.length
        const done = cat.items.filter(i => state[i.key]?.status === 'completed').length
        const na = cat.items.filter(i => state[i.key]?.status === 'not_applicable').length
        const effectiveCat = total - na
        const pct = effectiveCat > 0 ? Math.round((done / effectiveCat) * 100) : 100
        const isOpen = openCategories[cat.id]

        return (
          <Card key={cat.id}>
            <CardHeader className="pb-0 cursor-pointer" onClick={() => toggleCategory(cat.id)}>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CatIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{cat.label}</p>
                    <p className="text-xs text-gray-500">{done} de {effectiveCat} concluídos {na > 0 ? `· ${na} N/A` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block w-24">
                    <Progress value={pct} className="h-2" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-10 text-right">{pct}%</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            </CardHeader>

            {isOpen && (
              <CardContent className="pt-3 space-y-2">
                {cat.items.map(item => (
                  <ItemRow
                    key={item.key}
                    item={item}
                    state={state[item.key]}
                    companyId={companyId}
                    category={cat.id}
                    onStatusChange={handleStatusChange}
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
