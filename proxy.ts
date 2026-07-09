import { type NextRequest } from 'next/server'

// MANUTENÇÃO ATIVA — remover este bloco para restaurar o site
export function proxy(_request: NextRequest) {
  return new Response(
    `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Em manutenção — Serra Privacy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #0B1B3D;
      color: #B7C2DA;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 24px;
    }
    .wrap { max-width: 480px; }
    .logo {
      font-size: 22px;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.02em;
      margin-bottom: 40px;
    }
    .icon {
      width: 64px;
      height: 64px;
      background: rgba(37,99,235,0.15);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 28px;
    }
    h1 {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      font-size: 16px;
      line-height: 1.7;
      color: #94A3B8;
      margin-bottom: 36px;
    }
    a {
      display: inline-block;
      color: #B7C2DA;
      font-size: 14px;
      text-decoration: none;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      padding-bottom: 2px;
    }
    .badge {
      display: inline-block;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 28px;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="logo">Serra Privacy</div>
    <div class="badge">503 · Serviço Indisponível</div>
    <div class="icon">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
        <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z"/>
      </svg>
    </div>
    <h1>Site em manutenção</h1>
    <p>Estamos realizando melhorias na plataforma.<br>Voltamos em breve.</p>
    <a href="mailto:serralgpd@serraprivacy.com.br">serralgpd@serraprivacy.com.br</a>
  </div>
</body>
</html>`,
    {
      status: 503,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Retry-After': '3600',
      },
    }
  )
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

// CÓDIGO ORIGINAL — descomentar quando quiser restaurar o site:
// import { updateSession } from '@/lib/supabase/middleware'
// export async function proxy(request: NextRequest) {
//   return await updateSession(request)
// }
