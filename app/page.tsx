import Link from 'next/link'
import Image from 'next/image'

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function IconArrow() {
  return (
    <svg className="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

function IconCheck({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="m5 13 4 4L19 7" />
    </svg>
  )
}

function CircleCheck({ bg, fg }: { bg: string; fg: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={bg} />
      <path d="m8 12 3 3 5-6" stroke={fg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)', color: '#475569', background: '#fff', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── TOPBAR ── */}
      <div style={{ background: '#0B1B3D', color: '#B7C2DA', fontSize: '12.5px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '8px 0' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: '#DAE2F2' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" /></svg>
              LGPD · ISO 27001 · SOC 2
            </span>
            <span className="hide-mobile" style={{ display: 'none' }}>Conformidade total para sua empresa</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '8px 0' }}>
            <a href="#contato" style={{ color: '#B7C2DA', textDecoration: 'none' }}>+55 (11) 4002-8922</a>
            <a href="#contato" style={{ color: '#B7C2DA', textDecoration: 'none' }}>contato@serraprivacy.com.br</a>
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(255,255,255,0.92)', backdropFilter: 'saturate(180%) blur(10px)', borderBottom: '1px solid #EEF1F6' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, paddingTop: 16, paddingBottom: 16 }}>
          <Link href="/" aria-label="Serra Privacy" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Image src="/logo-transparent.png" alt="Serra Privacy" width={130} height={46} style={{ objectFit: 'contain', height: 46, width: 'auto' }} priority />
          </Link>

          <div style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: '14.5px', fontWeight: 500, color: '#334155' }}>
            {[
              { label: 'Início', href: '#' },
              { label: 'Produtos', href: '#features' },
              { label: 'Soluções', href: '#modulos' },
              { label: 'Sobre nós', href: '#sobre' },
              { label: 'Case de sucesso', href: '#cases' },
              { label: 'Contato', href: '#contato' },
              { label: 'Login', href: '/login' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{ color: '#334155', textDecoration: 'none', padding: '6px 0' }}>{l.label}</Link>
            ))}
          </div>

          <Link href="/cadastro" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '11px 18px', fontSize: 14, fontWeight: 600, borderRadius: 999,
            background: '#0B1B3D', color: '#fff', textDecoration: 'none', border: 'none',
            transition: 'background 0.15s ease',
          }}>
            Solicitar demonstração <IconArrow />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header style={{ position: 'relative', background: 'linear-gradient(180deg, #FBFCFE 0%, #FFFFFF 100%)', overflow: 'hidden', padding: '84px 0 120px' }}>
        {/* bg glows */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 12% 18%, rgba(37,99,235,0.06), transparent 40%), radial-gradient(circle at 92% 12%, rgba(109,40,217,0.05), transparent 50%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 72, alignItems: 'center' }}>
          {/* Left */}
          <div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#EFF4FF', color: '#1D4ED8', borderRadius: 999, fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.02em' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
              Plataforma de Governança · LGPD · IA · ESG
            </span>

            <h1 style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", system-ui, sans-serif)', fontSize: 'clamp(40px, 5.4vw, 64px)', fontWeight: 800, color: '#0B1B3D', margin: '24px 0 22px', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Sua plataforma{' '}
              <span style={{ color: '#2563EB', position: 'relative', whiteSpace: 'nowrap' }}>
                inteligente
                <span style={{ position: 'absolute', left: 0, right: 0, bottom: 4, height: 10, background: 'linear-gradient(90deg, rgba(37,99,235,0.18), rgba(37,99,235,0.04))', borderRadius: 6, zIndex: -1, display: 'block' }} />
              </span>
              {' '}de governança de dados
            </h1>

            <p style={{ fontSize: 18, color: '#475569', maxWidth: 520, lineHeight: 1.65 }}>
              Gerencie, proteja e transforme seus dados em vantagem competitiva. Conformidade contínua à LGPD em um único ambiente — automatizado, auditável e seguro.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', margin: '32px 0 20px' }}>
              <Link href="/cadastro" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px',
                fontSize: 14, fontWeight: 600, borderRadius: 999, textDecoration: 'none',
                background: 'linear-gradient(135deg, #1D4ED8, #2563EB 60%, #3B82F6)', color: '#fff',
                boxShadow: '0 6px 16px -6px rgba(37,99,235,0.6), inset 0 1px 0 rgba(255,255,255,0.18)',
              }}>
                Solicitar demonstração <IconArrow />
              </Link>
              <Link href="#features" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px',
                fontSize: 14, fontWeight: 600, borderRadius: 999, textDecoration: 'none',
                background: 'white', color: '#0B1B3D', border: '1px solid #E5E9F0',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="6 4 20 12 6 20 6 4" /></svg>
                Conheça a plataforma
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: '13.5px', color: '#94A3B8', marginTop: 8 }}>
              {['Implementação em 24h', 'Suporte 100% em português', 'Equipe certificada'].map(item => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3"><path d="m5 13 4 4L19 7" /></svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right — visual */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', maxWidth: 520, marginLeft: 'auto' }}>
            {/* glow shape */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.18) 0%, transparent 55%), radial-gradient(circle at 30% 25%, rgba(96,165,250,0.22) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(109,40,217,0.12) 0%, transparent 55%)',
              borderRadius: '50%', filter: 'blur(4px)',
            }} />
            {/* padlock */}
            <div style={{ position: 'absolute', inset: '8%', display: 'grid', placeItems: 'center', zIndex: 2 }}>
              <Image
                src="/padlock-transparent.png"
                alt="Cadeado de segurança de dados"
                width={400} height={400}
                style={{ width: '86%', height: 'auto', filter: 'drop-shadow(0 30px 50px rgba(37,99,235,0.35)) drop-shadow(0 10px 20px rgba(15,23,42,0.12))', animation: 'floaty 6s ease-in-out infinite' }}
                priority
              />
            </div>

            {/* float card 1 */}
            <div style={{ position: 'absolute', top: '12%', left: '-4%', background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.25)', display: 'flex', gap: 12, alignItems: 'center', zIndex: 3 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E4F7EE', color: '#059669', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 13 4 4L19 7" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Conformidade LGPD</div>
                <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>98% completo</div>
              </div>
            </div>

            {/* float card 2 */}
            <div style={{ position: 'absolute', bottom: '14%', right: '-6%', background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.25)', display: 'flex', gap: 12, alignItems: 'center', zIndex: 3 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#EAF1FF', color: '#2563EB', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 12h4l3-8 4 16 3-8h4" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>Incidentes ativos</div>
                <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>2 monitorados</div>
              </div>
            </div>

            {/* float card 3 */}
            <div style={{ position: 'absolute', bottom: '28%', left: '-8%', background: 'white', borderRadius: 14, padding: '14px 16px', boxShadow: '0 20px 40px -15px rgba(15,23,42,0.25)', display: 'flex', gap: 12, alignItems: 'center', zIndex: 3 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#F0EAFE', color: '#6D28D9', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>IA · Análise de risco</div>
                <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>Tempo real</div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes floaty {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-12px); }
          }
        `}</style>
      </header>

      {/* ── TRUST STRIP ── */}
      <div style={{ borderTop: '1px solid #EEF1F6', background: '#F7F9FC', padding: '28px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: 48, flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Empresas que confiam na Serra Privacy</span>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { glyph: '◆', name: 'Northwind' },
              { glyph: '●', name: 'Volux Bank' },
              { glyph: '▲', name: 'Atlas Saúde' },
              { glyph: '◼', name: 'Pravo Legal' },
              { glyph: '⬡', name: 'Carbono & Co.' },
            ].map(({ glyph, name }) => (
              <span key={name} style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', fontWeight: 700, fontSize: 18, color: '#94A3B8', letterSpacing: '-0.01em', opacity: 0.85 }}>
                <span style={{ color: '#64748B', marginRight: 4 }}>{glyph}</span>{name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RISCOS ── */}
      <section id="riscos" style={{ background: '#F7F9FC', padding: '100px 0', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 56px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#FEE2E2', color: '#DC2626', borderRadius: 999, fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
              Riscos &amp; impacto
            </span>
            <h2 style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', fontSize: 'clamp(28px, 3.2vw, 40px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 18, marginBottom: 14 }}>Riscos que sua empresa está correndo</h2>
            <p style={{ fontSize: 17, color: '#475569' }}>Identifique as principais ameaças ao seu negócio e tome ações para proteger seus dados, sua reputação e a continuidade das suas operações.</p>
          </div>

          <div style={{ display: 'grid', gap: 14, maxWidth: 920, margin: '0 auto' }}>
            {[
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9M14 17H5M17 12H7" /><circle cx="17" cy="7" r="3" /><circle cx="7" cy="12" r="3" /><circle cx="17" cy="17" r="3" /></svg>,
                bg: '#EAF1FF', fg: '#2563EB',
                title: 'Danos à Reputação e Marca',
                text: 'Vazamento de dados pode destruir a confiança do cliente, resultando em perda de mercado e valor da marca.',
                impact: 'ALTO', impactHigh: true,
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v18M5 8l-3 6h6L5 8zM19 8l-3 6h6l-3-6z" /><path d="M3 21h18" /></svg>,
                bg: '#E4F7EE', fg: '#059669',
                title: 'Ações Judiciais',
                text: 'Clientes podem mover ações individuais ou coletivas por danos materiais ou morais decorrentes de uso indevido de seus dados.',
                impact: 'MÉDIO', impactHigh: false,
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></svg>,
                bg: '#F0EAFE', fg: '#6D28D9',
                title: 'Operações Interrompidas',
                text: 'A paralisação da base de dados pode travar o funcionamento da empresa, causando perdas operacionais e atrasos críticos.',
                impact: 'ALTO', impactHigh: true,
              },
              {
                icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9 9.5a3 3 0 0 1 6 0c0 1.5-1 2-3 2.5-2 .5-3 1-3 2.5a3 3 0 0 0 6 0" /></svg>,
                bg: '#FFEDDF', fg: '#EA580C',
                title: 'Sanções Administrativas (ANPD)',
                text: 'Multas pecuniárias de até 2% do faturamento (R$ 50 milhões por infração), advertências, bloqueio de dados ou interrupção do tratamento.',
                impact: 'MÉDIO', impactHigh: false,
              },
            ].map((r) => (
              <div key={r.title} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', alignItems: 'center', gap: 22, background: 'white', border: '1px solid #EEF1F6', borderRadius: 20, padding: '22px 24px', transition: 'border-color 0.2s ease, transform 0.2s ease' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: r.bg, color: r.fg, display: 'grid', placeItems: 'center' }}>{r.icon}</div>
                <div>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '16.5px', fontWeight: 700, color: '#0F172A', marginBottom: 4, letterSpacing: '-0.005em' }}>{r.title}</h3>
                  <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.55 }}>{r.text}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, minWidth: 92 }}>
                  <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>Impacto</span>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', padding: '6px 14px', borderRadius: 999, background: r.impactHigh ? '#FFE4E6' : '#FEF3C7', color: r.impactHigh ? '#DC2626' : '#D97706' }}>{r.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 56px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#EFF4FF', color: '#1D4ED8', borderRadius: 999, fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
              Funcionalidades
            </span>
            <h2 style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', fontSize: 'clamp(30px, 3.6vw, 44px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14 }}>Uma nova forma inteligente de viabilizar a governança de dados</h2>
            <p style={{ fontSize: 17, color: '#475569' }}>Nossa plataforma integra conformidade, tecnologia e inteligência em um único ambiente, com controle total, segurança e visão estratégica.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { bg: '#EAF1FF', fg: '#2563EB', title: 'Data Mapping Pro', desc: 'Mapeie, organize e visualize os dados da sua empresa com total controle.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><rect x="7" y="13" width="3" height="5" /><rect x="12" y="9" width="3" height="9" /><rect x="17" y="5" width="3" height="13" /></svg> },
              { bg: '#E4F7EE', fg: '#059669', title: 'Academy LGPD', desc: 'Capacite sua equipe de forma prática, automatizada e em conformidade com a lei.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></svg> },
              { bg: '#F0EAFE', fg: '#6D28D9', title: 'Direitos dos Titulares', desc: 'Gerencie solicitações de titulares com agilidade e segurança jurídica.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m17 11 2 2 4-4" /></svg> },
              { bg: '#FEF1CD', fg: '#B45309', title: 'Governança de Documentos', desc: 'Centralize e organize documentos essenciais da sua estrutura de compliance.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg> },
              { bg: '#FDE7EE', fg: '#E11D48', title: 'Gestão de Incidentes', desc: 'Registre, acompanhe e responda incidentes com rapidez e controle.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16v.5" /></svg> },
              { bg: '#D7F4F0', fg: '#0F766E', title: 'ConsentFlow', desc: 'Gerencie consentimentos de forma simples, rastreável e automatizada.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="m9 14 2 2 4-4" /></svg> },
              { bg: '#E0F2FE', fg: '#0284C7', title: 'Cookies & Adequação de Sites', desc: 'Garanta que seu site esteja conforme a LGPD com gestão eficiente de cookies.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg> },
              { bg: '#FFEDDF', fg: '#EA580C', title: 'Due Diligence', desc: 'Avalie riscos e parceiros com mais segurança e padronização.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg> },
              { bg: '#FFE4E6', fg: '#BE123C', title: 'Canal de Denúncias', desc: 'Receba relatos com sigilo e fortaleça a integridade da sua organização.', icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l18-8-4 18-4-8-10-2z" /></svg> },
            ].map((feat) => (
              <div key={feat.title} style={{ background: 'white', border: '1px solid #EEF1F6', borderRadius: 20, padding: 28, transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease', position: 'relative' }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: feat.bg, color: feat.fg, display: 'grid', placeItems: 'center', marginBottom: 22 }}>{feat.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>{feat.title}</h3>
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
      <section id="modulos" style={{ background: '#FBFCFE', padding: '100px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 56px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#EFF4FF', color: '#1D4ED8', borderRadius: 999, fontSize: '12.5px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} />
              Nossos módulos
            </span>
            <h2 style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', fontSize: 'clamp(30px, 3.6vw, 44px)', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14 }}>Soluções completas para cada etapa da sua adequação à LGPD</h2>
            <p style={{ fontSize: 17, color: '#475569' }}>Tecnologia, metodologia e especialistas para gerar resultados reais — não apenas relatórios.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              {
                bg: '#EAF1FF', fg: '#2563EB',
                icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M19 8l2 2-4 4-2-2z" /></svg>,
                title: 'Módulo para DPO e Profissionais da LGPD',
                desc: 'Ferramentas completas para DPOs e profissionais da privacidade gerenciarem todas as atividades da adequação à LGPD de forma prática e segura.',
                items: [
                  { bold: 'Gestão centralizada', rest: ' das atividades de adequação' },
                  { bold: '', rest: 'Mapeamento de dados e inventários' },
                  { bold: 'Gestão de riscos', rest: ' e plano de ação' },
                  { bold: '', rest: 'Documentos e políticas personalizáveis' },
                  { bold: 'Relatórios automáticos', rest: ' para decisão' },
                ],
                btnClass: '#2563EB',
              },
              {
                bg: '#E4F7EE', fg: '#059669',
                icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.5 16.5c-1.5 1.5-1 5 0 6 1 1 4.5 1.5 6 0L21 12 12 3l-7.5 13.5z" /><path d="m12 15-3-3M15 12l-3-3M9 18l-3-3" /></svg>,
                title: 'Módulo para Empresas que querem acelerar sua adequação',
                desc: 'Módulos prontos e automatizados para acelerar sua jornada de adequação, com acompanhamento especializado em cada etapa.',
                items: [
                  { bold: '', rest: 'Jornada guiada de adequação à LGPD' },
                  { bold: '', rest: 'Questionários e checklists automatizados' },
                  { bold: '', rest: 'Geração de documentos e evidências' },
                  { bold: '', rest: 'Acompanhamento de prazos e tarefas' },
                  { bold: '', rest: 'Dashboards com indicadores de conformidade' },
                ],
                btnClass: '#059669',
              },
              {
                bg: '#F0EAFE', fg: '#6D28D9',
                icon: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4zM3 19a2 2 0 0 0 2 2h1v-6H3v4z" /></svg>,
                title: 'DPO as a Service — Encarregado terceirizado',
                desc: 'Terceirize a função de Encarregado de Proteção de Dados (DPO) com especialistas certificados e o apoio da nossa plataforma.',
                items: [
                  { bold: '', rest: 'Atuação contínua e estratégica do DPO' },
                  { bold: '', rest: 'Suporte especializado sempre que precisar' },
                  { bold: '', rest: 'Gestão de incidentes e comunicação com titulares' },
                  { bold: '', rest: 'Relatórios e indicadores para sua empresa' },
                  { bold: '', rest: 'Tranquilidade e conformidade garantidas' },
                ],
                btnClass: '#6D28D9',
              },
            ].map((mod) => (
              <div key={mod.title} style={{ background: 'white', border: '1px solid #EEF1F6', borderRadius: 28, padding: '36px 32px', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: mod.bg, color: mod.fg, display: 'grid', placeItems: 'center', marginBottom: 26 }}>{mod.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', fontSize: 22, fontWeight: 700, color: '#0F172A', lineHeight: 1.25, marginBottom: 14, minHeight: 56 }}>{mod.title}</h3>
                <div style={{ height: 3, width: 36, borderRadius: 3, background: mod.fg, margin: '4px 0 18px' }} />
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.65, marginBottom: 22 }}>{mod.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {mod.items.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#0F172A' }}>
                      <CircleCheck bg={mod.bg} fg={mod.fg} />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        {item.bold && <strong style={{ fontWeight: 700, color: '#0F172A' }}>{item.bold}</strong>}
                        {item.rest}
                      </span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 'auto' }}>
                  <Link href="/cadastro" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '13px 18px', fontSize: 14, fontWeight: 600, borderRadius: 999, border: `1.5px solid ${mod.btnClass}`, color: mod.btnClass, background: 'white', textDecoration: 'none', transition: 'background 0.15s ease' }}>
                    Saiba mais
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0', background: '#FBFCFE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ background: 'linear-gradient(120deg, #0B1B3D 0%, #1E3263 60%, #2563EB 130%)', borderRadius: 32, padding: '64px 56px', position: 'relative', overflow: 'hidden', color: 'white', display: 'grid', gridTemplateColumns: '1.4fr auto', gap: 40, alignItems: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 10% 100%, rgba(96,165,250,0.25), transparent 50%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <h2 style={{ fontFamily: 'var(--font-jakarta, "Plus Jakarta Sans", sans-serif)', color: 'white', fontSize: 'clamp(28px, 3.4vw, 40px)', fontWeight: 800, marginBottom: 12, lineHeight: 1.15, letterSpacing: '-0.02em' }}>Pronto para colocar a LGPD no piloto automático?</h2>
              <p style={{ color: '#C7D2EA', fontSize: '16.5px', maxWidth: 520 }}>Implementação em até 24h. Suporte especializado em português. Equipe certificada e plataforma 100% adequada à LGPD.</p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', position: 'relative' }}>
              <Link href="/cadastro" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', fontSize: 14, fontWeight: 600, borderRadius: 999, background: 'white', color: '#0B1B3D', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Solicitar demonstração <IconArrow />
              </Link>
              <Link href="#contato" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 18px', fontSize: 14, fontWeight: 600, borderRadius: 999, background: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
                Falar com vendas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="contato" style={{ background: '#0B1B3D', color: '#B7C2DA', padding: '72px 0 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr repeat(3, 1fr)', gap: 56, paddingBottom: 48, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {/* Brand col */}
            <div>
              <Link href="/" aria-label="Serra Privacy">
                <Image src="/logo-transparent.png" alt="Serra Privacy" width={130} height={46} style={{ objectFit: 'contain', height: 46, width: 'auto', filter: 'brightness(0) invert(1)', opacity: 0.92 }} />
              </Link>
              <p style={{ fontSize: 14, color: '#B7C2DA', lineHeight: 1.7, margin: '16px 0 22px', maxWidth: 320 }}>Plataforma inteligente de governança de dados — LGPD, IA e ESG em um único ambiente. Conformidade contínua e segura para empresas brasileiras.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: 'LinkedIn', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM8 19H5V8h3v11zM6.5 6.7c-1 0-1.7-.7-1.7-1.6S5.5 3.5 6.5 3.5s1.7.7 1.7 1.6-.7 1.6-1.7 1.6zM20 19h-3v-5.6c0-1.6-.6-2.4-1.7-2.4-1.4 0-2.1.9-2.1 2.4V19h-3V8h3v1.4c.5-.8 1.5-1.5 3.1-1.5 2.2 0 3.7 1.4 3.7 4.2V19z" /></svg> },
                  { label: 'Instagram', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></svg> },
                  { label: 'YouTube', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7s-.2-1.6-.9-2.3c-.8-.9-1.8-.9-2.2-1C16.6 3.5 12 3.5 12 3.5s-4.6 0-7.9.3c-.5 0-1.4 0-2.2.9C1.2 5.4 1 7 1 7S.8 8.9.8 10.7v1.7c0 1.9.2 3.7.2 3.7s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.7.3 7.7.3s4.6 0 7.9-.3c.5 0 1.4 0 2.2-.9.7-.7.9-2.3.9-2.3s.2-1.9.2-3.7v-1.7C23.2 8.9 23 7 23 7zM9.7 14.5V8.3l6 3.1-6 3.1z" /></svg> },
                ].map(({ label, svg }) => (
                  <a key={label} href="#" aria-label={label} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', color: '#B7C2DA', display: 'grid', placeItems: 'center', transition: 'background 0.2s ease, color 0.2s ease', textDecoration: 'none' }}>{svg}</a>
                ))}
              </div>
            </div>

            {/* Link cols */}
            {[
              { title: 'Produto', links: ['Funcionalidades', 'Módulos', 'Integrações', 'Roadmap'] },
              { title: 'Soluções', links: ['Para DPOs', 'Para Empresas', 'DPO as a Service', 'Saúde & Financeiro', 'Setor Público'] },
              { title: 'Empresa', links: ['Sobre nós', 'Cases de sucesso', 'Blog', 'Contato', 'Trabalhe conosco'] },
            ].map((col) => (
              <div key={col.title}>
                <h5 style={{ fontSize: '12.5px', fontWeight: 700, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '8px 0 18px', fontFamily: 'Inter, sans-serif' }}>{col.title}</h5>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {col.links.map(link => (
                    <li key={link}><a href="#" style={{ color: '#B7C2DA', fontSize: 14, textDecoration: 'none' }}>{link}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#94A3B8', flexWrap: 'wrap', gap: 12 }}>
            <span>© 2026 Serra Privacy. Todos os direitos reservados. CNPJ 00.000.000/0001-00</span>
            <div style={{ display: 'flex', gap: 22 }}>
              {['Privacidade', 'Termos', 'Cookies'].map(l => (
                <a key={l} href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
