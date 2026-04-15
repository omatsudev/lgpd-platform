import { notFound } from 'next/navigation'
import { getUserCompany } from '@/lib/supabase/queries'
import { InventarioWizard } from '@/components/inventario/wizard'

export default async function InventarioFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'

  const { companyId, supabase } = await getUserCompany()

  let item: any = null
  if (!isNew && companyId) {
    const { data } = await supabase
      .from('data_inventory')
      .select('*')
      .eq('id', id)
      .single()
    if (!data) notFound()
    item = data
  }

  return (
    <InventarioWizard
      companyId={companyId ?? ''}
      id={isNew ? undefined : id}
      initialData={item}
    />
  )
}
