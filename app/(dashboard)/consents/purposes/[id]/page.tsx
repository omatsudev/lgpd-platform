import { PurposeForm } from '@/components/consents/purpose-form'
import { Button } from '@/components/ui/button'
import { getUserCompany } from '@/lib/supabase/queries'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function PurposeFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'nova'

  const { companyId, supabase } = await getUserCompany()

  let item: any = null
  if (!isNew && companyId) {
    const { data } = await supabase.from('consent_purposes').select('*').eq('id', id).single()
    if (!data) notFound()
    item = data
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/consents?tab=purposes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Nova Finalidade' : 'Editar Finalidade'}
          </h1>
          <p className="text-sm text-gray-500">
            Configure o que será exibido ao titular no momento do consentimento
          </p>
        </div>
      </div>

      <PurposeForm companyId={companyId ?? ''} id={isNew ? undefined : id} initialData={item} />
    </div>
  )
}
