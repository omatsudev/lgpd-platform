import { Plus, Send } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'

export default async function TreinamentosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { companyId, supabase } = await getUserCompany()
  const { q } = await searchParams

  let query = supabase
    .from('trainings')
    .select('*, training_employees(status)')
    .eq('company_id', companyId ?? '')
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

  const { data } = companyId
    ? await query.order('created_at', { ascending: false })
    : { data: [] }

  const treinamentos = (data ?? []).map((t: any) => {
    const colabs = t.training_employees ?? []
    return {
      ...t,
      total_colaboradores: colabs.length,
      concluidos: colabs.filter((c: any) => c.status === 'completed').length,
      em_andamento: colabs.filter((c: any) => c.status === 'in_progress').length,
      nao_iniciados: colabs.filter((c: any) => c.status === 'not_started').length,
    }
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Treinamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gerencie treinamentos e acompanhe colaboradores</p>
        </div>
        <Link href="/treinamentos/novo">
          <Button><Plus className="h-4 w-4 mr-1" /> Novo Treinamento</Button>
        </Link>
      </div>

      <SearchInput defaultValue={q ?? ''} placeholder="Buscar por título ou descrição..." />

      {treinamentos.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-500 font-medium">Nenhum treinamento cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">Clique em "+ Novo Treinamento" para começar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {treinamentos.map((t: any) => {
            const progresso = t.total_colaboradores > 0 ? Math.round((t.concluidos / t.total_colaboradores) * 100) : 0
            return (
              <Card key={t.id}>
                <CardContent className="pt-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{t.title}</h3>
                      {t.description && <p className="text-sm text-gray-500">{t.description}</p>}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="success">{t.concluidos} concluídos</Badge>
                        <Badge variant="warning">{t.em_andamento} em andamento</Badge>
                        <Badge variant="secondary">{t.nao_iniciados} não iniciados</Badge>
                      </div>
                      {t.total_colaboradores > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progresso geral</span>
                            <span>{progresso}%</span>
                          </div>
                          <Progress value={progresso} />
                        </div>
                      )}
                    </div>
                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none" disabled>
                        <Send className="h-3 w-3 mr-1" /> WhatsApp
                      </Button>
                      <Link href={`/treinamentos/${t.id}`} className="flex-1 sm:flex-none">
                        <Button size="sm" className="w-full">Gerenciar</Button>
                      </Link>
                    </div>
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
