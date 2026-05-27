import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/ui/search-input'
import { getUserCompany } from '@/lib/supabase/queries'
import { Send, UserCheck } from 'lucide-react'

export default async function CollaboratorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { companyId, supabase } = await getUserCompany()
  const { q } = await searchParams

  // Busca all os training_employees da empresa via join
  const { data: trainingsData } = companyId
    ? await supabase
        .from('trainings')
        .select('id, training_employees(employee_name, employee_email, employee_whatsapp, status)')
        .eq('company_id', companyId)
    : { data: [] }

  // Agrupa employees únicos (por email ou nome) e soma treinamentos
  const employeesMap = new Map<
    string,
    {
      name: string
      email: string | null
      whatsapp: string | null
      total: number
      completed: number
    }
  >()

  for (const t of trainingsData ?? []) {
    for (const c of (t as any).training_employees ?? []) {
      const key = c.employee_email ?? c.employee_name
      if (!employeesMap.has(key)) {
        employeesMap.set(key, {
          name: c.employee_name,
          email: c.employee_email,
          whatsapp: c.employee_whatsapp,
          total: 0,
          completed: 0,
        })
      }
      const col = employeesMap.get(key)!
      col.total += 1
      if (c.status === 'completed') col.completed += 1
    }
  }

  const all = Array.from(employeesMap.values())
  const employees = q
    ? all.filter(
        (c) =>
          c.name.toLowerCase().includes(q.toLowerCase()) ||
          c.email?.toLowerCase().includes(q.toLowerCase()),
      )
    : all

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Colaboradores</h1>
          <p className="text-sm text-gray-500 mt-0.5">Colaboradores cadastrados nos treinamentos</p>
        </div>
      </div>

      <SearchInput defaultValue={q ?? ''} placeholder="Buscar por nome ou email..." />

      {employees.length === 0 ? (
        <Card>
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-gray-500 font-medium">Nenhum colaborador cadastrado</p>
            <p className="text-sm text-gray-400 mt-1">
              Adicione employees em um treinamento para vê-los aqui
            </p>
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
                    <th className="py-3 px-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {employees.map((c, i) => {
                    const isComplete = c.completed === c.total && c.total > 0
                    const isPartial = c.completed > 0
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{c.name}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{c.email ?? '—'}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">{c.whatsapp ?? '—'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={isComplete ? 'success' : isPartial ? 'warning' : 'secondary'}>
                            {c.completed}/{c.total}
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
            {employees.map((c, i) => {
              const isComplete = c.completed === c.total && c.total > 0
              const isPartial = c.completed > 0
              return (
                <Card key={i}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <p className="font-medium text-gray-900">{c.name}</p>
                        {c.email && <p className="text-xs text-gray-500 truncate">{c.email}</p>}
                        {c.whatsapp && <p className="text-xs text-gray-500">{c.whatsapp}</p>}
                        <Badge variant={isComplete ? 'success' : isPartial ? 'warning' : 'secondary'}>
                          {c.completed}/{c.total} treinamentos
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
