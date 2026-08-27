import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Temporary lock requested by user — block all login attempts until removed.
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/login' && request.method === 'POST') {
    return NextResponse.redirect(new URL('/login?error=invalid_credentials', request.url), {
      status: 303,
    })
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
