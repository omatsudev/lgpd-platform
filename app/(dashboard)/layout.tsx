import { switchCompany } from '@/app/actions/switch-company'
import { Header } from '@/components/dashboard/header'
import { Sidebar } from '@/components/dashboard/sidebar'
import { getUserCompany } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, company: empresa, companyId, role, companies } = await getUserCompany()

  if (!user) redirect('/login')

  // Cria empresa automaticamente apenas para usuários sem nenhuma empresa vinculada
  // (não aplica a DPOs que ainda não foram atribuídos a nenhuma empresa)
  if (user && !companyId && companies.length === 0) {
    const supabase = await createClient()
    const userName = (user.user_metadata?.name as string) || user.email || 'Usuário'
    const nomeFinal = `Empresa de ${userName.split('@')[0]}`
    const slug =
      nomeFinal
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') +
      '-' +
      Date.now()

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
      redirect('/dashboard?setup=1')
    }
    // Se criação falhou, renderiza sem empresa
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col lg:ml-64 overflow-hidden">
        <Header
          companyName={empresa?.name}
          userName={user?.email}
          companies={companies}
          currentCompanyId={companyId}
          switchCompanyAction={switchCompany}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
