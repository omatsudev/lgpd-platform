'use client'

import { useEffect, useState } from 'react'

type Pref = 'accepted' | 'rejected' | null

export function CookieBanner() {
  const [pref, setPref] = useState<Pref | undefined>(undefined)
  const [showConfig, setShowConfig] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cookie-consent') as Pref
    setPref(stored ?? null)
  }, [])

  function accept() {
    localStorage.setItem('cookie-consent', 'accepted')
    setPref('accepted')
  }

  function reject() {
    localStorage.setItem('cookie-consent', 'rejected')
    setPref('rejected')
  }

  // undefined = loading (server / before hydration) → render nothing
  if (pref !== null) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferências de cookies"
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: '#1a4fd6',
        color: '#fff',
        borderRadius: 12,
        padding: '28px 28px 20px',
        maxWidth: 440,
        width: 'calc(100vw - 32px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
        fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
      }}
    >
      {!showConfig ? (
        <>
          <p style={{ fontSize: 15, lineHeight: 1.65, margin: '0 0 20px' }}>
            Nós coletamos cookies para oferecer um serviço personalizado. Utilize as opções abaixo
            para configurar suas preferências quanto à coleta de cookies. Consulte também nosso{' '}
            <a
              href="/docs/aviso_de_privacidade_serra_privacy.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#fff', fontWeight: 600, textUnderlineOffset: 3 }}
            >
              Aviso de Privacidade
            </a>
            .
          </p>

          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <button
              onClick={reject}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Rejeitar
            </button>
            <button
              onClick={accept}
              style={{
                flex: 1,
                padding: '11px 0',
                borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.6)',
                background: 'rgba(255,255,255,0.12)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Aceitar
            </button>
          </div>

          <button
            onClick={() => setShowConfig(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 13,
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Configurar Cookies
          </button>
        </>
      ) : (
        <>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700 }}>Configurar Cookies</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {[
              { id: 'essential', label: 'Essenciais', desc: 'Necessários para o funcionamento do site.', fixed: true },
              { id: 'analytics', label: 'Analíticos', desc: 'Nos ajudam a entender como você usa o site.', fixed: false },
              { id: 'marketing', label: 'Marketing', desc: 'Usados para personalizar anúncios.', fixed: false },
            ].map((c) => (
              <label key={c.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: c.fixed ? 'not-allowed' : 'pointer' }}>
                <input
                  type="checkbox"
                  defaultChecked={c.fixed}
                  disabled={c.fixed}
                  style={{ marginTop: 3, accentColor: '#fff', width: 15, height: 15 }}
                />
                <span>
                  <strong style={{ fontSize: 14 }}>{c.label}</strong>
                  {c.fixed && <span style={{ fontSize: 11, marginLeft: 6, opacity: 0.7 }}>Sempre ativo</span>}
                  <br />
                  <span style={{ fontSize: 12, opacity: 0.75 }}>{c.desc}</span>
                </span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={reject}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.5)',
                background: 'transparent', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              Rejeitar todos
            </button>
            <button
              onClick={accept}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                border: 'none', background: '#fff', color: '#1a4fd6', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              Salvar preferências
            </button>
          </div>
        </>
      )}
    </div>
  )
}
