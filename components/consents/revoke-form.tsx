'use client'

import { revokeConsent } from '@/app/actions/consents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useState, useTransition } from 'react'

export function RevokeForm({ id }: { id: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await revokeConsent(formData)
    })
  }

  if (!isOpen) {
    return (
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)}>
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
            <Textarea name="motivo" placeholder="Ex: Solicitação do titular via e-mail" rows={2} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="destructive" size="sm" disabled={pending}>
              {pending ? 'Revogando...' : 'Confirmar Revogação'}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
