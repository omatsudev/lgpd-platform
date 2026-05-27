// Scoring logic for risk management — LGPD risk matrix
// Thresholds based on probability × impact scale (1-5 × 1-5 = 1-25)

export const RISK_THRESHOLDS = {
  CRITICAL: 15, // prob × impact ≥ 15
  HIGH: 9,      // prob × impact ≥ 9
  MEDIUM: 4,    // prob × impact ≥ 4
  // < 4 = low
} as const

export const RISK_LEVEL_LABELS: Record<string, string> = {
  critical: 'Crítico',
  high: 'Alto',
  medium: 'Médio',
  low: 'Baixo',
}

export const RISK_LEVEL_VARIANTS: Record<string, 'destructive' | 'warning' | 'secondary' | 'default'> = {
  critical: 'destructive',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
}

export function calculateRiskLevel(probability: number, impact: number): 'critical' | 'high' | 'medium' | 'low' {
  const score = probability * impact
  if (score >= RISK_THRESHOLDS.CRITICAL) return 'critical'
  if (score >= RISK_THRESHOLDS.HIGH) return 'high'
  if (score >= RISK_THRESHOLDS.MEDIUM) return 'medium'
  return 'low'
}
