import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import OrgSettingsForm from './OrgSettingsForm'

export const instant = false

export default async function OrgSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!org) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/org/${id}`} className="text-gray-400 hover:text-gray-600">← Retour</Link>
          <h1 className="text-xl font-bold text-[#041B4D]">⚙️ Paramètres</h1>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <OrgSettingsForm orgId={id} initialName={org.name} initialLogoUrl={org.logo_url || ''} />
        </div>
      </div>
    </main>
  )
}
