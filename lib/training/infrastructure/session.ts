import 'server-only'

import { getUserCompany } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import type { LearnerContext } from '../application/learner-context'

/** Roles that follow the company's training results (the spec's "gestor"). */
const MANAGER_ROLES = new Set(['admin', 'company', 'dpo'])

export function isTrainingManager(role: string | null | undefined): boolean {
  return role != null && MANAGER_ROLES.has(role)
}

// O conteúdo da trilha (módulos, vídeos, perguntas) é global — compartilhado
// por todas as empresas. Por enquanto só a Serra Privacy tem acesso ao módulo
// de treinamentos (trainings_early_access), então restringe a edição de
// conteúdo a ela, e não a qualquer empresa que venha a ganhar early access no
// futuro (o que daria a qualquer gestor edição sobre a trilha de todo mundo).
const SERRA_PRIVACY_COMPANY_ID = '87a2b5b7-d4b2-4f52-9d7a-7703f74e2860'

export function isTrainingContentAdmin(
  companyId: string | null | undefined,
  role: string | null | undefined,
): boolean {
  return companyId === SERRA_PRIVACY_COMPANY_ID && isTrainingManager(role)
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
