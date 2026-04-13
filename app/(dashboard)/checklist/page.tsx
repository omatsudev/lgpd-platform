import { ClipboardList } from 'lucide-react'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { CHECKLIST } from '@/lib/checklist-items'
import { ChecklistBoard } from '@/components/checklist/checklist-board'

export default async function ChecklistPage() {
  const { empresaId, supabase } = await getUserEmpresa()

  // Busca o estado salvo de todos os itens desta empresa
  const { data: itens } = empresaId
    ? await supabase
        .from('checklist_itens')
        .select('item_key, status, observacao, responsavel, data_conclusao')
        .eq('empresa_id', empresaId)
    : { data: [] }

  // Monta dicionário item_key → estado
  const estadoInicial: Record<string, any> = {}
  for (const item of itens ?? []) {
    estadoInicial[item.item_key] = {
      status: item.status,
      observacao: item.observacao,
      responsavel: item.responsavel,
      data_conclusao: item.data_conclusao,
    }
  }

  // Calcula totais para o cabeçalho
  const totalItens = CHECKLIST.reduce((acc, c) => acc + c.itens.length, 0)
  const concluidos = Object.values(estadoInicial).filter((v: any) => v.status === 'concluido').length
  const pendentes = totalItens - concluidos

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checklist de Adequação LGPD</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pendentes > 0
              ? `${pendentes} ite${pendentes > 1 ? 'ns' : 'm'} pendente${pendentes > 1 ? 's' : ''} · ${totalItens} no total`
              : `Todos os ${totalItens} itens verificados`}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ClipboardList className="h-4 w-4" />
          <span>{totalItens} requisitos · {CHECKLIST.length} categorias</span>
        </div>
      </div>

      {empresaId ? (
        <ChecklistBoard empresaId={empresaId} estadoInicial={estadoInicial} />
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">Nenhuma empresa vinculada à sua conta.</p>
        </div>
      )}
    </div>
  )
}
