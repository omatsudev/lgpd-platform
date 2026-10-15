'use client'

import { saveModule } from '@/app/actions/training-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

type ModuleFormData = {
  id?: string
  trackId: string
  title: string
  objective: string
  final_exam_question_count: number
}

export function ModuleForm({ module: initial }: { module: ModuleFormData }) {
  const [data, setData] = useState(initial)
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof ModuleFormData>(field: K, value: ModuleFormData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveModule(data)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título do módulo</Label>
        <Input id="title" value={data.title} onChange={(e) => update('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="objective">Objetivo</Label>
        <Textarea
          id="objective"
          value={data.objective}
          onChange={(e) => update('objective', e.target.value)}
          rows={2}
        />
      </div>
      <div className="space-y-2 max-w-xs">
        <Label htmlFor="final_exam_question_count">
          Quantas questões deste módulo sorteia na avaliação final
        </Label>
        <Input
          id="final_exam_question_count"
          type="number"
          min="0"
          value={data.final_exam_question_count}
          onChange={(e) => update('final_exam_question_count', Number(e.target.value))}
        />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar módulo'}
      </Button>
    </div>
  )
}
