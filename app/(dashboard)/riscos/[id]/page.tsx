import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUserCompany } from '@/lib/supabase/queries'
import { RiscoForm } from '@/components/riscos/form'

export default async function RiscoFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'

  const { companyId, supabase } = await getUserCompany()

  let item: any = null
  if (!isNew && companyId) {
    const { data } = await supabase
      .from('risks')
      .select('*')
      .eq('id', id)
      .single()
    if (!data) notFound()
    item = data
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/riscos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Novo Risco' : 'Editar Risco'}
          </h1>
          <p className="text-sm text-gray-500">Avaliação e plano de tratamento</p>
        </div>
      </div>

      <RiscoForm companyId={companyId ?? ''} id={isNew ? undefined : id} initialData={item} />
    </div>
  )
}
