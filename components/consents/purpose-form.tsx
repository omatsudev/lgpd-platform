'use client'

import { deletePurpose, savePurpose } from '@/app/actions/consents'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

const BASES_LEGAIS = [
  'Consentimento do titular',
  'Execução de contrato',
  'Cumprimento de obrigação legal',
  'Legítimo interesse',
  'Proteção da vida',
  'Tutela da saúde',
  'Proteção ao crédito',
]

interface PurposeFormProps {
  companyId: string
  id?: string
  initialData?: any
}

export function PurposeForm({ companyId, id, initialData }: PurposeFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [deleting, startDeleting] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [data, setData] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    legal_basis: initialData?.legal_basis ?? 'Consentimento do titular',
    required: initialData?.required ?? false,
    active: initialData?.active ?? true,
  })

  const update = (field: string, value: any) => setData((prev) => ({ ...prev, [field]: value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!data.name.trim()) errs.name = 'Nome é obrigatório'
    if (!data.description.trim()) errs.description = 'Descrição é obrigatória'
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
      await savePurpose({
        id,
        company_id: companyId,
        name: data.name,
        description: data.description,
        legal_basis: data.legal_basis,
        required: data.required,
        active: data.active,
      })
    } catch {
      setSaving(false)
    }
  }

  const handleDelete = (formData: FormData) => {
    startDeleting(async () => {
      await deletePurpose(formData)
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome da finalidade *</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ex: Envio de newsletters, Análise de perfil"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição (exibida ao titular) *</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => update('description', e.target.value)}
              placeholder="Descreva de forma clara e simples para que essa finalidade será usada..."
              rows={3}
            />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Base legal</Label>
            <Select value={data.legal_basis} onValueChange={(v) => update('legal_basis', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASES_LEGAIS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.required}
                onChange={(e) => update('required', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Obrigatório
                <span className="block text-xs text-gray-400">
                  Não pode ser recusado pelo titular
                </span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.active}
                onChange={(e) => update('active', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                Ativa
                <span className="block text-xs text-gray-400">
                  Exibida nos formulários de consentimento
                </span>
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
          <Button
            variant="outline"
            onClick={() => router.push('/consents?tab=purposes')}
            disabled={saving}
          >
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
