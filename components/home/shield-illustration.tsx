export function ShieldIllustration() {
  return (
    <svg
      viewBox="0 0 220 260"
      width="260"
      height="300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Shield gradient — cyan top to deep blue bottom */}
        <linearGradient
          id="shieldGrad"
          x1="110"
          y1="0"
          x2="110"
          y2="260"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4dd9f0" />
          <stop offset="50%" stopColor="#0097c4" />
          <stop offset="100%" stopColor="#005f8a" />
        </linearGradient>
        {/* Shield highlight */}
        <linearGradient
          id="shieldHighlight"
          x1="60"
          y1="10"
          x2="110"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="white" stopOpacity="0.25" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
        {/* Lock body gradient — gold */}
        <linearGradient
          id="lockGold"
          x1="85"
          y1="130"
          x2="135"
          y2="210"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#f5c842" />
          <stop offset="100%" stopColor="#c98b00" />
        </linearGradient>
        {/* Lock shackle */}
        <linearGradient
          id="shackleGrad"
          x1="85"
          y1="80"
          x2="135"
          y2="140"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#d0eaf5" />
          <stop offset="100%" stopColor="#8bbdd6" />
        </linearGradient>
        {/* Drop shadow */}
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#003a5c" floodOpacity="0.45" />
        </filter>
        <filter id="lockShadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#7a5a00" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Shield shape */}
      <path
        d="M110 8 L196 44 L196 128 C196 178 158 220 110 244 C62 220 24 178 24 128 L24 44 Z"
        fill="url(#shieldGrad)"
        filter="url(#shadow)"
      />
      {/* Inner highlight overlay */}
      <path
        d="M110 8 L196 44 L196 128 C196 178 158 220 110 244 C62 220 24 178 24 128 L24 44 Z"
        fill="url(#shieldHighlight)"
      />
      {/* Shield rim / border */}
      <path
        d="M110 8 L196 44 L196 128 C196 178 158 220 110 244 C62 220 24 178 24 128 L24 44 Z"
        stroke="white"
        strokeOpacity="0.2"
        strokeWidth="2"
        fill="none"
      />

      {/* Padlock shackle (arc) */}
      <path
        d="M80 138 L80 114 A30 30 0 0 1 140 114 L140 138"
        stroke="url(#shackleGrad)"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
        filter="url(#lockShadow)"
      />
      {/* Shackle highlight */}
      <path
        d="M80 138 L80 114 A30 30 0 0 1 140 114 L140 138"
        stroke="white"
        strokeOpacity="0.3"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Lock body */}
      <rect
        x="68"
        y="133"
        width="84"
        height="72"
        rx="10"
        fill="url(#lockGold)"
        filter="url(#lockShadow)"
      />
      {/* Lock body top highlight */}
      <rect x="68" y="133" width="84" height="20" rx="10" fill="white" fillOpacity="0.18" />
      {/* Keyhole circle */}
      <circle cx="110" cy="164" r="12" fill="#7a5a00" fillOpacity="0.6" />
      <circle cx="110" cy="164" r="9" fill="#5a4000" fillOpacity="0.5" />
      {/* Keyhole slot */}
      <rect x="106" y="168" width="8" height="14" rx="3" fill="#5a4000" fillOpacity="0.6" />
    </svg>
  )
}
