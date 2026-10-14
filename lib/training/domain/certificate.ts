import type { RandomSource } from './random'

// No 0/O or 1/I/L so the code can be read aloud and typed without ambiguity.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_GROUPS = 3
const CODE_GROUP_LENGTH = 4

export function generateVerificationCode(random: RandomSource): string {
  const groups = Array.from({ length: CODE_GROUPS }, () =>
    Array.from(
      { length: CODE_GROUP_LENGTH },
      () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)],
    ).join(''),
  )
  return `SP-${groups.join('-')}`
}

const CODE_PATTERN = new RegExp(`^SP(-[${CODE_ALPHABET}]{${CODE_GROUP_LENGTH}}){${CODE_GROUPS}}$`)

export function normalizeVerificationCode(input: string): string | null {
  const code = input.trim().toUpperCase()
  return CODE_PATTERN.test(code) ? code : null
}

export function certificateExpiry(issuedAt: Date, validityMonths: number | null): Date | null {
  if (validityMonths === null) return null
  const expiresAt = new Date(issuedAt)
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + validityMonths)
  return expiresAt
}

export function isCertificateValid(expiresAt: Date | null, now: Date): boolean {
  return expiresAt === null || expiresAt.getTime() > now.getTime()
}

/**
 * Public verification shows only what proves authenticity: the first name and
 * the initials of the remaining names (e.g. "Maria S. O.").
 */
export function maskLearnerName(fullName: string): string {
  const [firstName, ...otherNames] = fullName.trim().split(/\s+/).filter(Boolean)
  if (!firstName) return ''
  const initials = otherNames.map((name) => `${name[0].toUpperCase()}.`)
  return [firstName, ...initials].join(' ')
}

export function formatWorkload(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60
  if (hours === 0) return `${remainder} min`
  return remainder === 0 ? `${hours}h` : `${hours}h${String(remainder).padStart(2, '0')}min`
}
