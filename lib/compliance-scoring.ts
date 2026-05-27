// Compliance score formula — weights defined here to be auditable
// Changing a weight requires a deliberate edit here, not buried in a page

export const COMPLIANCE_SCORE_WEIGHTS = {
  CHECKLIST: 0.4,   // Primary indicator — regulatory checklist coverage
  SUPPLIERS: 0.2,   // DPA coverage — processors with signed data processing agreements
  RISKS: 0.2,       // Open critical risks — unmitigated high/critical items
  INCIDENTS: 0.2,   // Active incidents — unresolved breaches/events
} as const

export type ComplianceInput = {
  checklistPercentage: number      // 0-100
  suppliersWithoutDPA: number      // count of suppliers missing DPA
  totalSuppliers: number           // total active suppliers
  criticalRisks: number            // count of critical/unmitigated risks
  openIncidents: number            // count of open/unresolved incidents
}

export function calculateComplianceScore(input: ComplianceInput): number {
  const supplierScore = input.totalSuppliers === 0
    ? 100
    : Math.round(((input.totalSuppliers - input.suppliersWithoutDPA) / input.totalSuppliers) * 100)

  return Math.round(
    input.checklistPercentage * COMPLIANCE_SCORE_WEIGHTS.CHECKLIST +
    supplierScore              * COMPLIANCE_SCORE_WEIGHTS.SUPPLIERS +
    (input.criticalRisks === 0 ? 100 : Math.max(0, 100 - input.criticalRisks * 20)) * COMPLIANCE_SCORE_WEIGHTS.RISKS +
    (input.openIncidents === 0 ? 100 : Math.max(0, 100 - input.openIncidents * 10)) * COMPLIANCE_SCORE_WEIGHTS.INCIDENTS,
  )
}
