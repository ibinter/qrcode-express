import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function OrgsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const admin = createAdminClient()

  // Orgs I own
  const { data: ownedOrgs } = await admin
    .from('organizations')
    .select('id, name, logo_url, plan, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Orgs I'm a member of (not owner)
  const { data: memberRows } = await admin
    .from('org_members')
    .select('org_id, role, organizations(id, name, logo_url, plan)')
    .eq('user_id', user.id)

  const memberOrgs = (memberRows || [])
    .filter((r) => {
      const org = r.organizations as Record<string, unknown> | null
      return org && !(ownedOrgs || []).find((o) => o.id === org.id)
    })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-[#041B4D]">🏢 Organisations</h1>
            <p className="text-sm text-gray-500">Gérez vos équipes et partagez vos QR codes</p>
          </div>
          <Link href="/org/new"
            className="px-4 py-2 rounded-xl bg-[#041B4D] text-white text-sm font-bold hover:bg-[#041B4D]/90 transition-colors">
            + Nouvelle organisation
          </Link>
        </div>

        {/* Owned orgs */}
        {(ownedOrgs || []).length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mes organisations</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {(ownedOrgs || []).map((org) => (
                <Link key={org.id} href={`/org/${org.id}`}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-[#041B4D]/10 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                    {org.logo_url ? <img src={org.logo_url} alt="" className="w-full h-full object-cover rounded-xl" /> : '🏢'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#041B4D] truncate">{org.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Propriétaire · Plan {org.plan}
                    </p>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Member orgs */}
        {memberOrgs.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Organisations rejointes</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {memberOrgs.map((row) => {
                const org = row.organizations as Record<string, unknown>
                return (
                  <Link key={row.org_id} href={`/org/${org.id}`}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                      {org.logo_url ? <img src={org.logo_url as string} alt="" className="w-full h-full object-cover rounded-xl" /> : '🤝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#041B4D] truncate">{org.name as string}</p>
                      <p className="text-xs text-gray-400 mt-0.5 capitalize">Rôle : {row.role}</p>
                    </div>
                    <span className="text-gray-300 text-lg">›</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {(ownedOrgs || []).length === 0 && memberOrgs.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">🏢</p>
            <p className="font-semibold text-[#041B4D] mb-1">Aucune organisation</p>
            <p className="text-sm text-gray-500 mb-4">Créez une organisation pour collaborer avec votre équipe.</p>
            <Link href="/org/new"
              className="inline-block px-6 py-2.5 rounded-xl bg-[#041B4D] text-white text-sm font-bold hover:bg-[#041B4D]/90 transition-colors">
              Créer une organisation
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
