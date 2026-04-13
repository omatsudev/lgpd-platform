import { Send, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { getUserEmpresa } from '@/lib/supabase/queries'

export default async function ColaboradoresPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { empresaId, supabase } = await getUserEmpresa()
  const { q } = await searchParams

  // Busca todos os treinamento_colaboradores da empresa via join
  const { data: treinamentosData } = empresaId
    ? await supabase
        .from('treinamentos')
        .select('id, treinamento_colaboradores(colaborador_nome, colaborador_email, colaborador_whatsapp, status)')
        .eq('empresa_id', empresaId)
    : { data: [] }

  // Agrupa colaboradores únicos (por email ou nome) e soma treinamentos
  const colaboradoresMap = new Map<string, {
    nome: string
    email: string | null
    whatsapp: string | null
    total: number
    concluidos: number
  }>()

  for (const t of (treinamentosData ?? [])) {
    for (const c of ((t as any).treinamento_colaboradores ?? [])) {
      const key = c.colaborador_email ?? c.colaborador_nome
      if (!colaboradoresMap.has(key)) {
        colaboradoresMap.set(key, {
          nome: c.colaborador_nome,
          email: c.colaborador_email,
          whatsapp: c.colaborador_whatsapp,
          total: 0,
          concluidos: 0,
        })
      }
      const col = colaboradoresMap.get(key)!
      col.total += 1
      if (c.status === 'concluido') col.concluidos += 1
    }
  }

  const todos = Array.from(colaboradoresMap.values())
  const colaboradores = q
    ? todos.filter(c =>
        c.nome.toLowerCase().includes(q.toLowerCase()) ||
        c.email?.toLowerCase().includes(q.toLowerCase())
      )
    : todos

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Colaboradores cadastrados nos treinamentos</p>
        </div>
      </div>

      <SearchInput defaultValue={q ?? ''} placeholder="Buscar por nome ou email..." />

      {colaboradores.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-500 font-medium">Nenhum colaborador cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">Adicione colaboradores em um treinamento para vê-los aqui</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <UserCheck className="h-5 w-5 text-blue-600" /> Lista de Colaboradores
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Nome</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">WhatsApp</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Treinamentos</th>
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {colaboradores.map((c, i) => {
                    const completo = c.concluidos === c.total && c.total > 0
                    const parcial = c.concluidos > 0
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{c.nome}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{c.email ?? '—'}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{c.whatsapp ?? '—'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={completo ? 'success' : parcial ? 'warning' : 'secondary'}>
                            {c.concluidos}/{c.total}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="outline" size="sm" className="gap-1" disabled>
                            <Send className="h-3 w-3" /> WhatsApp
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden grid gap-3">
            {colaboradores.map((c, i) => {
              const completo = c.concluidos === c.total && c.total > 0
              const parcial = c.concluidos > 0
              return (
                <Card key={i}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="font-medium text-gray-900">{c.nome}</p>
                        {c.email && <p className="text-xs text-gray-500 truncate">{c.email}</p>}
                        {c.whatsapp && <p className="text-xs text-gray-500">{c.whatsapp}</p>}
                        <Badge variant={completo ? 'success' : parcial ? 'warning' : 'secondary'}>
                          {c.concluidos}/{c.total} treinamentos
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" className="flex-shrink-0" disabled>
                        <Send className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
