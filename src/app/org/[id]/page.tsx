import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import MembersManager from './MembersManager'

export const instant = false

const ROLE_LABELS: Record<string, string> = {
  owner: '👑 Propriétaire', admin: '⚡ Admin', editor: '✏️ Éditeur',
  controller: '🎫 Contrôleur', reader: '👁️ Lecteur',
}

export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (!org) notFound()

  // Check access
  const isOwner = org.owner_id === user.id
  const { data: myMembership } = await admin
    .from('org_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!isOwner && !myMembership) notFound()

  const myRole = isOwner ? 'owner' : (myMembership?.role || 'reader')
  const canManage = ['owner', 'admin'].includes(myRole)

  // Load members with profile info
  const { data: members } = await admin
    .from('org_members')
    .select('id, role, user_id, profiles(full_name, avatar_url)')
    .eq('org_id', id)

  // Load pending invitations
  const { data: invitations } = await admin
    .from('org_invitations')
    .select('id, email, role, created_at, expires_at, accepted')
    .eq('org_id', id)
    .eq('accepted', false)
    .order('created_at', { ascending: false })

  // Load recent org QRs
  const { data: qrs } = await admin
    .from('qr_codes')
    .select('id, name, type, scan_count, status, created_at')
    .eq('org_id', id)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/org" className="text-gray-400 hover:text-gray-600 transition-colors">← Organisations</Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-[#041B4D]/10 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
              {org.logo_url ? <img src={org.logo_url} alt="" className="w-full h-full object-cover rounded-xl" /> : '🏢'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#041B4D]">{org.name}</h1>
              <p className="text-xs text-gray-400">{ROLE_LABELS[myRole]} · Plan {org.plan}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Members + Invitations */}
          <div className="md:col-span-2 space-y-5">
            <MembersManager
              orgId={id}
              members={(members || []).map((m) => ({
                id: m.id,
                role: m.role,
                user_id: m.user_id,
                full_name: (m.profiles as Record<string, unknown>)?.full_name as string | null,
                avatar_url: (m.profiles as Record<string, unknown>)?.avatar_url as string | null,
                isCurrentUser: m.user_id === user.id,
              }))}
              invitations={(invitations || []).map((inv) => ({
                id: inv.id,
                email: inv.email,
                role: inv.role,
                created_at: inv.created_at,
                expires_at: inv.expires_at,
              }))}
              canManage={canManage}
              isOwner={isOwner}
            />
          </div>

          {/* QR codes sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#041B4D]">QR codes de l&apos;équipe</h2>
                <Link href="/dashboard" className="text-xs text-[#FF6A00] font-semibold hover:underline">Voir tous</Link>
              </div>
              {(qrs || []).length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Aucun QR code pour cette organisation.</p>
              ) : (
                <div className="space-y-2">
                  {(qrs || []).map((qr) => (
                    <Link key={qr.id} href={`/dashboard/${qr.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-[#041B4D]/10 flex items-center justify-center text-sm flex-shrink-0">📱</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#041B4D] truncate">{qr.name || `QR ${qr.type}`}</p>
                        <p className="text-[10px] text-gray-400">{qr.scan_count} scans</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Org settings (owner only) */}
            {isOwner && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="text-sm font-bold text-[#041B4D] mb-3">Paramètres</h2>
                <Link href={`/org/${id}/settings`}
                  className="block w-full text-center py-2 rounded-xl border border-gray-200 text-sm text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
                  ⚙️ Gérer l&apos;organisation
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
