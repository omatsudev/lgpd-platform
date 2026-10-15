export type CompanyPlan = 'basic' | 'full'

// Módulos liberados no plano básico. Fora dessa lista, a página mostra o
// preview bloqueado (mesmo componente já usado para o papel "collaborator").
// Dashboard e Relatório entram em qualquer plano.
const BASIC_ALLOWED_ROUTES = [
  '/dashboard',
  '/report',
  '/checklist',
  '/inventory',
  '/documents',
  '/settings',
]

export function isModuleAllowedByPlan(
  plan: CompanyPlan | null | undefined,
  pathname: string,
): boolean {
  if (plan !== 'basic') return true
  return BASIC_ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}
