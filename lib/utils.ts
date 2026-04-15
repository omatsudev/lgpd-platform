import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export function generateUniqueLink(companyId: string, employeeId: string) {
  const timestamp = Date.now().toString(36)
  return `${companyId.slice(0, 8)}-${employeeId.slice(0, 8)}-${timestamp}`
}

export const BASE_LEGAL_OPTIONS = [
  'Consentimento do titular',
  'Cumprimento de obrigação legal',
  'Execução de políticas públicas',
  'Estudos por órgão de pesquisa',
  'Execução de contrato',
  'Exercício regular de direitos',
  'Proteção da vida',
  'Tutela da saúde',
  'Legítimo interesse',
  'Proteção ao crédito',
]

export const TIPO_DADO_OPTIONS = [
  'Dados de identificação',
  'Dados financeiros',
  'Dados de saúde',
  'Dados biométricos',
  'Dados de localização',
  'Dados de comportamento',
  'Dados profissionais',
  'Dados de comunicação',
  'Dados sensíveis',
]
