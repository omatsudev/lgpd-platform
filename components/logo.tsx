interface LogoProps {
  className?: string
  width?: number
  light?: boolean
}

export function Logo({ className = '', width = 148, light = false }: LogoProps) {
  // viewBox proportions: 296 x 118
  const height = Math.round(width * 118 / 296)
  const textColor = light ? '#a8d4f5' : '#1535b5'
  const lockColor = light ? '#90c8e8' : '#5aaee0'

  return (
    <svg
      viewBox="0 0 296 118"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Serra Privacy"
      className={className}
    >
      <defs>
        <linearGradient id={light ? 'barL' : 'barD'} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={light ? '#0a1a4a' : '#08080f'} />
          <stop offset="100%" stopColor={light ? '#1a3a9e' : '#1a1a7a'} />
        </linearGradient>
      </defs>

      {/* ── SERRA ── */}
      <text
        x="2" y="62"
        fontFamily="'Arial Black', 'Arial', sans-serif"
        fontWeight="900"
        fontSize="64"
        fill={textColor}
        letterSpacing="-1"
      >
        SERRA
      </text>

      {/* ── privacy ── */}
      <text
        x="2" y="100"
        fontFamily="'Arial Black', 'Arial', sans-serif"
        fontWeight="900"
        fontSize="38"
        fill={textColor}
        letterSpacing="1"
      >
        privacy
      </text>

      {/* ── Gradient bar ── */}
      <rect x="2" y="107" width="232" height="7" rx="3.5" fill={`url(#${light ? 'barL' : 'barD'})`} />

      {/* ── Cyan circle ── */}
      <circle cx="248" cy="111" r="13" fill="#00cece" />
      {/* Mini lock inside circle */}
      <rect x="241" y="112" width="14" height="10" rx="2.5" fill={lockColor} />
      <path d="M243.5 112 L243.5 108.5 Q243.5 105 248 105 Q252.5 105 252.5 108.5 L252.5 112"
        stroke={lockColor} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* ── Open padlock (top-right) ── */}
      {/* Lock body */}
      <rect x="210" y="30" width="62" height="52" rx="10" fill={lockColor} />
      {/* Keyhole */}
      <circle cx="241" cy="51" r="9" fill="white" fillOpacity="0.55" />
      <rect x="237.5" y="56" width="7" height="13" rx="3" fill="white" fillOpacity="0.55" />
      {/* Open shackle — right arm in body, left arm lifted */}
      {/* Right arm (still in body) */}
      <line x1="258" y1="30" x2="258" y2="14" stroke={lockColor} strokeWidth="11" strokeLinecap="round" />
      {/* Arch */}
      <path d="M258 14 Q258 2 241 2 Q224 2 224 14" stroke={lockColor} strokeWidth="11" strokeLinecap="round" fill="none" />
      {/* Left arm lifted (open — gap from body) */}
      <line x1="224" y1="14" x2="224" y2="22" stroke={lockColor} strokeWidth="11" strokeLinecap="round" />
      {/* Shackle highlight */}
      <path d="M258 14 Q258 4 241 4 Q224 4 224 14"
        stroke="white" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  )
}
