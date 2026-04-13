'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { revogarConsentimento } from '@/app/actions/consentimentos'

export function RevogarForm({ id }: { id: string }) {
  const [aberto, setAberto] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await revogarConsentimento(formData)
    })
  }

  if (!aberto) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setAberto(true)}>
        Revogar Consentimento
      </Button>
    )
  }

  return (
    <Card className="border-red-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-red-700">Revogar Consentimento</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <input type="hidden" name="id" value={id} />
          <div className="space-y-1.5">
            <label className="text-sm text-gray-700">Motivo da revogação (opcional)</label>
            <Textarea
              name="motivo"
              placeholder="Ex: Solicitação do titular via e-mail"
              rows={2}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={pending}>
              {pending ? 'Revogando...' : 'Confirmar Revogação'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
