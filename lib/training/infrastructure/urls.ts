const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.serraprivacy.com'

export const CERTIFICATE_VERIFY_PATH = '/certificates/verify'

export function certificateVerificationUrl(code?: string): string {
  const base = `${APP_URL}${CERTIFICATE_VERIFY_PATH}`
  return code ? `${base}?code=${encodeURIComponent(code)}` : base
}
