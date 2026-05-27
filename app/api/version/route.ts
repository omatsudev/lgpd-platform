import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

// Todos injetados em build time via next.config.ts
const VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0'
const COMMIT =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
  'local'
const BUILD_AT = process.env.NEXT_PUBLIC_BUILD_TIME ?? new Date().toISOString()

export function GET() {
  return NextResponse.json({
    app: 'Serra Privacy',
    version: VERSION,
    commit: COMMIT,
    buildAt: BUILD_AT,
  })
}
