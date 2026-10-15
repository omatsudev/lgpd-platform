import type { ModuleStatus, VideoStatus } from '@/lib/training/domain/progression'

export const MODULE_STATUS_LABELS: Record<ModuleStatus, string> = {
  locked: 'Bloqueado',
  available: 'Disponível',
  in_progress: 'Em andamento',
  completed: 'Concluído',
}

export const VIDEO_STATUS_LABELS: Record<VideoStatus, string> = {
  locked: 'Bloqueado',
  available: 'Disponível',
  in_progress: 'Em andamento',
  quiz_pending: 'Quiz pendente',
  completed: 'Concluído',
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  if (minutes === 0) return `${remainder}s`
  return remainder === 0 ? `${minutes}min` : `${minutes}min${String(remainder).padStart(2, '0')}s`
}

export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}
