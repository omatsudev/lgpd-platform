'use client'

import { saveQuestion } from '@/app/actions/training-admin'
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
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

type OptionFormData = { id?: string; label: string; feedback: string; correct: boolean }

type QuestionFormData = {
  id?: string
  trackId: string
  kind: 'video_quiz' | 'final_exam'
  videoId: string | null
  moduleId: string | null
  type: 'single_choice' | 'true_false' | 'multiple_choice'
  difficulty: 'easy' | 'medium' | 'hard' | null
  prompt: string
  explanation: string
  options: OptionFormData[]
}

export function QuestionForm({ question: initial }: { question: QuestionFormData }) {
  const [data, setData] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = <K extends keyof QuestionFormData>(field: K, value: QuestionFormData[K]) =>
    setData((prev) => ({ ...prev, [field]: value }))

  const updateOption = (index: number, fields: Partial<OptionFormData>) =>
    setData((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => (i === index ? { ...o, ...fields } : o)),
    }))

  const markCorrect = (index: number) =>
    setData((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => ({
        ...o,
        correct: data.type === 'multiple_choice' ? (i === index ? !o.correct : o.correct) : i === index,
      })),
    }))

  const addOption = () =>
    setData((prev) => ({
      ...prev,
      options: [...prev.options, { label: '', feedback: '', correct: false }],
    }))

  const removeOption = (index: number) =>
    setData((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }))

  const handleSave = async () => {
    setError(null)
    if (!data.prompt.trim()) return setError('Preencha o enunciado da pergunta.')
    if (data.options.length < 2) return setError('A pergunta precisa de pelo menos 2 alternativas.')
    if (data.options.some((o) => !o.label.trim()))
      return setError('Todas as alternativas precisam de um texto.')
    if (!data.options.some((o) => o.correct))
      return setError('Marque pelo menos uma alternativa como correta.')

    setSaving(true)
    try {
      await saveQuestion({
        ...data,
        options: data.options.map((o) => ({
          id: o.id,
          label: o.label,
          feedback: o.feedback || null,
          correct: o.correct,
        })),
      })
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">Enunciado</Label>
        <Textarea
          id="prompt"
          value={data.prompt}
          onChange={(e) => update('prompt', e.target.value)}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select
            value={data.type}
            onValueChange={(v) => update('type', v as QuestionFormData['type'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_choice">Única alternativa correta</SelectItem>
              <SelectItem value="true_false">Verdadeiro ou falso</SelectItem>
              <SelectItem value="multiple_choice">Múltiplas alternativas corretas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {data.kind === 'final_exam' && (
          <div className="space-y-2">
            <Label>Dificuldade</Label>
            <Select
              value={data.difficulty ?? 'medium'}
              onValueChange={(v) => update('difficulty', v as 'easy' | 'medium' | 'hard')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="explanation">Explicação (mostrada após a correção)</Label>
        <Textarea
          id="explanation"
          value={data.explanation}
          onChange={(e) => update('explanation', e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Alternativas</Label>
          <Button variant="outline" size="sm" onClick={addOption} type="button">
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar alternativa
          </Button>
        </div>
        <div className="space-y-2">
          {data.options.map((option, index) => (
            <div
              key={option.id ?? `new-${index}`}
              className="flex items-start gap-2 rounded-lg border border-gray-200 p-3"
            >
              <input
                type={data.type === 'multiple_choice' ? 'checkbox' : 'radio'}
                name="correct-option"
                checked={option.correct}
                onChange={() => markCorrect(index)}
                className="mt-2.5 h-4 w-4"
              />
              <div className="flex-1 space-y-1.5">
                <Input
                  value={option.label}
                  onChange={(e) => updateOption(index, { label: e.target.value })}
                  placeholder="Texto da alternativa"
                />
                <Input
                  value={option.feedback}
                  onChange={(e) => updateOption(index, { feedback: e.target.value })}
                  placeholder="Justificativa específica desta alternativa (opcional)"
                  className="text-xs"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => removeOption(index)}
                className="text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleSave} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar pergunta'}
      </Button>
    </div>
  )
}
