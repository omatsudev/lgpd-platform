import { type NextRequest } from 'next/server'

// MANUTENÇÃO ATIVA — remover este bloco para restaurar o site
export function proxy(_request: NextRequest) {
  return new Response(
    `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>503 Service Unavailable</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #444;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .wrap {
      max-width: 420px;
      text-align: center;
    }
    h1 {
      font-size: 72px;
      font-weight: 200;
      color: #bbb;
      letter-spacing: -2px;
      line-height: 1;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 18px;
      font-weight: 400;
      color: #555;
      margin-bottom: 12px;
    }
    p {
      font-size: 14px;
      color: #888;
      line-height: 1.7;
    }
    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 28px auto;
      width: 48px;
    }
    .retry {
      font-size: 13px;
      color: #aaa;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>503</h1>
    <h2>Service Unavailable</h2>
    <hr />
    <p>The server is temporarily unable to handle this request.</p>
    <p class="retry">Please try again later.</p>
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
