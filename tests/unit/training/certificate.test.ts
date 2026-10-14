import {
  certificateExpiry,
  formatWorkload,
  generateVerificationCode,
  isCertificateValid,
  maskLearnerName,
  normalizeVerificationCode,
} from '@/lib/training/domain/certificate'
import { describe, expect, it } from 'vitest'
import { seededRandom } from '../../support/training/seeded-random'

describe('verification code', () => {
  it('has the SP-XXXX-XXXX-XXXX format without ambiguous characters', () => {
    const code = generateVerificationCode(seededRandom(1))
    expect(code).toMatch(/^SP-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
    expect(code.slice(3)).not.toMatch(/[01OIL]/)
  })

  it('normalizes user input and rejects anything else', () => {
    const code = generateVerificationCode(seededRandom(2))
    expect(normalizeVerificationCode(`  ${code.toLowerCase()} `)).toBe(code)
    expect(normalizeVerificationCode('SP-0000-0000-0000')).toBeNull()
    expect(normalizeVerificationCode("'; drop table x")).toBeNull()
  })
})

describe('certificate validity', () => {
  const issuedAt = new Date('2026-10-14T12:00:00Z')

  it('never expires without a configured validity', () => {
    expect(certificateExpiry(issuedAt, null)).toBeNull()
    expect(isCertificateValid(null, new Date('2040-01-01'))).toBe(true)
  })

  it('expires after the configured months', () => {
    const expiresAt = certificateExpiry(issuedAt, 12)!
    expect(expiresAt.toISOString()).toBe('2027-10-14T12:00:00.000Z')
    expect(isCertificateValid(expiresAt, new Date('2027-10-13T00:00:00Z'))).toBe(true)
    expect(isCertificateValid(expiresAt, new Date('2027-10-15T00:00:00Z'))).toBe(false)
  })
})

describe('maskLearnerName', () => {
  it('keeps the first name and initials only', () => {
    expect(maskLearnerName('Ana Paula de Souza')).toBe('Ana P. D. S.')
    expect(maskLearnerName('  Bruno  ')).toBe('Bruno')
    expect(maskLearnerName('')).toBe('')
  })
})

describe('formatWorkload', () => {
  it('formats minutes as hours', () => {
    expect(formatWorkload(45)).toBe('45 min')
    expect(formatWorkload(60)).toBe('1h')
    expect(formatWorkload(90)).toBe('1h30min')
  })
})
