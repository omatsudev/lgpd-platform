'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { salvarDocumento, deletarDocumento, type DocumentoData } from '@/app/actions/documentos'
import { FileText, Link2, Settings2, Calendar } from 'lucide-react'

// ─── Constantes ────────────────────────────────────────────────────────────

const TIPOS = [
  { value: 'politica_privacidade', label: 'Política de Privacidade' },
  { value: 'aviso_privacidade', label: 'Aviso de Privacidade' },
  { value: 'politica_seguranca', label: 'Política de Segurança' },
  { value: 'termo_consentimento', label: 'Termo de Consentimento' },
  { value: 'contrato_dpa', label: 'Contrato DPA (Data Processing Agreement)' },
  { value: 'ripd', label: 'RIPD (Relatório de Impacto)' },
  { value: 'procedimento_interno', label: 'Procedimento Interno' },
  { value: 'relatorio_auditoria', label: 'Relatório de Auditoria' },
  { value: 'outro', label: 'Outro' },
]

const STATUS_OPTIONS = [
  { value: 'rascunho', label: 'Rascunho' },
  { value: 'em_revisao', label: 'Em Revisão' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'publicado', label: 'Publicado' },
  { value: 'obsoleto', label: 'Obsoleto' },
]

// ─── Tipos ─────────────────────────────────────────────────────────────────

type FormState = Omit<DocumentoData, 'empresa_id' | 'id'>

function defaultState(): FormState {
  return {
    titulo: '',
    tipo: '',
    descricao: '',
    versao: '1.0',
    conteudo: '',
    arquivo_url: '',
    arquivo_nome: '',
    status: 'rascunho',
    responsavel: '',
    data_aprovacao: '',
    data_revisao: '',
    data_expiracao: '',
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

// ─── Componente principal ─────────────────────────────────────────────────

interface DocumentoFormProps {
  empresaId: string
  id?: string
  initialData?: any
}

export function DocumentoForm({ empresaId, id, initialData }: DocumentoFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState<FormState>(() => {
    if (!initialData) return defaultState()
    return {
      titulo: initialData.titulo ?? '',
      tipo: initialData.tipo ?? '',
      descricao: initialData.descricao ?? '',
      versao: initialData.versao ?? '1.0',
      conteudo: initialData.conteudo ?? '',
      arquivo_url: initialData.arquivo_url ?? '',
      arquivo_nome: initialData.arquivo_nome ?? '',
      status: initialData.status ?? 'rascunho',
      responsavel: initialData.responsavel ?? '',
      data_aprovacao: initialData.data_aprovacao ?? '',
      data_revisao: initialData.data_revisao ?? '',
      data_expiracao: initialData.data_expiracao ?? '',
    }
  })

  const update = (field: keyof FormState, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.titulo.trim()) errs.titulo = 'Título é obrigatório'
    if (!data.tipo) errs.tipo = 'Tipo é obrigatório'
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
      await salvarDocumento({ ...data, empresa_id: empresaId, id })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = async (formData: FormData) => {
    startDeleting(async () => {
      await deletarDocumento(formData)
    })
  }

  return (
    <div className="space-y-6">
      {/* Seção 1: Identificação */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={FileText} title="Identificação" subtitle="Informações básicas do documento" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={data.titulo}
              onChange={e => update('titulo', e.target.value)}
              placeholder="Ex: Política de Privacidade — Versão 2025"
            />
            {errors.titulo && <p className="text-xs text-red-500">{errors.titulo}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Tipo de documento *</Label>
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
              <Label htmlFor="versao">Versão</Label>
              <Input
                id="versao"
                value={data.versao}
                onChange={e => update('versao', e.target.value)}
                placeholder="Ex: 1.0, 2.1"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={data.descricao}
              onChange={e => update('descricao', e.target.value)}
              placeholder="Breve descrição do propósito e escopo do documento..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 2: Conteúdo / Link */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Link2} title="Conteúdo do Documento" subtitle="Texto, link externo ou upload" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="arquivo_url">URL do documento (link externo)</Label>
              <Input
                id="arquivo_url"
                value={data.arquivo_url}
                onChange={e => update('arquivo_url', e.target.value)}
                placeholder="https://..."
                type="url"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="arquivo_nome">Nome do arquivo (referência)</Label>
              <Input
                id="arquivo_nome"
                value={data.arquivo_nome}
                onChange={e => update('arquivo_nome', e.target.value)}
                placeholder="Ex: politica-privacidade-v2.pdf"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conteudo">Conteúdo / Observações</Label>
            <Textarea
              id="conteudo"
              value={data.conteudo}
              onChange={e => update('conteudo', e.target.value)}
              placeholder="Resumo do conteúdo, pontos principais, ou texto completo do documento..."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Seção 3: Controle */}
      <Card>
        <CardHeader className="pb-2">
          <SectionHeader icon={Settings2} title="Controle e Status" subtitle="Fluxo de aprovação e responsabilidade" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável</Label>
              <Input
                id="responsavel"
                value={data.responsavel}
                onChange={e => update('responsavel', e.target.value)}
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
                value={data.data_aprovacao}
                onChange={e => update('data_aprovacao', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_revisao">Próxima revisão</Label>
              <Input
                id="data_revisao"
                type="date"
                value={data.data_revisao}
                onChange={e => update('data_revisao', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="data_expiracao">Data de expiração</Label>
              <Input
                id="data_expiracao"
                type="date"
                value={data.data_expiracao}
                onChange={e => update('data_expiracao', e.target.value)}
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
          <Button variant="outline" onClick={() => router.push('/documentos')} disabled={saving}>
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
