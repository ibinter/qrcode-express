import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const instant = false

export default async function JoinOrgPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/connexion?redirect=/org/join/${token}`)
  }

  const admin = createAdminClient()

  const { data: inv } = await admin
    .from('org_invitations')
    .select('id, org_id, email, role, accepted, expires_at, organizations(name)')
    .eq('token', token)
    .single()

  if (!inv) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-4xl">❌</p>
          <h1 className="text-lg font-bold text-[#041B4D]">Invitation introuvable</h1>
          <p className="text-sm text-gray-500">Ce lien d&apos;invitation est invalide ou a expiré.</p>
          <Link href="/org" className="block w-full py-3 rounded-xl bg-[#041B4D] text-white text-sm font-bold">
            Mes organisations
          </Link>
        </div>
      </main>
    )
  }

  if (inv.accepted || new Date(inv.expires_at) < new Date()) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center space-y-4">
          <p className="text-4xl">⏰</p>
          <h1 className="text-lg font-bold text-[#041B4D]">Invitation expirée</h1>
          <p className="text-sm text-gray-500">Cette invitation a déjà été utilisée ou a expiré.</p>
          <Link href="/org" className="block w-full py-3 rounded-xl bg-[#041B4D] text-white text-sm font-bold">
            Mes organisations
          </Link>
        </div>
      </main>
    )
  }

  // Auto-accept: add user to org
  const { error: memberError } = await admin.from('org_members').upsert({
    org_id: inv.org_id,
    user_id: user.id,
    role: inv.role,
  }, { onConflict: 'org_id,user_id' })

  if (!memberError) {
    await admin.from('org_invitations').update({ accepted: true }).eq('id', inv.id)
  }

  const orgName = (inv.organizations as Record<string, unknown>)?.name as string || 'l\'organisation'

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-sm w-full text-center space-y-4">
        <p className="text-5xl">🎉</p>
        <h1 className="text-lg font-bold text-[#041B4D]">Bienvenue dans l&apos;équipe !</h1>
        <p className="text-sm text-gray-600">
          Vous avez rejoint <strong>{orgName}</strong> avec le rôle <strong>{inv.role}</strong>.
        </p>
        <Link href={`/org/${inv.org_id}`} className="block w-full py-3 rounded-xl bg-[#041B4D] text-white text-sm font-bold">
          Accéder à l&apos;organisation →
        </Link>
      </div>
    </main>
  )
}
