import { notFound } from 'next/navigation'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { InventarioWizard } from '@/components/inventario/wizard'

export default async function InventarioFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'

  const { empresaId, supabase } = await getUserEmpresa()

  let item: any = null
  if (!isNew && empresaId) {
    const { data } = await supabase
      .from('inventario_dados')
      .select('*')
      .eq('id', id)
      .single()
    if (!data) notFound()
    item = data
  }

  return (
    <InventarioWizard
      empresaId={empresaId ?? ''}
      id={isNew ? undefined : id}
      initialData={item}
    />
  )
}
