import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  light?: boolean
}

export function Logo({ className = '', width = 148, light = false }: LogoProps) {
  const height = Math.round(width * 720 / 1122)
  return (
    <Image
      src="/logo-transparent.png"
      alt="Serra Privacy"
      width={width}
      height={height}
      className={`object-contain${light ? ' brightness-0 invert opacity-80' : ''}${className ? ` ${className}` : ''}`}
      priority
    />
  )
}
