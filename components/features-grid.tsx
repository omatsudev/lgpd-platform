'use client'

import { useState } from 'react'

const features = [
  {
    bg: '#EFF6FF', fg: '#1D4ED8',
    title: 'Checklist LGPD',
    desc: 'Acompanhe o progresso da adequação com checklists estruturados por categoria.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  },
  {
    bg: '#E0F2FE', fg: '#0284C7',
    title: 'Cookies & Adequação de Sites',
    desc: 'Garanta que seu site esteja conforme a LGPD com gestão eficiente de cookies.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></svg>,
  },
  {
    bg: '#EAF1FF', fg: '#2563EB',
    title: 'Data Mapping Pro',
    desc: 'Mapeie, organize e visualize os dados da sua empresa com total controle.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><rect x="7" y="13" width="3" height="5" /><rect x="12" y="9" width="3" height="9" /><rect x="17" y="5" width="3" height="13" /></svg>,
  },
  {
    bg: '#FFF7ED', fg: '#C2410C',
    title: 'Retenção e Descarte',
    desc: 'Defina políticas de retenção e descarte de dados com rastreabilidade completa.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>,
  },
  {
    bg: '#FEF9C3', fg: '#A16207',
    title: 'Gestão de Riscos',
    desc: 'Identifique, avalie e mitigue riscos de privacidade com matriz de probabilidade e impacto.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17v.5" /></svg>,
  },
  {
    bg: '#F0FDF4', fg: '#15803D',
    title: 'Relatório LGPD',
    desc: 'Gere relatórios executivos e técnicos sobre o nível de conformidade da organização.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
  },
  {
    bg: '#FDE7EE', fg: '#E11D48',
    title: 'Gestão de Incidentes',
    desc: 'Registre, acompanhe e responda incidentes com rapidez e controle.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16v.5" /></svg>,
  },
  {
    bg: '#FEF1CD', fg: '#B45309',
    title: 'Governança de Documentos',
    desc: 'Centralize e organize documentos essenciais da sua estrutura de compliance.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" /></svg>,
  },
  {
    bg: '#D7F4F0', fg: '#0F766E',
    title: 'ConsentFlow',
    desc: 'Gerencie consentimentos de forma simples, rastreável e automatizada.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" /><path d="m9 14 2 2 4-4" /></svg>,
  },
  {
    bg: '#FFEDDF', fg: '#EA580C',
    title: 'Due Diligence',
    desc: 'Avalie riscos e parceiros com mais segurança e padronização.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>,
  },
  {
    bg: '#E4F7EE', fg: '#059669',
    title: 'Academy LGPD',
    desc: 'Capacite sua equipe de forma prática, automatizada e em conformidade com a lei.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10 12 5 2 10l10 5 10-5z" /><path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" /></svg>,
  },
  {
    bg: '#FFE4E6', fg: '#BE123C',
    title: 'Canal de Denúncias',
    desc: 'Receba relatos com sigilo e fortaleça a integridade da sua organização.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l18-8-4 18-4-8-10-2z" /></svg>,
  },
  {
    bg: '#F0EAFE', fg: '#6D28D9',
    title: 'Direitos dos Titulares',
    desc: 'Gerencie solicitações de titulares com agilidade e segurança jurídica.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="m17 11 2 2 4-4" /></svg>,
  },
  {
    bg: '#F5F3FF', fg: '#5B21B6',
    title: 'Logs de Auditoria',
    desc: 'Mantenha rastreabilidade total das ações realizadas na plataforma para fins de auditoria.',
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="8" y1="9" x2="10" y2="9" /></svg>,
  },
]

const VISIBLE_DEFAULT = 9

export function FeaturesGrid() {
  const [expanded, setExpanded] = useState(false)
  const visible = expanded ? features : features.slice(0, VISIBLE_DEFAULT)

  return (
    <div>
      <div className="features-grid">
        {visible.map((feat) => (
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

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 24px',
            borderRadius: 999,
            border: '1.5px solid #E2E8F0',
            background: 'white',
            color: '#334155',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'var(--font-jakarta,"Plus Jakarta Sans",sans-serif)',
          }}
        >
          {expanded ? 'Ver menos' : 'Ver mais funcionalidades'}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
