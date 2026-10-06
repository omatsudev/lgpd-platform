import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

// Kill switch de manutenção para o login — liga/desliga via variável de
// ambiente LOGIN_MAINTENANCE_LOCK=true na Vercel (sem precisar de redeploy).
// Enquanto ativo, qualquer tentativa de login (GET /login ou POST
// /api/auth/login) recebe uma página de 504 Gateway Timeout em vez do
// fluxo normal. Atualizar a página depois de desativar a flag já resolve,
// já que o proxy reavalia a flag a cada request.
const GATEWAY_TIMEOUT_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>504 Gateway Time-out</title>
<style>
  body { font-family: Tahoma, Verdana, Arial, sans-serif; color: #141414; background: #fff; margin: 0; padding: 40px; }
  h1 { font-size: 20px; font-weight: normal; border-bottom: 1px solid #c0c0c0; padding-bottom: 10px; }
  p { font-size: 14px; }
  .code { color: #888; font-size: 12px; margin-top: 30px; }
</style>
</head>
<body>
<h1>504 Gateway Time-out</h1>
<p>The server didn't respond in time.</p>
<div class="code">nginx</div>
</body>
</html>`

function isLoginRequest(pathname: string, method: string) {
  if (pathname === '/login') return true
  if (pathname === '/api/auth/login' && method === 'POST') return true
  return false
}

// Exige 2 atualizações de página com erro antes de liberar — fica mais
// parecido com uma instabilidade real se resolvendo sozinha do que um
// interruptor que libera na primeira tentativa.
const ATTEMPT_COOKIE = '_gw_attempt'
const ATTEMPTS_BEFORE_RELEASE = 2

export async function proxy(request: NextRequest) {
  if (
    process.env.LOGIN_MAINTENANCE_LOCK === 'true' &&
    isLoginRequest(request.nextUrl.pathname, request.method)
  ) {
    const attempts = Number(request.cookies.get(ATTEMPT_COOKIE)?.value ?? '0')

    if (attempts < ATTEMPTS_BEFORE_RELEASE) {
      const response = new NextResponse(GATEWAY_TIMEOUT_HTML, {
        status: 504,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      })
      response.cookies.set(ATTEMPT_COOKIE, String(attempts + 1), {
        maxAge: 60 * 10,
        path: '/',
      })
      return response
    }

    const response = await updateSession(request)
    response.cookies.delete(ATTEMPT_COOKIE)
    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
