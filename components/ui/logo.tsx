import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'image' | 'text'
  href?: string
}

export function Logo({ size = 'md', variant = 'text', href = '/' }: LogoProps) {
  const sizes = {
    sm: { w: 36, h: 36 },
    md: { w: 50, h: 50 },
    lg: { w: 72, h: 72 },
  }

  const content =
    variant === 'image' ? (
      <Image
        src="/logo-serra-privacy.png"
        alt="Serra Privacy"
        width={sizes[size].w}
        height={sizes[size].h}
        className="object-contain"
        priority
      />
    ) : (
      <div className="flex flex-col leading-none">
        <span
          style={{ color: 'white', fontWeight: 900, letterSpacing: '0.05em' }}
          className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-3xl'}
        >
          SERRA
        </span>
        <span
          style={{ color: '#00bcd4', fontStyle: 'italic', fontWeight: 600 }}
          className={size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-2xl'}
        >
          privacy
        </span>
      </div>
    )

  return (
    <Link href={href} className="inline-flex items-center">
      {content}
    </Link>
  )
}
