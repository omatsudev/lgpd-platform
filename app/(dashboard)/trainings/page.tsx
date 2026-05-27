import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { Plus, Send, Users } from 'lucide-react'
import Link from 'next/link'

export default async function TreinamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; aba?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q, aba = 'trainings' } = await searchParams

  let query = supabase
    .from('trainings')
    .select('*, training_employees(status)')
    .eq('company_id', companyId ?? '')
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)

  const { data } = companyId ? await query.order('created_at', { ascending: false }) : { data: [] }

  const trainings = (data ?? []).map((t: any) => {
    const colabs = t.training_employees ?? []
    return {
      ...t,
      total_colaboradores: colabs.length,
      concluidos: colabs.filter((c: any) => c.status === 'completed').length,
      em_andamento: colabs.filter((c: any) => c.status === 'in_progress').length,
      nao_iniciados: colabs.filter((c: any) => c.status === 'not_started').length,
    }
  })

  // Dados de colaboradores para a aba
  const { data: trainingCollaborators } = companyId
    ? await supabase
        .from('trainings')
        .select('id, training_employees(employee_name, employee_email, employee_whatsapp, status)')
        .eq('company_id', companyId)
    : { data: [] }

  const colaboradoresMap = new Map<
    string,
    {
      name: string
      email: string | null
      whatsapp: string | null
      total: number
      completed: number
    }
  >()
  for (const t of trainingCollaborators ?? []) {
    for (const c of (t as any).training_employees ?? []) {
      const key = c.employee_email ?? c.employee_name
      if (!colaboradoresMap.has(key)) {
        colaboradoresMap.set(key, {
          name: c.employee_name,
          email: c.employee_email,
          whatsapp: c.employee_whatsapp,
          total: 0,
          completed: 0,
        })
      }
      const col = colaboradoresMap.get(key)!
      col.total += 1
      if (c.status === 'completed') col.completed += 1
    }
  }
  const colaboradores = Array.from(colaboradoresMap.values()).filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.email?.toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Treinamentos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gerencie treinamentos e acompanhe colaboradores
          </p>
        </div>
        {aba === 'trainings' && (
          <Link href="/trainings/novo">
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Novo Treinamento
            </Button>
          </Link>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { key: 'trainings', label: `Treinamentos (${trainings.length})` },
          { key: 'colaboradores', label: `Colaboradores (${colaboradoresMap.size})`, icon: Users },
        ].map((tab) => (
          <Link
            key={tab.key}
            href={`/trainings?aba=${tab.key}${q ? `&q=${q}` : ''}`}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              aba === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon && <tab.icon className="h-3.5 w-3.5" />}
            {tab.label}
          </Link>
        ))}
      </div>

      <SearchInput
        defaultValue={q ?? ''}
        placeholder={
          aba === 'colaboradores'
            ? 'Buscar por nome ou email...'
            : 'Buscar por título ou descrição...'
        }
      />

      {aba === 'trainings' &&
        (trainings.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-gray-500 font-medium">Nenhum treinamento cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">
                Clique em "+ Novo Treinamento" para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trainings.map((t: any) => {
              const progresso =
                t.total_colaboradores > 0
                  ? Math.round((t.concluidos / t.total_colaboradores) * 100)
                  : 0
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none"
                          disabled
                        >
                          <Send className="h-3 w-3 mr-1" /> WhatsApp
                        </Button>
                        <Link href={`/trainings/${t.id}`} className="flex-1 sm:flex-none">
                          <Button size="sm" className="w-full">
                            Gerenciar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ))}

      {aba === 'colaboradores' &&
        (colaboradores.length === 0 ? (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhum colaborador cadastrado</p>
              <p className="text-sm text-gray-400 mt-1">Adicione colaboradores em um treinamento</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Nome
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        WhatsApp
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Treinamentos
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {colaboradores.map((c, i) => {
                      const completo = c.completed === c.total && c.total > 0
                      const parcial = c.completed > 0
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{c.email ?? '—'}</td>
                          <td className="py-3 px-4 text-gray-500 text-xs">{c.whatsapp ?? '—'}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={completo ? 'success' : parcial ? 'warning' : 'secondary'}
                            >
                              {c.completed}/{c.total}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {/* Mobile */}
              <div className="md:hidden divide-y divide-gray-100">
                {colaboradores.map((c, i) => {
                  const completo = c.completed === c.total && c.total > 0
                  const parcial = c.completed > 0
                  return (
                    <div key={i} className="p-4 space-y-1">
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
                      {c.whatsapp && <p className="text-xs text-gray-500">{c.whatsapp}</p>}
                      <Badge variant={completo ? 'success' : parcial ? 'warning' : 'secondary'}>
                        {c.completed}/{c.total} treinamentos
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
