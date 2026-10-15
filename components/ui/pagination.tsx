import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

function hrefFor(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  if (page > 1) search.set('page', String(page))
  const qs = search.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number
  totalPages: number
  basePath: string
  params?: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
      <p className="text-xs text-gray-500">
        Página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(basePath, params, page - 1)}>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-3.5 w-3.5" /> Anterior
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </Button>
        )}
        {page < totalPages ? (
          <Link href={hrefFor(basePath, params, page + 1)}>
            <Button variant="outline" size="sm">
              Próxima <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Próxima <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
