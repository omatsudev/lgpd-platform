export type CompanyPlan = 'basico' | 'completo'

// Módulos liberados no plano básico. Fora dessa lista, a página mostra o
// preview bloqueado (mesmo componente usado para o papel "collaborator").
// Dashboard e Relatório entram em qualquer plano.
const BASICO_ALLOWED_ROUTES = [
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
  if (plan !== 'basico') return true
  return BASICO_ALLOWED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}
