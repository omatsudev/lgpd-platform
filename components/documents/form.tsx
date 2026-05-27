'use client'

import { deleteDocument, saveDocument } from '@/app/actions/documents'
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
import { Calendar, FileText, Link2, Settings2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

// ─── Constantes ────────────────────────────────────────────────────────────

const TIPOS = [
  { value: 'privacy_policy', label: 'Política de Privacidade' },
  { value: 'privacy_notice', label: 'Aviso de Privacidade' },
  { value: 'security_policy', label: 'Política de Segurança' },
  { value: 'consent_form', label: 'Termo de Consentimento' },
  { value: 'dpa_contract', label: 'Contrato DPA (Data Processing Agreement)' },
  { value: 'dpia', label: 'RIPD (Relatório de Impacto)' },
  { value: 'internal_procedure', label: 'Procedimento Interno' },
  { value: 'audit_report', label: 'Relatório de Auditoria' },
  { value: 'other', label: 'Outro' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'under_review', label: 'Em Revisão' },
  { value: 'approved', label: 'Aprovado' },
  { value: 'published', label: 'Publicado' },
  { value: 'obsolete', label: 'Obsoleto' },
]

// ─── Tipos ─────────────────────────────────────────────────────────────────

type FormState = {
  title: string
  type: string
  description: string
  version: string
  content: string
  file_url: string
  file_name: string
  status: string
  responsible: string
  approval_date: string
  review_date: string
  expiration_date: string
}

function defaultState(): FormState {
  return {
    title: '',
    type: '',
    description: '',
    version: '1.0',
    content: '',
    file_url: '',
    file_name: '',
    status: 'draft',
    responsible: '',
    approval_date: '',
    review_date: '',
    expiration_date: '',
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

// ─── Componente principal ─────────────────────────────────────────────────

interface DocumentoFormProps {
  companyId: string
  id?: string
  initialData?: any
}

export function DocumentoForm({ companyId, id, initialData }: DocumentoFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      title: initialData.title ?? '',
      type: initialData.type ?? '',
      description: initialData.description ?? '',
      version: initialData.version ?? '1.0',
      content: initialData.content ?? '',
      file_url: initialData.file_url ?? '',
      file_name: initialData.file_name ?? '',
      status: initialData.status ?? 'draft',
      responsible: initialData.responsible ?? '',
      approval_date: initialData.approval_date ?? '',
      review_date: initialData.review_date ?? '',
      expiration_date: initialData.expiration_date ?? '',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.title.trim()) errs.title = 'Título é obrigatório'
    if (!data.type) errs.type = 'Tipo é obrigatório'
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
      await saveDocument({
        id,
        company_id: companyId,
        title: data.title,
        type: data.type,
        description: data.description,
        version: data.version,
        content: data.content,
        file_url: data.file_url,
        file_name: data.file_name,
        status: data.status,
        responsible: data.responsible,
        approval_date: data.approval_date,
        review_date: data.review_date,
        expiration_date: data.expiration_date,
      })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = async (formData: FormData) => {
    startDeleting(async () => {
      await deleteDocument(formData)
    })
  }

  return (
    <div className="space-y-6">
      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={FileText}
            title="Identificação"
            subtitle="Informações básicas do documento"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Ex: Política de Privacidade — Versão 2025"
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de documento *</Label>
              <Select value={data.type} onValueChange={(v) => update('type', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-red-500">{errors.type}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="versao">Versão</Label>
              <Input
                id="versao"
                value={data.version}
                onChange={(e) => update('version', e.target.value)}
                placeholder="Ex: 1.0, 2.1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={data.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Breve descrição do propósito e escopo do documento..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Conteúdo / Link */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Link2}
            title="Conteúdo do Documento"
            subtitle="Texto, link externo ou upload"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="arquivo_url">URL do documento (link externo)</Label>
              <Input
                id="arquivo_url"
                value={data.file_url}
                onChange={(e) => update('file_url', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="arquivo_nome">Nome do arquivo (referência)</Label>
              <Input
                id="arquivo_nome"
                value={data.file_name}
                onChange={(e) => update('file_name', e.target.value)}
                placeholder="Ex: politica-privacidade-v2.pdf"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conteudo">Conteúdo / Observações</Label>
            <Textarea
              id="conteudo"
              value={data.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Resumo do conteúdo, pontos principais, ou texto completo do documento..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Controle */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader
            icon={Settings2}
            title="Controle e Status"
            subtitle="Fluxo de aprovação e responsabilidade"
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={data.responsible}
                onChange={(e) => update('responsible', e.target.value)}
                placeholder="Nome ou setor responsável"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção 4: Datas */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Calendar} title="Datas" subtitle="Aprovação, revisão e expiração" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="data_aprovacao">Data de aprovação</Label>
              <Input
                id="data_aprovacao"
                type="date"
                value={data.approval_date}
                onChange={(e) => update('approval_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_revisao">Próxima revisão</Label>
              <Input
                id="data_revisao"
                type="date"
                value={data.review_date}
                onChange={(e) => update('review_date', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_expiracao">Data de expiração</Label>
              <Input
                id="data_expiracao"
                type="date"
                value={data.expiration_date}
                onChange={(e) => update('expiration_date', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {id && (
          <form action={handleDelete}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Documento'}
            </Button>
          </form>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <Button variant="outline" onClick={() => router.push('/documents')} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Criar Documento'}
          </Button>
        </div>
      </div>
    </div>
  )
}
