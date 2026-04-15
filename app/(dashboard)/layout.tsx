import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { getUserCompany } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, company: empresa, companyId } = await getUserCompany()

  if (!user) redirect('/login')

  // Se o usuário não tem empresa, cria uma e redireciona para recarregar
  if (user && !companyId) {
    const supabase = await createClient()
    const userName = (user.user_metadata?.name as string) || user.email || 'Usuário'
    const nomeFinal = `Empresa de ${userName.split('@')[0]}`
    const slug = nomeFinal
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      + '-' + Date.now()

    const { data: newCompany } = await supabase
      .from('companies')
      .insert({ name: nomeFinal, owner_id: user.id, slug })
      .select('id')
      .single()

    if (newCompany) {
      await supabase.from('user_companies').insert({
        user_id: user.id,
        company_id: newCompany.id,
        role: 'admin',
      })
      // Redireciona para recarregar a página com a empresa criada
      // (o trigger do banco semeia os dados automaticamente)
      redirect('/dashboard')
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col lg:ml-64 overflow-hidden">
        <Header companyName={empresa?.name} userName={user?.email} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
