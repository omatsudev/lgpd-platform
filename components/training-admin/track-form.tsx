'use client'

import { saveTrack } from '@/app/actions/training-admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

type TrackFormData = {
  id: string
  title: string
  description: string
  video_quiz_pass_ratio: number
  final_exam_pass_ratio: number
  final_exam_max_attempts: number | null
  workload_minutes: number
  certificate_validity_months: number | null
}

export function TrackForm({ track }: { track: TrackFormData }) {
  const [data, setData] = useState(track)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const update = <K extends keyof TrackFormData>(field: K, value: TrackFormData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await saveTrack(data)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título da trilha</Label>
        <Input id="title" value={data.title} onChange={(e) => update('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={data.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="video_quiz_pass_ratio">Nota de corte do quiz por vídeo (0 a 1)</Label>
          <Input
            id="video_quiz_pass_ratio"
            type="number"
            step="0.01"
            min="0.01"
            max="1"
            value={data.video_quiz_pass_ratio}
            onChange={(e) => update('video_quiz_pass_ratio', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="final_exam_pass_ratio">Nota de corte da avaliação final (0 a 1)</Label>
          <Input
            id="final_exam_pass_ratio"
            type="number"
            step="0.01"
            min="0.01"
            max="1"
            value={data.final_exam_pass_ratio}
            onChange={(e) => update('final_exam_pass_ratio', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workload_minutes">Carga horária (minutos)</Label>
          <Input
            id="workload_minutes"
            type="number"
            min="1"
            value={data.workload_minutes}
            onChange={(e) => update('workload_minutes', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="final_exam_max_attempts">
            Máx. de tentativas na avaliação final (vazio = ilimitado)
          </Label>
          <Input
            id="final_exam_max_attempts"
            type="number"
            min="1"
            value={data.final_exam_max_attempts ?? ''}
            onChange={(e) =>
              update('final_exam_max_attempts', e.target.value ? Number(e.target.value) : null)
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="certificate_validity_months">
            Validade do certificado em meses (vazio = sem validade)
          </Label>
          <Input
            id="certificate_validity_months"
            type="number"
            min="1"
            value={data.certificate_validity_months ?? ''}
            onChange={(e) =>
              update(
                'certificate_validity_months',
                e.target.value ? Number(e.target.value) : null,
              )
            }
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar configurações da trilha'}
        </Button>
        {saved && <span className="text-sm text-green-600">Salvo.</span>}
      </div>
    </div>
  )
}
