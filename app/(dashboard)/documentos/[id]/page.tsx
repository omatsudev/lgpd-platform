import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUserCompany } from '@/lib/supabase/queries'
import { DocumentoForm } from '@/components/documentos/form'

export default async function DocumentoFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'

  const { companyId, supabase } = await getUserCompany()

  let item: any = null
  if (!isNew && companyId) {
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    if (!data) notFound()
    item = data
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/documentos">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Novo Documento' : 'Editar Documento'}
          </h1>
          <p className="text-sm text-gray-500">Gestão de documentos de conformidade LGPD</p>
        </div>
      </div>

      <DocumentoForm companyId={companyId ?? ''} id={isNew ? undefined : id} initialData={item} />
    </div>
  )
}
