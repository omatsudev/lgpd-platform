'use client'

import { Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Input } from './input'

export function SearchInput({
  defaultValue = '',
  placeholder = 'Buscar...',
}: {
  defaultValue?: string
  placeholder?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [value, setValue] = useState(defaultValue)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams()
      if (newValue) params.set('q', newValue)
      router.replace(`${pathname}${params.toString() ? '?' + params.toString() : ''}`)
    }, 400)
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      <Input value={value} onChange={handleChange} placeholder={placeholder} className="pl-9" />
    </div>
  )
}
