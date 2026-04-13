import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDateTime } from '@/lib/utils'
import { SearchInput } from '@/components/ui/search-input'
import { getUserEmpresa } from '@/lib/supabase/queries'

const statusMap: Record<string, { label: string; variant: 'warning' | 'default' | 'success' }> = {
  recebido: { label: 'Recebido', variant: 'warning' },
  em_analise: { label: 'Em análise', variant: 'default' },
  resolvido: { label: 'Resolvido', variant: 'success' },
}

export default async function DenunciasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { empresa, empresaId, supabase } = await getUserEmpresa()
  const { q } = await searchParams

  let query = supabase.from('denuncias').select('*').eq('empresa_id', empresaId ?? '')
  if (q) query = query.or(`tipo.ilike.%${q}%,descricao.ilike.%${q}%,nome.ilike.%${q}%`)

  const { data: denuncias } = empresaId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = denuncias ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Canal de Denúncias</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie as denúncias recebidas pelo canal público</p>
        </div>
        {empresa?.slug && (
          <Button variant="outline" size="sm" asChild>
            <a href={`/lgpd/${empresa.slug}#denuncia`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1" /> Canal público
            </a>
          </Button>
        )}
      </div>

      <SearchInput defaultValue={q ?? ''} placeholder="Buscar por tipo, descrição..." />

      {itens.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-500 font-medium">Nenhuma denúncia recebida</p>
            <p className="text-sm text-gray-400 mt-1">As denúncias chegam pelo canal público da empresa</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {itens.map((d: any) => {
            const status = statusMap[d.status] ?? { label: d.status, variant: 'secondary' as const }
            return (
              <Card key={d.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-gray-900">{d.tipo}</span>
                        <Badge variant="secondary">{d.anonimo ? 'Anônimo' : d.nome ?? 'Identificado'}</Badge>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2">{d.descricao}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(d.created_at)}</p>
                    </div>
                    <Link href={`/denuncias/${d.id}`} className="flex-shrink-0">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">Ver detalhes</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
