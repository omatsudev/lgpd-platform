import { Lock } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  light?: boolean
}

const sizes = {
  sm: { text1: 'text-lg', text2: 'text-sm', icon: 16, gap: 'gap-0.5' },
  md: { text1: 'text-2xl', text2: 'text-base', icon: 20, gap: 'gap-0.5' },
  lg: { text1: 'text-3xl', text2: 'text-xl', icon: 24, gap: 'gap-1' },
}

export function Logo({ className = '', size = 'md', light = false }: LogoProps) {
  const s = sizes[size]
  const color = light ? '#e0f7fa' : '#0f2d5e'
  return (
    <div className={`inline-flex flex-col items-start leading-none ${className}`}>
      <div className={`flex items-center ${s.gap}`}>
        <span className={`font-black tracking-tight ${s.text1}`} style={{ color }}>
          SERRA
        </span>
        <Lock style={{ color, marginTop: -2 }} size={s.icon} strokeWidth={2.5} />
      </div>
      <span className={`font-semibold tracking-widest ${s.text2}`} style={{ color, marginTop: -2 }}>
        privacy
      </span>
    </div>
  )
}
