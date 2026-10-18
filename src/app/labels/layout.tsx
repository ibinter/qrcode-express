import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import ClientSidebar from '@/components/dashboard/ClientSidebar'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default async function LabelsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Non authentifié : layout public avec header
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    )
  }

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('plan, credits')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ClientSidebar
        userEmail={user.email ?? ''}
        plan={profile?.plan ?? 'free'}
        credits={profile?.credits ?? 0}
      />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
