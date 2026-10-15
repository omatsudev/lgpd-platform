'use client'

import { saveVideo } from '@/app/actions/training-admin'
import { Button } from '@/components/ui/button'
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
import { useState } from 'react'

type VideoFormData = {
  id?: string
  moduleId: string
  title: string
  key_message: string
  duration_seconds: number
  video_url: string
  captions_url: string
  transcript: string
  status: 'draft' | 'published'
  min_watch_ratio: number
}

export function VideoForm({ video: initial }: { video: VideoFormData }) {
  const [data, setData] = useState(initial)
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof VideoFormData>(field: K, value: VideoFormData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveVideo(data)
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título do vídeo</Label>
        <Input id="title" value={data.title} onChange={(e) => update('title', e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="key_message">Mensagem-chave (mostrada enquanto não há vídeo hospedado)</Label>
        <Textarea
          id="key_message"
          value={data.key_message}
          onChange={(e) => update('key_message', e.target.value)}
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration_seconds">Duração (segundos)</Label>
          <Input
            id="duration_seconds"
            type="number"
            min="1"
            value={data.duration_seconds}
            onChange={(e) => update('duration_seconds', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_watch_ratio">% mínimo assistido para concluir (0 a 1)</Label>
          <Input
            id="min_watch_ratio"
            type="number"
            step="0.01"
            min="0.01"
            max="1"
            value={data.min_watch_ratio}
            onChange={(e) => update('min_watch_ratio', Number(e.target.value))}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="video_url">URL do vídeo (vazio = vídeo ainda não hospedado)</Label>
        <Input
          id="video_url"
          value={data.video_url}
          onChange={(e) => update('video_url', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="captions_url">URL das legendas (opcional)</Label>
        <Input
          id="captions_url"
          value={data.captions_url}
          onChange={(e) => update('captions_url', e.target.value)}
          placeholder="https://..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="transcript">Transcrição (opcional)</Label>
        <Textarea
          id="transcript"
          value={data.transcript}
          onChange={(e) => update('transcript', e.target.value)}
          rows={4}
        />
      </div>
      <div className="space-y-2 max-w-xs">
        <Label>Status</Label>
        <Select value={data.status} onValueChange={(v) => update('status', v as 'draft' | 'published')}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Rascunho (invisível para colaboradores)</SelectItem>
            <SelectItem value="published">Publicado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar vídeo'}
      </Button>
    </div>
  )
}
