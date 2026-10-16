import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNav from './AdminNav'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'patriceky1er@gmail.com').split(',').map(e => e.trim().toLowerCase())

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !ADMIN_EMAILS.includes((user.email ?? '').toLowerCase())) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex">
      <AdminNav userEmail={user.email ?? ''} />
      <main className="flex-1 min-w-0 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  )
}
