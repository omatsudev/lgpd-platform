import 'server-only'

import { getUserCompany } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import type { LearnerContext } from '../application/learner-context'

/** Roles that follow the company's training results (the spec's "gestor"). */
const MANAGER_ROLES = new Set(['admin', 'company', 'dpo'])

export function isTrainingManager(role: string | null | undefined): boolean {
  return role != null && MANAGER_ROLES.has(role)
}

export async function requireLearnerContext(): Promise<LearnerContext> {
  const { user, company } = await getUserCompany()
  if (!user) redirect('/login')
  if (!company) redirect('/dashboard')

  const name = (user.user_metadata?.name as string | undefined)?.trim()
  return {
    userId: user.id,
    email: user.email ?? '',
    name: name || user.email || 'Colaborador',
    companyId: company.id,
    companyName: company.name,
  }
}
