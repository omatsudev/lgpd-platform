'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { salvarFinalidade, deletarFinalidade, type FinalidadeData } from '@/app/actions/consentimentos'

const BASES_LEGAIS = [
  'Consentimento do titular',
  'Execução de contrato',
  'Cumprimento de obrigação legal',
  'Legítimo interesse',
  'Proteção da vida',
  'Tutela da saúde',
  'Proteção ao crédito',
]

interface FinalidadeFormProps {
  empresaId: string
  id?: string
  initialData?: any
}

export function FinalidadeForm({ empresaId, id, initialData }: FinalidadeFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState({
    nome: initialData?.nome ?? '',
    descricao: initialData?.descricao ?? '',
    base_legal: initialData?.base_legal ?? 'Consentimento do titular',
    obrigatorio: initialData?.obrigatorio ?? false,
    ativo: initialData?.ativo ?? true,
  })

  const update = (field: string, value: any) =>
    setData(prev => ({ ...prev, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.nome.trim()) errs.nome = 'Nome é obrigatório'
    if (!data.descricao.trim()) errs.descricao = 'Descrição é obrigatória'
    return errs
  }

  const handleSave = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    try {
      await salvarFinalidade({ ...data, empresa_id: empresaId, id } as FinalidadeData)
    } catch { setSaving(false) }
  }

  const handleDelete = (formData: FormData) => {
    startDeleting(async () => { await deletarFinalidade(formData) })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="nome">Nome da finalidade *</Label>
            <Input
              id="nome"
              value={data.nome}
              onChange={e => update('nome', e.target.value)}
              placeholder="Ex: Envio de newsletters, Análise de perfil"
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descricao">Descrição (exibida ao titular) *</Label>
            <Textarea
              id="descricao"
              value={data.descricao}
              onChange={e => update('descricao', e.target.value)}
              placeholder="Descreva de forma clara e simples para que essa finalidade será usada..."
              rows={3}
            />
            {errors.descricao && <p className="text-xs text-red-500">{errors.descricao}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Base legal</Label>
            <Select value={data.base_legal} onValueChange={v => update('base_legal', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASES_LEGAIS.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.obrigatorio}
                onChange={e => update('obrigatorio', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Obrigatório
                <span className="block text-xs text-gray-400">Não pode ser recusado pelo titular</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.ativo}
                onChange={e => update('ativo', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Ativa
                <span className="block text-xs text-gray-400">Exibida nos formulários de consentimento</span>
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between gap-3">
        {id && (
          <form action={handleDelete}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive" size="sm" disabled={deleting}>
              {deleting ? 'Excluindo...' : 'Excluir Finalidade'}
            </Button>
          </form>
        )}
        <div className="flex gap-3 sm:ml-auto">
          <Button variant="outline" onClick={() => router.push('/consentimentos?aba=finalidades')} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : id ? 'Salvar Alterações' : 'Criar Finalidade'}
          </Button>
        </div>
      </div>
    </div>
  )
}
