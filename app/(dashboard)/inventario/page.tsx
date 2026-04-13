import { Plus, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { getUserEmpresa } from '@/lib/supabase/queries'

const riscoVariant: Record<string, 'destructive' | 'warning' | 'success'> = {
  alto: 'destructive',
  medio: 'warning',
  baixo: 'success',
}

const statusVariant: Record<string, 'default' | 'secondary'> = {
  completo: 'default',
  rascunho: 'secondary',
}

export default async function InventarioPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { empresaId, supabase } = await getUserEmpresa()
  const { q } = await searchParams

  let query = supabase.from('inventario_dados').select('*').eq('empresa_id', empresaId ?? '')
  if (q) query = query.or(`nome_processo.ilike.%${q}%,tipo_dado.ilike.%${q}%,finalidade.ilike.%${q}%,base_legal.ilike.%${q}%,setor_responsavel.ilike.%${q}%`)

  const { data: inventario } = empresaId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const itens = inventario ?? []

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Inventário de Dados</h1>
          <p className="text-sm text-gray-500 mt-0.5">Mapeamento de dados pessoais tratados pela empresa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" /> Exportar
          </Button>
          <Link href="/inventario/novo">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" /> Novo
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <SearchInput defaultValue={q ?? ''} placeholder="Buscar por processo, finalidade, base legal, setor..." />
        </CardHeader>
        <CardContent className="p-0">
          {itens.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-medium">Nenhum registro cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">Clique em "+ Novo" para mapear dados pessoais</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Processo</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Setor</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Base Legal</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Risco</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {itens.map((item: any) => {
                      const nome = item.nome_processo || item.tipo_dado || '—'
                      const risco = item.nivel_risco ?? 'baixo'
                      const status = item.status_registro ?? 'rascunho'
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 font-medium text-gray-900 max-w-[200px] truncate">{nome}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs">{item.setor_responsavel ?? '—'}</td>
                          <td className="py-3 px-4 text-gray-600 text-xs max-w-[160px] truncate">{item.base_legal ?? '—'}</td>
                          <td className="py-3 px-4">
                            <Badge variant={riscoVariant[risco] ?? 'secondary'} className="capitalize">{risco}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={statusVariant[status] ?? 'secondary'} className="capitalize">{status}</Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link href={`/inventario/${item.id}`}><Button variant="ghost" size="sm">Editar</Button></Link>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {itens.map((item: any) => {
                  const nome = item.nome_processo || item.tipo_dado || '—'
                  const risco = item.nivel_risco ?? 'baixo'
                  const status = item.status_registro ?? 'rascunho'
                  return (
                    <div key={item.id} className="p-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-gray-900 text-sm">{nome}</p>
                        <Link href={`/inventario/${item.id}`}><Button variant="ghost" size="sm" className="h-7 text-xs">Editar</Button></Link>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant={riscoVariant[risco] ?? 'secondary'} className="capitalize text-xs">{risco}</Badge>
                        <Badge variant={statusVariant[status] ?? 'secondary'} className="capitalize text-xs">{status}</Badge>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        {item.setor_responsavel && <p><span className="font-medium">Setor:</span> {item.setor_responsavel}</p>}
                        {item.base_legal && <p><span className="font-medium">Base legal:</span> {item.base_legal}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
