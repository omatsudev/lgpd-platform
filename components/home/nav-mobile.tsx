'use client'

import { useState } from 'react'
import Link from 'next/link'

const links = [
  { label: 'Início', href: '#' },
  { label: 'Produtos', href: '#features' },
  { label: 'Soluções', href: '#modulos' },
  { label: 'Sobre nós', href: '#sobre' },
  { label: 'Contato', href: '#contato' },
  { label: 'Login', href: '/login' },
]

export function NavMobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="nav-hamburger"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            borderBottom: '1px solid #EEF1F6',
            boxShadow: '0 8px 24px -8px rgba(15,23,42,0.15)',
            zIndex: 100,
          }}
        >
          {links.map((l) =>
            l.href.startsWith('/') ? (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '15px 24px',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 500,
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'block',
                  padding: '15px 24px',
                  color: '#334155',
                  textDecoration: 'none',
                  fontSize: 16,
                  fontWeight: 500,
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                {l.label}
              </a>
            ),
          )}
        </div>
      )}
    </>
  )
}
