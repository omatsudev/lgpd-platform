'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const ASSUNTOS = [
  'Quero adequar meu site à LGPD',
  'Maiores informações sobre os módulos',
  'Gostaria de conhecer a plataforma (demonstração)',
  'Tenho interesse em parceria',
  'Preciso de apoio / ambiente demonstrativo',
]

export default function ContatoPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    site_empresa: '',
    assunto: '',
    aceite_comercial: false,
    aceite_privacidade: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'telefone' ? formatPhone(value) : value,
    }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.nome.trim()) errs.nome = 'Nome é obrigatório'
    if (!form.email.trim()) errs.email = 'E-mail é obrigatório'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'E-mail inválido'
    if (!form.telefone.trim()) errs.telefone = 'Telefone é obrigatório'
    if (!form.cargo.trim()) errs.cargo = 'Cargo é obrigatório'
    if (!form.assunto) errs.assunto = 'Selecione um assunto'
    if (!form.aceite_privacidade) errs.aceite_privacidade = 'Aceite obrigatório'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const data = await res.json()
        setErrors({ submit: data.error || 'Erro ao enviar. Tente novamente.' })
      }
    } catch {
      setErrors({ submit: 'Erro de conexão. Tente novamente.' })
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    fontSize: 15,
    borderRadius: 12,
    border: '1.5px solid #E2E8F0',
    background: '#F8FAFC',
    color: '#0F172A',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 4,
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 14,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 6,
  }

  return (
    <div
      style={{
        fontFamily: 'var(--font-inter, Inter, system-ui, sans-serif)',
        color: '#475569',
        background: '#fff',
        WebkitFontSmoothing: 'antialiased',
        minHeight: '100vh',
      }}
    >
      <style>{`
        .contato-grid {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 64px;
          align-items: start;
          max-width: 1100px;
          margin: 0 auto;
          padding: 64px 24px 80px;
        }
        @media (max-width: 768px) {
          .contato-grid {
            grid-template-columns: 1fr;
            gap: 40px;
            padding: 32px 18px 56px;
          }
        }
        .contato-input:focus {
          border-color: #2563EB !important;
        }
      `}</style>

      {/* Nav simples */}
      <nav
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'saturate(180%) blur(10px)',
          borderBottom: '1px solid #EEF1F6',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <Image
              src="/logo-serra-privacy.png"
              alt="Serra Privacy"
              width={64}
              height={64}
              style={{ objectFit: 'contain', height: 64, width: 'auto' }}
              priority
            />
          </Link>
          <Link
            href="/"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#334155',
              textDecoration: 'none',
              padding: '8px 16px',
              borderRadius: 999,
              border: '1px solid #E2E8F0',
            }}
          >
            Voltar ao site
          </Link>
        </div>
      </nav>

      <div className="contato-grid">
        {/* Lado esquerdo — info */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",system-ui,sans-serif)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 800,
              color: '#0B1B3D',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}
          >
            Solicite sua demonstração com os nossos profissionais
          </h1>
          <p style={{ fontSize: 17, color: '#475569', lineHeight: 1.7, marginBottom: 40, maxWidth: 440 }}>
            Um dos nossos especialistas entrará em contato e apresentará os recursos de acordo com as
            necessidades da sua organização.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <a
              href="mailto:serralgpd@serraprivacy.com.br"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textDecoration: 'none',
                color: '#334155',
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#EAF1FF',
                  color: '#2563EB',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              serralgpd@serraprivacy.com.br
            </a>

            <a
              href="tel:+552422353709"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textDecoration: 'none',
                color: '#334155',
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#E4F7EE',
                  color: '#059669',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.37 1.61.68 2.38a2 2 0 0 1-.45 2.11L8.09 9.45a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.77.31 1.57.55 2.38.68A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              (24) 2235-3709
            </a>

            <a
              href="https://wa.me/552422353709"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                textDecoration: 'none',
                color: '#334155',
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: '#DCFCE7',
                  color: '#16A34A',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              WhatsApp disponível
            </a>
          </div>
        </div>

        {/* Lado direito — formulário */}
        <div>
          {success ? (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 20,
                padding: '48px 36px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  background: '#DCFCE7',
                  color: '#16A34A',
                  display: 'grid',
                  placeItems: 'center',
                  margin: '0 auto 20px',
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m5 13 4 4L19 7" />
                </svg>
              </div>
              <h2
                style={{
                  fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",system-ui,sans-serif)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: '#0F172A',
                  marginBottom: 10,
                }}
              >
                Recebemos sua solicitação!
              </h2>
              <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.6 }}>
                Um especialista Serra Privacy entrará em contato em breve.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: 'white',
                border: '1px solid #EEF1F6',
                borderRadius: 20,
                padding: '36px 32px',
                boxShadow: '0 4px 24px -8px rgba(15,23,42,0.08)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={labelStyle}>Nome completo *</label>
                  <input
                    className="contato-input"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    style={{ ...inputStyle, borderColor: errors.nome ? '#DC2626' : '#E2E8F0' }}
                    placeholder="Seu nome completo"
                  />
                  {errors.nome && <div style={errorStyle}>{errors.nome}</div>}
                </div>

                <div>
                  <label style={labelStyle}>E-mail corporativo *</label>
                  <input
                    className="contato-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    style={{ ...inputStyle, borderColor: errors.email ? '#DC2626' : '#E2E8F0' }}
                    placeholder="seu@empresa.com.br"
                  />
                  {errors.email && <div style={errorStyle}>{errors.email}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Telefone / WhatsApp *</label>
                  <input
                    className="contato-input"
                    name="telefone"
                    type="tel"
                    value={form.telefone}
                    onChange={handleChange}
                    style={{ ...inputStyle, borderColor: errors.telefone ? '#DC2626' : '#E2E8F0' }}
                    placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && <div style={errorStyle}>{errors.telefone}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Cargo *</label>
                  <input
                    className="contato-input"
                    name="cargo"
                    value={form.cargo}
                    onChange={handleChange}
                    style={{ ...inputStyle, borderColor: errors.cargo ? '#DC2626' : '#E2E8F0' }}
                    placeholder="Ex: DPO, Gestor de TI, CEO"
                  />
                  {errors.cargo && <div style={errorStyle}>{errors.cargo}</div>}
                </div>

                <div>
                  <label style={labelStyle}>Site da empresa</label>
                  <input
                    className="contato-input"
                    name="site_empresa"
                    type="url"
                    value={form.site_empresa}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="https://suaempresa.com.br"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Assunto *</label>
                  <select
                    name="assunto"
                    value={form.assunto}
                    onChange={handleChange}
                    style={{
                      ...inputStyle,
                      borderColor: errors.assunto ? '#DC2626' : '#E2E8F0',
                      cursor: 'pointer',
                      appearance: 'none',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2.5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      paddingRight: 40,
                    }}
                  >
                    <option value="">Selecione um motivo</option>
                    {ASSUNTOS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                  {errors.assunto && <div style={errorStyle}>{errors.assunto}</div>}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 4 }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="aceite_comercial"
                      checked={form.aceite_comercial}
                      onChange={handleChange}
                      style={{ marginTop: 3, width: 18, height: 18, accentColor: '#2563EB', flexShrink: 0 }}
                    />
                    Concordo em receber contato comercial da Serra Privacy.
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="aceite_privacidade"
                      checked={form.aceite_privacidade}
                      onChange={handleChange}
                      style={{ marginTop: 3, width: 18, height: 18, accentColor: '#2563EB', flexShrink: 0 }}
                    />
                    <span>
                      Informo meus dados conforme as diretrizes da{' '}
                      <a
                        href="/docs/aviso_de_privacidade_serra_privacy.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2563EB', textDecoration: 'underline' }}
                      >
                        Política de Privacidade
                      </a>
                      . *
                    </span>
                  </label>
                  {errors.aceite_privacidade && <div style={errorStyle}>{errors.aceite_privacidade}</div>}
                </div>

                {errors.submit && (
                  <div
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 10,
                      padding: '12px 16px',
                      fontSize: 14,
                      color: '#DC2626',
                    }}
                  >
                    {errors.submit}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !form.aceite_privacidade}
                  style={{
                    width: '100%',
                    padding: '14px 24px',
                    fontSize: 15,
                    fontWeight: 700,
                    borderRadius: 999,
                    border: 'none',
                    background:
                      submitting || !form.aceite_privacidade
                        ? '#CBD5E1'
                        : 'linear-gradient(135deg, #1D4ED8, #2563EB 60%, #3B82F6)',
                    color: '#fff',
                    cursor: submitting || !form.aceite_privacidade ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow:
                      submitting || !form.aceite_privacidade
                        ? 'none'
                        : '0 6px 16px -6px rgba(37,99,235,0.5)',
                    transition: 'all 0.2s',
                  }}
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                  {!submitting && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
