import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewOrgForm from './NewOrgForm'

export const instant = false

export default async function NewOrgPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full">
        <h1 className="text-xl font-bold text-[#041B4D] mb-1">🏢 Nouvelle organisation</h1>
        <p className="text-sm text-gray-500 mb-6">Créez un espace collaboratif pour votre équipe.</p>
        <NewOrgForm />
      </div>
    </main>
  )
}
