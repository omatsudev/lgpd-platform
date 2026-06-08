'use client'

export function CookiesResetButton() {
  return (
    <button
      onClick={() => {
        localStorage.removeItem('cookie-consent')
        window.location.reload()
      }}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        color: '#94A3B8',
        cursor: 'pointer',
        fontSize: 'inherit',
        fontFamily: 'inherit',
      }}
    >
      Cookies
    </button>
  )
}
