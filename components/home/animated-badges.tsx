'use client'

import { useEffect, useState } from 'react'

const BADGES = ['LGPD', 'IA', 'ESG']

export function AnimatedBadges() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % BADGES.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
      {BADGES.map((tag, i) => (
        <span
          key={tag}
          className="px-4 py-1.5 rounded-sm text-xs font-bold tracking-widest transition-all duration-500"
          style={
            i === active
              ? { background: 'rgba(255,255,255,0.9)', color: '#0f2d5e', transform: 'scale(1.08)' }
              : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }
          }
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
