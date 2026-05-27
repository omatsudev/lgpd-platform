// Shared status/type label maps used across multiple pages
// Centralised here to avoid DRY violations — UI strings stay in Portuguese (per project convention)

// ─── Document types ───────────────────────────────────────────────────────────
export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  privacy_policy: 'Política de Privacidade',
  dpa_contract: 'DPA / Contrato',
  security_policy: 'Política de Segurança',
  dpia: 'RIPD / DPIA',
  other: 'Outro',
}

// ─── Incident types ───────────────────────────────────────────────────────────
export const INCIDENT_TYPE_LABELS: Record<string, string> = {
  unauthorized_access: 'Acesso não autorizado',
  data_breach: 'Vazamento de dados',
  phishing: 'Phishing',
  ransomware: 'Ransomware',
  improper_disposal: 'Descarte inadequado',
  other: 'Outro',
}

// ─── Supplier categories ──────────────────────────────────────────────────────
export const SUPPLIER_CATEGORY_LABELS: Record<string, string> = {
  technology: 'Tecnologia',
  accounting: 'Contabilidade',
  marketing: 'Marketing',
  legal: 'Jurídico',
  hr: 'RH',
  health: 'Saúde',
  logistics: 'Logística',
  other: 'Outro',
}

// ─── Supplier access types ────────────────────────────────────────────────────
export const SUPPLIER_ACCESS_TYPE_LABELS: Record<string, string> = {
  controller: 'Controlador',
  processor: 'Operador',
  joint_controller: 'Controlador conjunto',
}

// ─── Data subject request types ───────────────────────────────────────────────
export const DATA_SUBJECT_REQUEST_TYPE_LABELS: Record<string, string> = {
  access: 'Acesso',
  deletion: 'Exclusão',
  correction: 'Correção',
  portability: 'Portabilidade',
  objection: 'Oposição',
  confirmation: 'Confirmação de tratamento',
}

// ─── Risk categories ──────────────────────────────────────────────────────────
export const RISK_CATEGORY_LABELS: Record<string, string> = {
  security: 'Segurança',
  legal: 'Jurídico',
  privacy: 'Privacidade',
  operational: 'Operacional',
  technical: 'Técnico',
}

// ─── Risk strategy ────────────────────────────────────────────────────────────
export const RISK_STRATEGY_LABELS: Record<string, string> = {
  mitigate: 'Mitigar',
  accept: 'Aceitar',
  transfer: 'Transferir',
  avoid: 'Evitar',
}

export const RISK_STRATEGY_VARIANTS: Record<string, 'default' | 'secondary' | 'warning' | 'destructive'> = {
  mitigate: 'default',
  accept: 'secondary',
  transfer: 'warning',
  avoid: 'destructive',
}

// ─── Risk status ──────────────────────────────────────────────────────────────
export const RISK_STATUS_LABELS: Record<string, string> = {
  identified: 'Identificado',
  under_treatment: 'Em tratamento',
  monitoring: 'Monitorando',
  closed: 'Encerrado',
}

// ─── Retention / disposal status ─────────────────────────────────────────────
export const RETENTION_STATUS_LABELS: Record<string, string> = {
  regular: 'Regular',
  expiring_soon: 'Próximo do Vencimento',
  overdue: 'Vencido',
  hold: 'Bloqueado',
}

export const RETENTION_STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'warning' | 'destructive'> = {
  regular: 'default',
  expiring_soon: 'warning',
  overdue: 'destructive',
  hold: 'secondary',
}
