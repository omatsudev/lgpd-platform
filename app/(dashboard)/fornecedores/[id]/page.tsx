import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getUserEmpresa } from '@/lib/supabase/queries'
import { FornecedorForm } from '@/components/fornecedores/form'

export default async function FornecedorFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isNew = id === 'novo'

  const { empresaId, supabase } = await getUserEmpresa()

  let item: any = null
  if (!isNew && empresaId) {
    const { data } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', id)
      .single()
    if (!data) notFound()
    item = data
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/fornecedores">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNew ? 'Novo Fornecedor' : 'Editar Fornecedor'}
          </h1>
          <p className="text-sm text-gray-500">Due diligence e mapeamento de acesso a dados pessoais</p>
        </div>
      </div>

      <FornecedorForm empresaId={empresaId ?? ''} id={isNew ? undefined : id} initialData={item} />
    </div>
  )
}
