import { ChecklistBoard } from '@/components/checklist/checklist-board'
import { CHECKLIST } from '@/lib/checklist-items'
import { getUserCompany } from '@/lib/supabase/queries'
import { ClipboardList } from 'lucide-react'

export default async function ChecklistPage() {
  const { companyId, supabase } = await getUserCompany()

  const { data: items } = companyId
    ? await supabase
        .from('checklist_items')
        .select('item_key, status, notes, responsible, completion_date')
        .eq('company_id', companyId)
    : { data: [] }

  const initialState: Record<string, any> = {}
  for (const item of items ?? []) {
    initialState[item.item_key] = {
      status: item.status,
      notes: item.notes,
      responsible: item.responsible,
      completion_date: item.completion_date,
    }
  }

  const totalItems = CHECKLIST.reduce((acc, c) => acc + c.items.length, 0)
  const completed = Object.values(initialState).filter((v: any) => v.status === 'completed').length
  const pending = totalItems - completed

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Checklist de Adequação LGPD
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pending > 0
              ? `${pending} ite${pending > 1 ? 'ns' : 'm'} pendente${pending > 1 ? 's' : ''} · ${totalItems} no total`
              : `Todos os ${totalItems} itens verificados`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClipboardList className="h-4 w-4" />
          <span>
            {totalItems} requisitos · {CHECKLIST.length} categorias
          </span>
        </div>
      </div>

      {companyId ? (
        <ChecklistBoard companyId={companyId} initialState={initialState} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">Nenhuma empresa vinculada à sua conta.</p>
        </div>
      )}
    </div>
  )
}
