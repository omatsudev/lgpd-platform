import { InventoryWizard } from '@/components/inventory/wizard'
import { getUserCompany } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'

export default async function InventoryFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'

  const { companyId, supabase } = await getUserCompany()

  let item: any = null
  if (!isNew && companyId) {
    const { data } = await supabase.from('data_inventory').select('*').eq('id', id).single()
    if (!data) notFound()
    item = data
  }

  return (
    <InventoryWizard companyId={companyId ?? ''} id={isNew ? undefined : id} initialData={item} />
  )
}
