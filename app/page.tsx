import Image from 'next/image'
import Link from 'next/link'

// ─── SVG helpers ─────────────────────────────────────────────────────────────

function IconArrow() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  )
}

function CircleCheck({ bg, fg }: { bg: string; fg: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill={bg} />
      <path
        d="m8 12 3 3 5-6"
        stroke={fg}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div
      style={{
        fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
        color: '#475569',
        background: '#fff',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        /* ── base ── */
        .lp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .lp-section   { padding: 100px 0; }

        .hero-section  { padding: 84px 0 120px; }
        .hero-grid     { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 72px; align-items: center; }
        .hero-visual   { position: relative; width: 100%; aspect-ratio: 1/1; max-width: 520px; margin-left: auto; }
        .hero-h1       { font-size: clamp(40px,5.4vw,64px); }
        .hero-ctas     { display: flex; gap: 12px; flex-wrap: wrap; margin: 32px 0 20px; }
        .hero-cta-btn  { display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; font-size: 14px; font-weight: 600; border-radius: 999px; text-decoration: none; }
        .hero-meta     { display: flex; align-items: center; gap: 18px; font-size: 13.5px; color: #94A3B8; margin-top: 8px; flex-wrap: wrap; }
        .hv-float      { position: absolute; background: white; border-radius: 14px; padding: 14px 16px; box-shadow: 0 20px 40px -15px rgba(15,23,42,0.25); display: flex; gap: 12px; align-items: center; z-index: 3; }

        .nav-row   { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 16px 0; }
        .nav-links { display: flex; gap: 28px; align-items: center; font-size: 14.5px; font-weight: 500; color: #334155; }
        .nav-btn   { display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; font-size: 14px; font-weight: 600; border-radius: 999px; background: #0B1B3D; color: #fff; text-decoration: none; white-space: nowrap; flex-shrink: 0; }
        .logo-img  { object-fit: contain; height: 48px; width: auto; }

        .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600; letter-spacing: 0.02em; margin-bottom: 18px; }

        .sec-head    { text-align: center; max-width: 740px; margin: 0 auto 56px; }
        .sec-head h2 { font-family: var(--font-jakarta,"Plus Jakarta Sans",system-ui,sans-serif); font-size: clamp(30px,3.6vw,44px); font-weight: 800; color: #0F172A; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 14px; }
        .sec-head p  { font-size: 17px; color: #475569; }

        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .feature-card  { background: white; border: 1px solid #EEF1F6; border-radius: 20px; padding: 28px; position: relative; }
        .feat-icon     { width: 56px; height: 56px; border-radius: 16px; display: grid; place-items: center; margin-bottom: 22px; }

        .modulos-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .mod-card     { background: white; border: 1px solid #EEF1F6; border-radius: 28px; padding: 36px 32px; display: flex; flex-direction: column; }
        .mod-card h3  { font-family: var(--font-jakarta,"Plus Jakarta Sans",system-ui,sans-serif); font-size: 22px; font-weight: 700; color: #0F172A; line-height: 1.25; margin-bottom: 14px; min-height: 56px; }

        .risk-card        { display: grid; grid-template-columns: 64px 1fr auto; align-items: center; gap: 22px; background: white; border: 1px solid #EEF1F6; border-radius: 20px; padding: 22px 24px; }
        .risk-icon        { width: 56px; height: 56px; border-radius: 14px; display: grid; place-items: center; }
        .risk-impact      { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; min-width: 92px; }
        .risk-impact-lbl  { font-size: 12px; color: #94A3B8; font-weight: 500; }
        .risk-impact-badge{ font-size: 12px; font-weight: 700; letter-spacing: 0.06em; padding: 6px 14px; border-radius: 999px; }

        .cta-wrap { background: linear-gradient(120deg,#0B1B3D 0%,#1E3263 60%,#2563EB 130%); border-radius: 32px; padding: 64px 56px; position: relative; overflow: hidden; color: white; display: grid; grid-template-columns: 1.4fr auto; gap: 40px; align-items: center; }
        .cta-btns { display: flex; gap: 12px; flex-wrap: wrap; position: relative; }

        .foot-grid   { display: grid; grid-template-columns: 1.4fr repeat(3,1fr); gap: 56px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .foot-bottom { padding-top: 24px; display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #94A3B8; flex-wrap: wrap; gap: 12px; }

        /* ── 1024px: tablet landscape ── */
        @media (max-width: 1024px) {
          .hero-grid     { grid-template-columns: 1fr; gap: 40px; }
          .hero-visual   { max-width: 420px; margin: 0 auto; }
          .features-grid { grid-template-columns: repeat(2,1fr); }
          .modulos-grid  { grid-template-columns: repeat(2,1fr); }
          .nav-links a:nth-child(n+5) { display: none; }
          .nav-links { gap: 20px; }
          .foot-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
        }

        /* ── 720px: mobile médio ── */
        @media (max-width: 720px) {
          .lp-section   { padding: 56px 0; }
          .lp-container { padding: 0 18px; }
          .hero-section { padding: 48px 0 64px; }
          .hero-grid    { gap: 32px; }
          .hero-h1      { font-size: 34px !important; }
          .hero-visual  { max-width: 320px; }
          .hero-ctas    { flex-direction: column; align-items: stretch; margin: 24px 0 16px; }
          .hero-cta-btn { justify-content: center; width: 100%; }
          .hero-meta    { font-size: 12.5px; gap: 10px; justify-content: center; }
          .hv-float     { padding: 10px 12px; gap: 8px; }
          .nav-links    { display: none; }
          .nav-row      { padding: 12px 0; }
          .logo-img     { height: 40px !important; }
          .eyebrow      { font-size: 11.5px; }
          .sec-head h2  { font-size: 26px; }
          .sec-head p   { font-size: 15px; }
          .features-grid{ grid-template-columns: 1fr; }
          .feature-card { padding: 22px; }
          .feat-icon    { width: 48px !important; height: 48px !important; }
          .modulos-grid { grid-template-columns: 1fr; }
          .mod-card     { padding: 28px 24px; }
          .mod-card h3  { font-size: 19px; min-height: unset; }
          .risk-card   { grid-template-columns: 44px 1fr; gap: 14px; padding: 18px; }
          .risk-icon   { width: 44px !important; height: 44px !important; border-radius: 10px; }
          .risk-card h3{ font-size: 15px; }
          .risk-card p { font-size: 13.5px; }
          .risk-impact { grid-column: 1/-1; flex-direction: row; align-items: center; min-width: unset; }
          .risk-impact-badge { padding: 4px 10px; font-size: 11px; }
          .cta-wrap     { grid-template-columns: 1fr; padding: 36px 24px; border-radius: 24px; }
          .cta-btns     { flex-direction: column; }
          .cta-btns a   { width: 100%; justify-content: center; }
          .foot-grid    { grid-template-columns: 1fr; gap: 28px; }
          .foot-bottom  { flex-direction: column; align-items: flex-start; }
        }

        /* ── 420px: mobile pequeno ── */
        @media (max-width: 420px) {
          .hero-h1   { font-size: 30px !important; }
          .hv-float  { transform: scale(0.85); transform-origin: top left; }
          .eyebrow   { font-size: 11px; }
        }
      `}</style>

      {/* ── TOPBAR ── */}
      <div
        style={{
          background: '#0B1B3D',
          color: '#B7C2DA',
          fontSize: '12.5px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div
          className="lp-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', padding: '8px 0' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '2px 8px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.06)',
                color: '#DAE2F2',
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3z" />
              </svg>
              LGPD · ISO 27001 · SOC 2
            </span>
            <span style={{ display: 'none' }}>Conformidade total para sua empresa</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '8px 0' }}>
            <a
              href="https://wa.me/552422353709"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#B7C2DA', textDecoration: 'none' }}
            >
              +55 (24) 2235-3709
            </a>
            <a href="mailto:serralgpd@gmail.com" style={{ color: '#B7C2DA', textDecoration: 'none' }}>
              serralgpd@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'saturate(180%) blur(10px)',
          borderBottom: '1px solid #EEF1F6',
        }}
      >
        <div className="lp-container nav-row">
          <Link
            href="/"
            aria-label="Serra Privacy"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0, textDecoration: 'none' }}
          >
            <Image
              src="/logo-serra-privacy.png"
              alt="Serra Privacy"
              width={48}
              height={48}
              className="logo-img"
              priority
            />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)', fontWeight: 800, fontSize: 17, color: '#0B1B3D', letterSpacing: '-0.01em' }}>Serra</span>
              <span style={{ fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)', fontWeight: 600, fontSize: 13, color: '#2563EB', letterSpacing: '0.04em' }}>privacy</span>
            </span>
          </Link>

          <div className="nav-links">
            {[
              { label: 'Início', href: '#' },
              { label: 'Produtos', href: '#features' },
              { label: 'Soluções', href: '#modulos' },
              { label: 'Sobre nós', href: '#sobre' },
              { label: 'Case de sucesso', href: '#cases' },
              { label: 'Contato', href: '#contato' },
              { label: 'Login', href: '/login' },
            ].map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{
                  color: '#334155',
                  textDecoration: 'none',
                  padding: '6px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <a
            href="https://wa.me/552422353709"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
          >
            Solicitar demonstração <IconArrow />
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header
        className="hero-section"
        style={{
          position: 'relative',
          background: 'linear-gradient(180deg, #FBFCFE 0%, #FFFFFF 100%)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 12% 18%, rgba(37,99,235,0.06), transparent 40%), radial-gradient(circle at 92% 12%, rgba(109,40,217,0.05), transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <div className="lp-container" style={{ position: 'relative' }}>
          <div className="hero-grid">
            {/* Left */}
            <div>
              <span className="eyebrow" style={{ background: '#EFF4FF', color: '#1D4ED8' }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#2563EB',
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                Plataforma de Governança · LGPD · IA · ESG
              </span>

              <h1
                className="hero-h1"
                style={{
                  fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",system-ui,sans-serif)',
                  fontWeight: 800,
                  color: '#0B1B3D',
                  margin: '24px 0 22px',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                Sua plataforma{' '}
                <span style={{ color: '#2563EB', position: 'relative', whiteSpace: 'nowrap' }}>
                  inteligente
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 4,
                      height: 10,
                      background:
                        'linear-gradient(90deg, rgba(37,99,235,0.18), rgba(37,99,235,0.04))',
                      borderRadius: 6,
                      zIndex: -1,
                      display: 'block',
                    }}
                  />
                </span>{' '}
                de governança de dados
              </h1>

              <p style={{ fontSize: 18, color: '#475569', maxWidth: 520, lineHeight: 1.65 }}>
                Gerencie, proteja e transforme seus dados em vantagem competitiva. Conformidade
                contínua à LGPD em um único ambiente — automatizado, auditável e seguro.
              </p>

              <div className="hero-ctas">
                <a
                  href="https://wa.me/552422353709"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-cta-btn"
                  style={{
                    background: 'linear-gradient(135deg, #1D4ED8, #2563EB 60%, #3B82F6)',
                    color: '#fff',
                    boxShadow:
                      '0 6px 16px -6px rgba(37,99,235,0.6), inset 0 1px 0 rgba(255,255,255,0.18)',
                    textDecoration: 'none',
                  }}
                >
                  Solicitar demonstração <IconArrow />
                </a>
                <Link
                  href="#features"
                  className="hero-cta-btn"
                  style={{ background: 'white', color: '#0B1B3D', border: '1px solid #E5E9F0' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                  Conheça a plataforma
                </Link>
              </div>

              <div className="hero-meta">
                {['Implementação em 24h', 'Suporte 100% em português', 'Equipe certificada'].map(
                  (item) => (
                    <span
                      key={item}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="3"
                      >
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                      {item}
                    </span>
                  ),
                )}
              </div>
            </div>

            {/* Right — visual */}
            <div className="hero-visual">
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(circle at 50% 50%, rgba(37,99,235,0.18) 0%, transparent 55%), radial-gradient(circle at 30% 25%, rgba(96,165,250,0.22) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(109,40,217,0.12) 0%, transparent 55%)',
                  borderRadius: '50%',
                  filter: 'blur(4px)',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  inset: '8%',
                  display: 'grid',
                  placeItems: 'center',
                  zIndex: 2,
                }}
              >
                <Image
                  src="/padlock.png"
                  alt="Cadeado de segurança de dados"
                  width={400}
                  height={400}
                  style={{
                    width: '86%',
                    height: 'auto',
                    filter:
                      'drop-shadow(0 30px 50px rgba(37,99,235,0.35)) drop-shadow(0 10px 20px rgba(15,23,42,0.12))',
                    animation: 'floaty 6s ease-in-out infinite',
                  }}
                  priority
                />
              </div>

              {/* float 1 — top left */}
              <div className="hv-float" style={{ top: '12%', left: '-4%' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#E4F7EE',
                    color: '#059669',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                    Conformidade LGPD
                  </div>
                  <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>
                    98% completo
                  </div>
                </div>
              </div>

              {/* float 2 — bottom right */}
              <div className="hv-float" style={{ bottom: '14%', right: '-6%' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#EAF1FF',
                    color: '#2563EB',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M3 12h4l3-8 4 16 3-8h4" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                    Incidentes ativos
                  </div>
                  <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>
                    2 monitorados
                  </div>
                </div>
              </div>

              {/* float 3 — mid left */}
              <div className="hv-float" style={{ bottom: '28%', left: '-8%' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: '#F0EAFE',
                    color: '#6D28D9',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>
                    IA · Análise de risco
                  </div>
                  <div style={{ fontSize: 14, color: '#0F172A', fontWeight: 700 }}>Tempo real</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── TRUST STRIP ── */}
      <div style={{ borderTop: '1px solid #EEF1F6', background: '#F7F9FC', padding: '28px 0' }}>
        <div
          className="lp-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 48,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: '#94A3B8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Empresas que confiam na Serra Privacy
          </span>
          <div style={{ display: 'flex', gap: 40, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { glyph: '◆', name: 'Lakaza Construção' },
              { glyph: '●', name: 'Mieten Locações' },
              { glyph: '▲', name: 'Adjucol' },
              { glyph: '◼', name: 'Relevo Store' },
              { glyph: '⬡', name: 'Hólon' },
              { glyph: '◆', name: 'Tecnoserra' },
              { glyph: '●', name: 'Schelble Abrasivos' },
              { glyph: '▲', name: 'ADR Andaimes' },
              { glyph: '◼', name: 'Plana3' },
            ].map(({ glyph, name }) => (
              <span
                key={name}
                style={{
                  fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
                  fontWeight: 700,
                  fontSize: 18,
                  color: '#94A3B8',
                  letterSpacing: '-0.01em',
                  opacity: 0.85,
                }}
              >
                <span style={{ color: '#64748B', marginRight: 4 }}>{glyph}</span>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── RISCOS ── */}
      <section id="riscos" className="lp-section" style={{ background: '#F7F9FC' }}>
        <div className="lp-container">
          <div className="sec-head" style={{ maxWidth: 760 }}>
            <span className="eyebrow" style={{ background: '#FEE2E2', color: '#DC2626' }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#DC2626',
                  display: 'inline-block',
                }}
              />
              Riscos &amp; impacto
            </span>
            <h2 style={{ marginTop: 0 }}>Riscos que sua empresa está correndo</h2>
            <p>
              Identifique as principais ameaças ao seu negócio e tome ações para proteger seus
              dados, sua reputação e a continuidade das suas operações.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 14, maxWidth: 920, margin: '0 auto' }}>
            {[
              {
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 7h-9M14 17H5M17 12H7" />
                    <circle cx="17" cy="7" r="3" />
                    <circle cx="7" cy="12" r="3" />
                    <circle cx="17" cy="17" r="3" />
                  </svg>
                ),
                bg: '#EAF1FF',
                fg: '#2563EB',
                title: 'Danos à Reputação e Marca',
                text: 'Vazamento de dados pode destruir a confiança do cliente, resultando em perda de mercado e valor da marca.',
                impact: 'ALTO',
                impactHigh: true,
              },
              {
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 3v18M5 8l-3 6h6L5 8zM19 8l-3 6h6l-3-6z" />
                    <path d="M3 21h18" />
                  </svg>
                ),
                bg: '#E4F7EE',
                fg: '#059669',
                title: 'Ações Judiciais',
                text: 'Clientes podem mover ações individuais ou coletivas por danos materiais ou morais decorrentes de uso indevido de seus dados.',
                impact: 'MÉDIO',
                impactHigh: false,
              },
              {
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
                  </svg>
                ),
                bg: '#F0EAFE',
                fg: '#6D28D9',
                title: 'Operações Interrompidas',
                text: 'A paralisação da base de dados pode travar o funcionamento da empresa, causando perdas operacionais e atrasos críticos.',
                impact: 'ALTO',
                impactHigh: true,
              },
              {
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v10M9 9.5a3 3 0 0 1 6 0c0 1.5-1 2-3 2.5-2 .5-3 1-3 2.5a3 3 0 0 0 6 0" />
                  </svg>
                ),
                bg: '#FFEDDF',
                fg: '#EA580C',
                title: 'Sanções Administrativas (ANPD)',
                text: 'Multas pecuniárias de até 2% do faturamento (R$ 50 milhões por infração), advertências, bloqueio de dados ou interrupção do tratamento.',
                impact: 'MÉDIO',
                impactHigh: false,
              },
            ].map((r) => (
              <div key={r.title} className="risk-card">
                <div className="risk-icon" style={{ background: r.bg, color: r.fg }}>
                  {r.icon}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 700,
                      color: '#0F172A',
                      marginBottom: 4,
                      letterSpacing: '-0.005em',
                    }}
                  >
                    {r.title}
                  </h3>
                  <p style={{ color: '#475569', lineHeight: 1.55 }}>{r.text}</p>
                </div>
                <div className="risk-impact">
                  <span className="risk-impact-lbl">Impacto</span>
                  <span
                    className="risk-impact-badge"
                    style={{
                      background: r.impactHigh ? '#FFE4E6' : '#FEF3C7',
                      color: r.impactHigh ? '#DC2626' : '#D97706',
                    }}
                  >
                    {r.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="lp-section">
        <div className="lp-container">
          <div className="sec-head">
            <span className="eyebrow" style={{ background: '#EFF4FF', color: '#1D4ED8' }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#2563EB',
                  display: 'inline-block',
                }}
              />
              Funcionalidades
            </span>
            <h2>Uma nova forma inteligente de viabilizar a governança de dados</h2>
            <p>
              Nossa plataforma integra conformidade, tecnologia e inteligência em um único ambiente,
              com controle total, segurança e visão estratégica.
            </p>
          </div>

          <div className="features-grid">
            {[
              {
                bg: '#EAF1FF',
                fg: '#2563EB',
                title: 'Data Mapping Pro',
                desc: 'Mapeie, organize e visualize os dados da sua empresa com total controle.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3v18h18" />
                    <rect x="7" y="13" width="3" height="5" />
                    <rect x="12" y="9" width="3" height="9" />
                    <rect x="17" y="5" width="3" height="13" />
                  </svg>
                ),
              },
              {
                bg: '#E4F7EE',
                fg: '#059669',
                title: 'Academy LGPD',
                desc: 'Capacite sua equipe de forma prática, automatizada e em conformidade com a lei.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 10 12 5 2 10l10 5 10-5z" />
                    <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
                  </svg>
                ),
              },
              {
                bg: '#F0EAFE',
                fg: '#6D28D9',
                title: 'Direitos dos Titulares',
                desc: 'Gerencie solicitações de titulares com agilidade e segurança jurídica.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="m17 11 2 2 4-4" />
                  </svg>
                ),
              },
              {
                bg: '#FEF1CD',
                fg: '#B45309',
                title: 'Governança de Documentos',
                desc: 'Centralize e organize documentos essenciais da sua estrutura de compliance.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                  </svg>
                ),
              },
              {
                bg: '#FDE7EE',
                fg: '#E11D48',
                title: 'Gestão de Incidentes',
                desc: 'Registre, acompanhe e responda incidentes com rapidez e controle.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16v.5" />
                  </svg>
                ),
              },
              {
                bg: '#D7F4F0',
                fg: '#0F766E',
                title: 'ConsentFlow',
                desc: 'Gerencie consentimentos de forma simples, rastreável e automatizada.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    <rect x="8" y="2" width="8" height="4" rx="1" />
                    <path d="m9 14 2 2 4-4" />
                  </svg>
                ),
              },
              {
                bg: '#E0F2FE',
                fg: '#0284C7',
                title: 'Cookies & Adequação de Sites',
                desc: 'Garanta que seu site esteja conforme a LGPD com gestão eficiente de cookies.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                  </svg>
                ),
              },
              {
                bg: '#FFEDDF',
                fg: '#EA580C',
                title: 'Due Diligence',
                desc: 'Avalie riscos e parceiros com mais segurança e padronização.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                ),
              },
              {
                bg: '#FFE4E6',
                fg: '#BE123C',
                title: 'Canal de Denúncias',
                desc: 'Receba relatos com sigilo e fortaleça a integridade da sua organização.',
                icon: (
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 11l18-8-4 18-4-8-10-2z" />
                  </svg>
                ),
              },
            ].map((feat) => (
              <div key={feat.title} className="feature-card">
                <div className="feat-icon" style={{ background: feat.bg, color: feat.fg }}>
                  {feat.icon}
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#0F172A',
                    marginBottom: 8,
                  }}
                >
                  {feat.title}
                </h3>
                <p style={{ fontSize: '14.5px', color: '#475569', lineHeight: 1.6 }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MÓDULOS ── */}
      <section id="modulos" className="lp-section" style={{ background: '#FBFCFE' }}>
        <div className="lp-container">
          <div className="sec-head">
            <span className="eyebrow" style={{ background: '#EFF4FF', color: '#1D4ED8' }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: '#2563EB',
                  display: 'inline-block',
                }}
              />
              Nossos módulos
            </span>
            <h2>Soluções completas para cada etapa da sua adequação à LGPD</h2>
            <p>
              Tecnologia, metodologia e especialistas para gerar resultados reais — não apenas
              relatórios.
            </p>
          </div>

          <div className="modulos-grid">
            {[
              {
                bg: '#EAF1FF',
                fg: '#2563EB',
                icon: (
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="7" r="4" />
                    <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    <path d="M19 8l2 2-4 4-2-2z" />
                  </svg>
                ),
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
                bg: '#E4F7EE',
                fg: '#059669',
                icon: (
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4.5 16.5c-1.5 1.5-1 5 0 6 1 1 4.5 1.5 6 0L21 12 12 3l-7.5 13.5z" />
                    <path d="m12 15-3-3M15 12l-3-3M9 18l-3-3" />
                  </svg>
                ),
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
                bg: '#F0EAFE',
                fg: '#6D28D9',
                icon: (
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                    <path d="M21 19a2 2 0 0 1-2 2h-1v-6h3v4zM3 19a2 2 0 0 0 2 2h1v-6H3v4z" />
                  </svg>
                ),
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
              <div key={mod.title} className="mod-card">
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: mod.bg,
                    color: mod.fg,
                    display: 'grid',
                    placeItems: 'center',
                    marginBottom: 26,
                    flexShrink: 0,
                  }}
                >
                  {mod.icon}
                </div>
                <h3>{mod.title}</h3>
                <div
                  style={{
                    height: 3,
                    width: 36,
                    borderRadius: 3,
                    background: mod.fg,
                    margin: '4px 0 18px',
                    flexShrink: 0,
                  }}
                />
                <p
                  style={{
                    fontSize: '14.5px',
                    color: '#475569',
                    lineHeight: 1.65,
                    marginBottom: 22,
                  }}
                >
                  {mod.desc}
                </p>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: '0 0 28px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {mod.items.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        fontSize: 14,
                        color: '#0F172A',
                      }}
                    >
                      <CircleCheck bg={mod.bg} fg={mod.fg} />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        {item.bold && <strong style={{ fontWeight: 700 }}>{item.bold}</strong>}
                        {item.rest}
                      </span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 'auto' }}>
                  <Link
                    href="/register"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      padding: '13px 18px',
                      fontSize: 14,
                      fontWeight: 600,
                      borderRadius: 999,
                      border: `1.5px solid ${mod.btnClass}`,
                      color: mod.btnClass,
                      background: 'white',
                      textDecoration: 'none',
                    }}
                  >
                    Saiba mais
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-section" style={{ background: '#FBFCFE' }}>
        <div className="lp-container">
          <div className="cta-wrap">
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'radial-gradient(circle at 90% 10%, rgba(255,255,255,0.18), transparent 40%), radial-gradient(circle at 10% 100%, rgba(96,165,250,0.25), transparent 50%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative' }}>
              <h2
                style={{
                  fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
                  color: 'white',
                  fontSize: 'clamp(28px,3.4vw,40px)',
                  fontWeight: 800,
                  marginBottom: 12,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                Pronto para colocar a LGPD no piloto automático?
              </h2>
              <p style={{ color: '#C7D2EA', fontSize: '16.5px', maxWidth: 520 }}>
                Implementação em até 24h. Suporte especializado em português. Equipe certificada e
                plataforma 100% adequada à LGPD.
              </p>
            </div>
            <div className="cta-btns">
              <a
                href="https://wa.me/552422353709"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '11px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  borderRadius: 999,
                  background: 'white',
                  color: '#0B1B3D',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Solicitar demonstração <IconArrow />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        id="contato"
        style={{ background: '#0B1B3D', color: '#B7C2DA', padding: '72px 0 32px' }}
      >
        <div className="lp-container">
          <div className="foot-grid">
            <div>
              <Link href="/" aria-label="Serra Privacy">
                <Image
                  src="/logo-serra-privacy.png"
                  alt="Serra Privacy"
                  width={80}
                  height={80}
                  style={{
                    objectFit: 'contain',
                    height: 80,
                    width: 80,
                    opacity: 0.95,
                  }}
                />
              </Link>
              <p
                style={{
                  fontSize: 14,
                  color: '#B7C2DA',
                  lineHeight: 1.7,
                  margin: '16px 0 22px',
                  maxWidth: 320,
                }}
              >
                Plataforma inteligente de governança de dados — LGPD, IA e ESG em um único ambiente.
                Conformidade contínua e segura para empresas brasileiras.
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  {
                    label: 'LinkedIn',
                    href: 'https://br.linkedin.com/company/serralgpd',
                    svg: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14C2.2 0 0 2.2 0 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5V5c0-2.8-2.2-5-5-5zM8 19H5V8h3v11zM6.5 6.7c-1 0-1.7-.7-1.7-1.6S5.5 3.5 6.5 3.5s1.7.7 1.7 1.6-.7 1.6-1.7 1.6zM20 19h-3v-5.6c0-1.6-.6-2.4-1.7-2.4-1.4 0-2.1.9-2.1 2.4V19h-3V8h3v1.4c.5-.8 1.5-1.5 3.1-1.5 2.2 0 3.7 1.4 3.7 4.2V19z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Instagram',
                    href: 'https://instagram.com/serra_lgpd',
                    svg: (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                      </svg>
                    ),
                  },
                ].map(({ label, href, svg }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#B7C2DA',
                      display: 'grid',
                      placeItems: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    {svg}
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Produto', links: ['Funcionalidades', 'Módulos', 'Integrações', 'Roadmap'] },
              {
                title: 'Soluções',
                links: ['Para DPOs', 'Para Empresas', 'DPO as a Service'],
              },
              {
                title: 'Empresa',
                links: ['Sobre nós', 'Cases de sucesso', 'Contato'],
              },
            ].map((col) => (
              <div key={col.title}>
                <h5
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: 'white',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    margin: '8px 0 18px',
                  }}
                >
                  {col.title}
                </h5>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}
                >
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        style={{ color: '#B7C2DA', fontSize: 14, textDecoration: 'none' }}
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="foot-bottom">
            <span>© 2026 Serra Privacy. Todos os direitos reservados. CNPJ 00.000.000/0001-00</span>
            <div style={{ display: 'flex', gap: 22 }}>
              {['Privacidade', 'Termos', 'Cookies'].map((l) => (
                <a key={l} href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>
                  {l}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
