// LGPD compliance scanner for websites
// Analyzes HTTP headers, HTML and detected scripts

export type Cookie = {
  name: string
  value?: string
  domain?: string
  path?: string
  expiration?: string
  httpOnly?: boolean
  secure?: boolean
  sameSite?: string
  category: 'necessary' | 'functional' | 'analytical' | 'marketing' | 'unknown'
}

export type Technology = {
  name: string
  category: 'analytics' | 'advertising' | 'social' | 'cms' | 'framework' | 'chat' | 'other'
  risk: 'high' | 'medium' | 'low'
  description: string
}

export type Issue = {
  level: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
}

export type Recommendation = {
  title: string
  description: string
}

export type ScanResult = {
  cookies: Cookie[]
  technologies: Technology[]
  has_cookie_banner: boolean
  has_privacy_policy: boolean
  privacy_policy_url: string | null
  compliance_score: number
  issues: Issue[]
  recommendations: Recommendation[]
}

// ─── Known technology map ──────────────────────────────────────

const TECH_SIGNATURES: Array<{
  pattern: RegExp
  tech: Technology
}> = [
  { pattern: /google-analytics\.com|gtag|ga\s*\(|_ga\b/i, tech: { name: 'Google Analytics', category: 'analytics', risk: 'high', description: 'Rastreamento de comportamento via Google' } },
  { pattern: /googletagmanager\.com|GTM-/i, tech: { name: 'Google Tag Manager', category: 'analytics', risk: 'high', description: 'Gerenciador de tags do Google' } },
  { pattern: /facebook\.net|fbq\(|fb-pixel|_fbp\b/i, tech: { name: 'Facebook Pixel', category: 'advertising', risk: 'high', description: 'Pixel de rastreamento do Meta/Facebook' } },
  { pattern: /connect\.facebook\.net/i, tech: { name: 'Facebook SDK', category: 'social', risk: 'high', description: 'SDK social do Facebook' } },
  { pattern: /hotjar\.com|hotjar/i, tech: { name: 'Hotjar', category: 'analytics', risk: 'medium', description: 'Gravação de sessão e mapas de calor' } },
  { pattern: /clarity\.ms|microsoft clarity/i, tech: { name: 'Microsoft Clarity', category: 'analytics', risk: 'medium', description: 'Ferramenta de analytics da Microsoft' } },
  { pattern: /linkedin\.com\/insight|_linkedin_/i, tech: { name: 'LinkedIn Insight Tag', category: 'advertising', risk: 'high', description: 'Tag de rastreamento do LinkedIn' } },
  { pattern: /tiktok\.com\/i18n\/pixel|ttq\./i, tech: { name: 'TikTok Pixel', category: 'advertising', risk: 'high', description: 'Pixel de rastreamento do TikTok' } },
  { pattern: /rd\.station|rdstation/i, tech: { name: 'RD Station', category: 'analytics', risk: 'medium', description: 'Plataforma de automação de marketing brasileira' } },
  { pattern: /hubspot\.com\/|_hstc\b/i, tech: { name: 'HubSpot', category: 'analytics', risk: 'medium', description: 'CRM e automação de marketing' } },
  { pattern: /intercom\.io|intercomSettings/i, tech: { name: 'Intercom', category: 'chat', risk: 'medium', description: 'Chat e suporte ao cliente' } },
  { pattern: /crisp\.chat|CRISP_WEBSITE_ID/i, tech: { name: 'Crisp Chat', category: 'chat', risk: 'low', description: 'Widget de chat' } },
  { pattern: /wp-content|wp-includes|wordpress/i, tech: { name: 'WordPress', category: 'cms', risk: 'low', description: 'CMS WordPress' } },
  { pattern: /cdn\.shopify\.com|Shopify\.theme/i, tech: { name: 'Shopify', category: 'cms', risk: 'low', description: 'Plataforma de e-commerce Shopify' } },
  { pattern: /doubleclick\.net|googlesyndication/i, tech: { name: 'Google Ads', category: 'advertising', risk: 'high', description: 'Rede de publicidade do Google' } },
  { pattern: /mixpanel\.com|mixpanel\.track/i, tech: { name: 'Mixpanel', category: 'analytics', risk: 'medium', description: 'Analytics de produto' } },
  { pattern: /segment\.com|analytics\.js/i, tech: { name: 'Segment', category: 'analytics', risk: 'medium', description: 'Plataforma de dados de clientes' } },
  { pattern: /sentry\.io|Sentry\.init/i, tech: { name: 'Sentry', category: 'other', risk: 'low', description: 'Monitoramento de erros' } },
]

// ─── Set-Cookie header parser ─────────────────────────────────────────────

function parseCookieHeader(header: string): Partial<Cookie> {
  const parts = header.split(';').map(p => p.trim())
  const [nameVal, ...attrs] = parts
  const [rawName, rawValue] = (nameVal ?? '').split('=')
  const attrMap: Record<string, string> = {}
  attrs.forEach(a => {
    const [k, v] = a.split('=')
    attrMap[(k ?? '').toLowerCase().trim()] = (v ?? '').trim()
  })
  return {
    name: (rawName ?? '').trim(),
    value: rawValue ? rawValue.trim().substring(0, 20) + (rawValue.length > 20 ? '...' : '') : undefined,
    path: attrMap['path'],
    expiration: attrMap['expires'] ?? attrMap['max-age'],
    httpOnly: 'httponly' in attrMap,
    secure: 'secure' in attrMap,
    sameSite: attrMap['samesite'],
  }
}

function categorizeCookie(name: string): Cookie['category'] {
  const n = name.toLowerCase()
  if (/^_ga|^_gid|^_gat|^__utm|hotjar|hj_|_hjSession|_hjid/.test(n)) return 'analytical'
  if (/^_fbp|^_fbc|^fr$|_gcl_|^__adroll|doubleclick|_uetsid|_uetvid/.test(n)) return 'marketing'
  if (/sess|session|token|auth|csrf|xsrf|phpsessid|jsessionid/.test(n)) return 'necessary'
  if (/prefer|lang|locale|theme|currency/.test(n)) return 'functional'
  return 'unknown'
}

// ─── Cookie banner detection ───────────────────────────────────────────────

function detectCookieBanner(html: string): boolean {
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

// ─── Privacy policy detection ─────────────────────────────────────────────

function detectPrivacyPolicy(html: string, baseUrl: string): { exists: boolean; url: string | null } {
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
      return { exists: true, url }
    }
  }

  // Plain text without link
  if (/política de privacidade|aviso de privacidade|privacy policy/i.test(html)) {
    return { exists: true, url: null }
  }

  return { exists: false, url: null }
}

// ─── Main scan function ─────────────────────────────────────────────────────

export async function scanSite(url: string): Promise<ScanResult> {
  const baseUrl = new URL(url).origin

  // Fetch the page
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; LGPDScanner/1.0)',
      'Accept': 'text/html',
    },
    signal: AbortSignal.timeout(8000),
    redirect: 'follow',
  })

  const html = await response.text()
  const cookieHeaders = response.headers.getSetCookie?.() ?? []

  // Cookies from headers
  const cookies: Cookie[] = cookieHeaders.map(h => {
    const parsed = parseCookieHeader(h)
    return {
      name: parsed.name ?? 'unknown',
      value: parsed.value,
      path: parsed.path,
      expiration: parsed.expiration,
      httpOnly: parsed.httpOnly,
      secure: parsed.secure,
      sameSite: parsed.sameSite,
      category: categorizeCookie(parsed.name ?? ''),
    }
  })

  // Technologies detected in HTML
  const techsSeen = new Set<string>()
  const technologies: Technology[] = []
  for (const sig of TECH_SIGNATURES) {
    if (sig.pattern.test(html) && !techsSeen.has(sig.tech.name)) {
      techsSeen.add(sig.tech.name)
      technologies.push(sig.tech)
    }
  }

  const has_cookie_banner = detectCookieBanner(html)
  const privacyPolicy = detectPrivacyPolicy(html, baseUrl)

  // ─── Issue analysis ────────────────────────────────────────────

  const issues: Issue[] = []
  const recommendations: Recommendation[] = []

  const hasMarketingCookies = cookies.some(c => c.category === 'marketing') ||
    technologies.some(t => t.category === 'advertising')
  const hasAnalytics = cookies.some(c => c.category === 'analytical') ||
    technologies.some(t => t.category === 'analytics')
  const hasInsecureCookies = cookies.some(c => !c.secure)
  const hasMissingSameSite = cookies.some(c => !c.sameSite)
  const hasInternationalTransfer = technologies.some(t =>
    ['Google Analytics', 'Facebook Pixel', 'Google Tag Manager', 'LinkedIn Insight Tag', 'TikTok Pixel'].includes(t.name)
  )

  if (!privacyPolicy.exists) {
    issues.push({ level: 'critical', title: 'Política de Privacidade ausente', description: 'Nenhuma Política de Privacidade foi encontrada no site. Obrigatório pela LGPD (Art. 9).' })
    recommendations.push({ title: 'Publicar Política de Privacidade', description: 'Crie e publique uma Política de Privacidade clara e acessível com link no rodapé.' })
  }

  if ((hasMarketingCookies || hasAnalytics) && !has_cookie_banner) {
    issues.push({ level: 'critical', title: 'Banner de cookies ausente', description: 'O site usa cookies de rastreamento mas não apresenta banner de consentimento.' })
    recommendations.push({ title: 'Implementar banner de consentimento', description: 'Adicione um banner informando sobre o uso de cookies e coletando consentimento antes de ativá-los.' })
  }

  if (hasInternationalTransfer) {
    issues.push({ level: 'high', title: 'Transferência internacional de dados', description: 'Scripts de terceiros (Google, Meta, etc.) transferem dados para servidores fora do Brasil. Exige base legal adequada (LGPD Art. 33).' })
    recommendations.push({ title: 'Documentar transferências internacionais', description: 'Identifique todos os destinos, inclua na Política de Privacidade e garanta mecanismo legal (SCC ou consentimento).' })
  }

  const advertisingTools = technologies.filter(t => t.category === 'advertising')
  if (advertisingTools.length > 0) {
    issues.push({ level: 'high', title: `${advertisingTools.length} ferramenta(s) de publicidade detectada(s)`, description: `${advertisingTools.map(t => t.name).join(', ')} coletam dados para fins de publicidade. Requer consentimento explícito.` })
  }

  if (hasInsecureCookies && cookies.some(c => !c.secure && c.category !== 'necessary')) {
    issues.push({ level: 'medium', title: 'Cookies sem flag Secure', description: 'Alguns cookies são transmitidos por HTTP não seguro, expondo dados dos titulares.' })
    recommendations.push({ title: 'Adicionar flag Secure aos cookies', description: 'Configure todos os cookies com Secure=true para forçar transmissão apenas via HTTPS.' })
  }

  if (hasMissingSameSite) {
    issues.push({ level: 'low', title: 'Cookies sem atributo SameSite', description: 'Cookies sem SameSite podem ser enviados em requisições cross-site, aumentando risco de CSRF.' })
    recommendations.push({ title: 'Configurar SameSite nos cookies', description: 'Defina SameSite=Strict ou SameSite=Lax em todos os cookies.' })
  }

  if (cookies.length === 0 && technologies.length === 0) {
    recommendations.push({ title: 'Manter monitoramento contínuo', description: 'Execute o scan periodicamente para detectar novos scripts adicionados por terceiros ou atualizações de CMS.' })
  }

  // ─── Score ────────────────────────────────────────────────────────────

  let score = 100
  for (const issue of issues) {
    if (issue.level === 'critical') score -= 25
    else if (issue.level === 'high') score -= 15
    else if (issue.level === 'medium') score -= 8
    else score -= 3
  }
  score = Math.max(0, score)

  return {
    cookies,
    technologies,
    has_cookie_banner,
    has_privacy_policy: privacyPolicy.exists,
    privacy_policy_url: privacyPolicy.url,
    compliance_score: score,
    issues,
    recommendations,
  }
}
