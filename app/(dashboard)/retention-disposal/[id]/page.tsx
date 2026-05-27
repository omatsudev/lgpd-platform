import { RetentionDisposalForm } from '@/components/retention-disposal/form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  regular: 'success',
  proximo_vencimento: 'warning',
  vencido: 'destructive',
  bloqueado: 'secondary',
}

const statusLabel: Record<string, string> = {
  regular: 'Regular',
  proximo_vencimento: 'Próximo do Vencimento',
  vencido: 'Vencido',
  bloqueado: 'Bloqueado',
}

export default async function RetentionDisposalFormPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const isNew = id === 'novo'

  const { companyId, supabase } = await getUserCompany()

  let item: any = null
  if (!isNew && companyId) {
    const { data } = await supabase.from('retention_disposals').select('*').eq('id', id).single()
    if (!data) notFound()
    item = data
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/retention-disposal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              {isNew ? 'Novo Registro de Retenção' : 'Editar Registro'}
            </h1>
            {item?.calculated_status && (
              <Badge variant={statusVariant[item.calculated_status] ?? 'secondary'}>
                {statusLabel[item.calculated_status] ?? item.calculated_status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            Retenção, Guarda e Descarte de Dados — LGPD Art. 16
          </p>
        </div>
      </div>

      <RetentionDisposalForm
        companyId={companyId ?? ''}
        id={isNew ? undefined : id}
        initialData={item}
      />
    </div>
  )
}
