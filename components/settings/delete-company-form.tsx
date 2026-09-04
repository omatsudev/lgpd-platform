'use client'

import { deleteCompany } from '@/app/actions/company-lifecycle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useTransition } from 'react'

export function DeleteCompanyForm({ companyName }: { companyName: string }) {
  const [confirmName, setConfirmName] = useState('')
  const [deactivating, startDeactivating] = useTransition()
  const isMatch = confirmName === companyName

  return (
    <form
      action={(formData: FormData) => {
        startDeactivating(async () => {
          await deleteCompany(formData)
        })
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label>
          Digite <span className="font-mono font-semibold">{companyName}</span> para confirmar
        </Label>
        <Input
          name="confirm_name"
          value={confirmName}
          onChange={(e) => setConfirmName(e.target.value)}
          placeholder={companyName}
          autoComplete="off"
          required
        />
      </div>
      <Button type="submit" variant="destructive" disabled={!isMatch || deactivating}>
        {deactivating ? 'Desativando...' : 'Desativar empresa'}
      </Button>
    </form>
  )
}
