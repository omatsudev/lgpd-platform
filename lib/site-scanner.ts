// Scanner de conformidade LGPD para sites
// Analisa headers HTTP, HTML e scripts detectados

export type Cookie = {
  nome: string
  valor?: string
  dominio?: string
  path?: string
  expiracao?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: string
  categoria: 'necessario' | 'funcional' | 'analitico' | 'marketing' | 'desconhecido'
}

export type Tecnologia = {
  nome: string
  categoria: 'analytics' | 'advertising' | 'social' | 'cms' | 'framework' | 'chat' | 'outro'
  risco: 'alto' | 'medio' | 'baixo'
  descricao: string
}

export type Problema = {
  nivel: 'critico' | 'alto' | 'medio' | 'baixo'
  titulo: string
  descricao: string
}

export type Recomendacao = {
  titulo: string
  descricao: string
}

export type ScanResult = {
  cookies: Cookie[]
  tecnologias: Tecnologia[]
  tem_banner_cookies: boolean
  tem_politica_privacidade: boolean
  url_politica_privacidade: string | null
  score_conformidade: number
  problemas: Problema[]
  recomendacoes: Recomendacao[]
}

// ─── Mapa de tecnologias conhecidas ──────────────────────────────────────

const TECH_SIGNATURES: Array<{
  pattern: RegExp
  tech: Omit<Tecnologia, never>
}> = [
  { pattern: /google-analytics\.com|gtag|ga\s*\(|_ga\b/i, tech: { nome: 'Google Analytics', categoria: 'analytics', risco: 'alto', descricao: 'Rastreamento de comportamento via Google' } },
  { pattern: /googletagmanager\.com|GTM-/i, tech: { nome: 'Google Tag Manager', categoria: 'analytics', risco: 'alto', descricao: 'Gerenciador de tags do Google' } },
  { pattern: /facebook\.net|fbq\(|fb-pixel|_fbp\b/i, tech: { nome: 'Facebook Pixel', categoria: 'advertising', risco: 'alto', descricao: 'Pixel de rastreamento do Meta/Facebook' } },
  { pattern: /connect\.facebook\.net/i, tech: { nome: 'Facebook SDK', categoria: 'social', risco: 'alto', descricao: 'SDK social do Facebook' } },
  { pattern: /hotjar\.com|hotjar/i, tech: { nome: 'Hotjar', categoria: 'analytics', risco: 'medio', descricao: 'Gravação de sessão e mapas de calor' } },
  { pattern: /clarity\.ms|microsoft clarity/i, tech: { nome: 'Microsoft Clarity', categoria: 'analytics', risco: 'medio', descricao: 'Ferramenta de analytics da Microsoft' } },
  { pattern: /linkedin\.com\/insight|_linkedin_/i, tech: { nome: 'LinkedIn Insight Tag', categoria: 'advertising', risco: 'alto', descricao: 'Tag de rastreamento do LinkedIn' } },
  { pattern: /tiktok\.com\/i18n\/pixel|ttq\./i, tech: { nome: 'TikTok Pixel', categoria: 'advertising', risco: 'alto', descricao: 'Pixel de rastreamento do TikTok' } },
  { pattern: /rd\.station|rdstation/i, tech: { nome: 'RD Station', categoria: 'analytics', risco: 'medio', descricao: 'Plataforma de automação de marketing brasileira' } },
  { pattern: /hubspot\.com\/|_hstc\b/i, tech: { nome: 'HubSpot', categoria: 'analytics', risco: 'medio', descricao: 'CRM e automação de marketing' } },
  { pattern: /intercom\.io|intercomSettings/i, tech: { nome: 'Intercom', categoria: 'chat', risco: 'medio', descricao: 'Chat e suporte ao cliente' } },
  { pattern: /crisp\.chat|CRISP_WEBSITE_ID/i, tech: { nome: 'Crisp Chat', categoria: 'chat', risco: 'baixo', descricao: 'Widget de chat' } },
  { pattern: /wp-content|wp-includes|wordpress/i, tech: { nome: 'WordPress', categoria: 'cms', risco: 'baixo', descricao: 'CMS WordPress' } },
  { pattern: /cdn\.shopify\.com|Shopify\.theme/i, tech: { nome: 'Shopify', categoria: 'cms', risco: 'baixo', descricao: 'Plataforma de e-commerce Shopify' } },
  { pattern: /doubleclick\.net|googlesyndication/i, tech: { nome: 'Google Ads', categoria: 'advertising', risco: 'alto', descricao: 'Rede de publicidade do Google' } },
  { pattern: /mixpanel\.com|mixpanel\.track/i, tech: { nome: 'Mixpanel', categoria: 'analytics', risco: 'medio', descricao: 'Analytics de produto' } },
  { pattern: /segment\.com|analytics\.js/i, tech: { nome: 'Segment', categoria: 'analytics', risco: 'medio', descricao: 'Plataforma de dados de clientes' } },
  { pattern: /sentry\.io|Sentry\.init/i, tech: { nome: 'Sentry', categoria: 'outro', risco: 'baixo', descricao: 'Monitoramento de erros' } },
]

// ─── Parser de Set-Cookie header ─────────────────────────────────────────

function parseCookieHeader(header: string): Partial<Cookie> {
  const parts = header.split(';').map(p => p.trim())
  const [nameVal, ...attrs] = parts
  const [nome, valor] = (nameVal ?? '').split('=')
  const attrMap: Record<string, string> = {}
  attrs.forEach(a => {
    const [k, v] = a.split('=')
    attrMap[(k ?? '').toLowerCase().trim()] = (v ?? '').trim()
  })
  return {
    nome: (nome ?? '').trim(),
    valor: valor ? valor.trim().substring(0, 20) + (valor.length > 20 ? '...' : '') : undefined,
    path: attrMap['path'],
    expiracao: attrMap['expires'] ?? attrMap['max-age'],
    httpOnly: 'httponly' in attrMap,
    secure: 'secure' in attrMap,
    sameSite: attrMap['samesite'],
  }
}

function categorizarCookie(nome: string): Cookie['categoria'] {
  const n = nome.toLowerCase()
  if (/^_ga|^_gid|^_gat|^__utm|hotjar|hj_|_hjSession|_hjid/.test(n)) return 'analitico'
  if (/^_fbp|^_fbc|^fr$|_gcl_|^__adroll|doubleclick|_uetsid|_uetvid/.test(n)) return 'marketing'
  if (/sess|session|token|auth|csrf|xsrf|phpsessid|jsessionid/.test(n)) return 'necessario'
  if (/prefer|lang|locale|theme|currency/.test(n)) return 'funcional'
  return 'desconhecido'
}

// ─── Detecção de banner de cookies ───────────────────────────────────────

function detectarBannerCookies(html: string): boolean {
  const patterns = [
    /cookie.{0,30}(banner|notice|consent|policy|bar|popup|modal)/i,
    /(banner|notice|consent|popup|modal).{0,30}cookie/i,
    /cookieconsent|cookie-consent|cookie_consent/i,
    /aceitar.{0,20}cookies|aceito.{0,20}cookies/i,
    /accept.{0,20}cookies|agree.{0,20}cookies/i,
    /gdpr|lgpd.{0,30}(cookie|consentimento)/i,
    /CookieConsent|OneTrust|cookielaw|Cookiebot/i,
    /data-cookieconsent|class="cookie/i,
  ]
  return patterns.some(p => p.test(html))
}

// ─── Detecção de política de privacidade ─────────────────────────────────

function detectarPolitica(html: string, baseUrl: string): { existe: boolean; url: string | null } {
  const patterns = [
    /href=["']([^"']*politic[^"']*privacidade[^"']*|[^"']*privacy[^"']*policy[^"']*)["']/i,
    /href=["']([^"']*aviso[^"']*privacidade[^"']*)["']/i,
    /href=["']([^"']*privacy[^"']*)["']/i,
  ]

  for (const p of patterns) {
    const match = html.match(p)
    if (match?.[1]) {
      let url = match[1]
      if (url.startsWith('/')) {
        try { url = new URL(url, baseUrl).href } catch { /* ignore */ }
      }
      return { existe: true, url }
    }
  }

  // Texto simples sem link
  if (/política de privacidade|aviso de privacidade|privacy policy/i.test(html)) {
    return { existe: true, url: null }
  }

  return { existe: false, url: null }
}

// ─── Função principal de scan ─────────────────────────────────────────────

export async function escanearSite(url: string): Promise<ScanResult> {
  const baseUrl = new URL(url).origin

  // Fetch da página
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LGPDScanner/1.0)',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  })

  const html = await response.text()
  const cookieHeaders = response.headers.getSetCookie?.() ?? []

  // Cookies do header
  const cookies: Cookie[] = cookieHeaders.map(h => {
    const parsed = parseCookieHeader(h)
    return {
      nome: parsed.nome ?? 'desconhecido',
      valor: parsed.valor,
      path: parsed.path,
      expiracao: parsed.expiracao,
      httpOnly: parsed.httpOnly,
      secure: parsed.secure,
      sameSite: parsed.sameSite,
      categoria: categorizarCookie(parsed.nome ?? ''),
    }
  })

  // Tecnologias detectadas no HTML
  const tecsSeen = new Set<string>()
  const tecnologias: Tecnologia[] = []
  for (const sig of TECH_SIGNATURES) {
    if (sig.pattern.test(html) && !tecsSeen.has(sig.tech.nome)) {
      tecsSeen.add(sig.tech.nome)
      tecnologias.push(sig.tech)
    }
  }

  const tem_banner_cookies = detectarBannerCookies(html)
  const politica = detectarPolitica(html, baseUrl)

  // ─── Análise de problemas ────────────────────────────────────────────

  const problemas: Problema[] = []
  const recomendacoes: Recomendacao[] = []

  const temCookiesMarketing = cookies.some(c => c.categoria === 'marketing') ||
    tecnologias.some(t => t.categoria === 'advertising')
  const temAnalytics = cookies.some(c => c.categoria === 'analitico') ||
    tecnologias.some(t => t.categoria === 'analytics')
  const temCookiesNaoSeguro = cookies.some(c => !c.secure)
  const temCookiesSemSameSite = cookies.some(c => !c.sameSite)
  const temTransferencia = tecnologias.some(t =>
    ['Google Analytics', 'Facebook Pixel', 'Google Tag Manager', 'LinkedIn Insight Tag', 'TikTok Pixel'].includes(t.nome)
  )

  if (!politica.existe) {
    problemas.push({ nivel: 'critico', titulo: 'Política de Privacidade ausente', descricao: 'Nenhuma Política de Privacidade foi encontrada no site. Obrigatório pela LGPD (Art. 9).' })
    recomendacoes.push({ titulo: 'Publicar Política de Privacidade', descricao: 'Crie e publique uma Política de Privacidade clara e acessível com link no rodapé.' })
  }

  if ((temCookiesMarketing || temAnalytics) && !tem_banner_cookies) {
    problemas.push({ nivel: 'critico', titulo: 'Banner de cookies ausente', descricao: 'O site usa cookies de rastreamento mas não apresenta banner de consentimento.' })
    recomendacoes.push({ titulo: 'Implementar banner de consentimento', descricao: 'Adicione um banner informando sobre o uso de cookies e coletando consentimento antes de ativá-los.' })
  }

  if (temTransferencia) {
    problemas.push({ nivel: 'alto', titulo: 'Transferência internacional de dados', descricao: 'Scripts de terceiros (Google, Meta, etc.) transferem dados para servidores fora do Brasil. Exige base legal adequada (LGPD Art. 33).' })
    recomendacoes.push({ titulo: 'Documentar transferências internacionais', descricao: 'Identifique todos os destinos, inclua na Política de Privacidade e garanta mecanismo legal (SCC ou consentimento).' })
  }

  const cookiesMarketing = tecnologias.filter(t => t.categoria === 'advertising')
  if (cookiesMarketing.length > 0) {
    problemas.push({ nivel: 'alto', titulo: `${cookiesMarketing.length} ferramenta(s) de publicidade detectada(s)`, descricao: `${cookiesMarketing.map(t => t.nome).join(', ')} coletam dados para fins de publicidade. Requer consentimento explícito.` })
  }

  if (temCookiesNaoSeguro && cookies.some(c => !c.secure && c.categoria !== 'necessario')) {
    problemas.push({ nivel: 'medio', titulo: 'Cookies sem flag Secure', descricao: 'Alguns cookies são transmitidos por HTTP não seguro, expondo dados dos titulares.' })
    recomendacoes.push({ titulo: 'Adicionar flag Secure aos cookies', descricao: 'Configure todos os cookies com Secure=true para forçar transmissão apenas via HTTPS.' })
  }

  if (temCookiesSemSameSite) {
    problemas.push({ nivel: 'baixo', titulo: 'Cookies sem atributo SameSite', descricao: 'Cookies sem SameSite podem ser enviados em requisições cross-site, aumentando risco de CSRF.' })
    recomendacoes.push({ titulo: 'Configurar SameSite nos cookies', descricao: 'Defina SameSite=Strict ou SameSite=Lax em todos os cookies.' })
  }

  if (cookies.length === 0 && tecnologias.length === 0) {
    recomendacoes.push({ titulo: 'Manter monitoramento contínuo', descricao: 'Execute o scan periodicamente para detectar novos scripts adicionados por terceiros ou atualizações de CMS.' })
  }

  // ─── Score ────────────────────────────────────────────────────────────

  let score = 100
  for (const p of problemas) {
    if (p.nivel === 'critico') score -= 25
    else if (p.nivel === 'alto') score -= 15
    else if (p.nivel === 'medio') score -= 8
    else score -= 3
  }
  score = Math.max(0, score)

  return {
    cookies,
    tecnologias,
    tem_banner_cookies,
    tem_politica_privacidade: politica.existe,
    url_politica_privacidade: politica.url,
    score_conformidade: score,
    problemas,
    recomendacoes,
  }
}
