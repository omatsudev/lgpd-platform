export const COLLABORATOR_FULL_ACCESS_ROUTES = ['/dashboard', '/report', '/settings']

export function isCollaborator(role: string | null | undefined): boolean {
  return role === 'collaborator'
}

export function hasFullAccess(role: string | null | undefined, pathname: string): boolean {
  if (!isCollaborator(role)) return true
  return COLLABORATOR_FULL_ACCESS_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}
