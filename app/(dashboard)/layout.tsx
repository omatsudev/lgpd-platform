import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { getUserCompany } from '@/lib/supabase/queries'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, company: empresa } = await getUserCompany()

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
