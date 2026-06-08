import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  light?: boolean
}

export function Logo({ className = '', width = 148, light = false }: LogoProps) {
  const height = width
  return (
    <Image
      src="/logo-serra-privacy.png"
      alt="Serra Privacy"
      width={width}
      height={height}
      className={`object-contain${light ? ' brightness-0 invert opacity-80' : ''}${className ? ` ${className}` : ''}`}
      priority
    />
  )
}
