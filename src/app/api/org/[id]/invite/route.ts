import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePlan } from '@/lib/plan-guard'

// Max members per plan
const ORG_MEMBER_LIMITS: Record<string, number> = {
  business: 5,
  agency: 20,
  enterprise: 9999,
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { ok, user, error } = await requirePlan('business')
  if (!ok) return error

  const { email, role } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const validRoles = ['admin', 'editor', 'controller', 'reader']
  if (!validRoles.includes(role)) return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })

  const admin = createAdminClient()

  // Check caller is owner or admin of this org
  // Fallback: also check organizations.owner_id for legacy orgs where owner wasn't added to org_members
  const [{ data: membership }, { data: org }] = await Promise.all([
    admin.from('org_members').select('role').eq('org_id', id).eq('user_id', user.id).single(),
    admin.from('organizations').select('owner_id').eq('id', id).single(),
  ])

  const isOwnerFallback = org?.owner_id === user.id
  if (!isOwnerFallback && (!membership || !['owner', 'admin'].includes(membership.role))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Enforce member limit based on plan
  const maxMembers = ORG_MEMBER_LIMITS[user.plan] ?? 5
  const { count } = await admin
    .from('org_members')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', id)

  if ((count ?? 0) >= maxMembers) {
    return NextResponse.json(
      { error: `Votre plan ${user.plan} est limité à ${maxMembers} membres par organisation.`, upgradeUrl: '/tarifs' },
      { status: 403 }
    )
  }

  // Upsert invitation (reset token on re-invite)
  const { data: inv, error: dbError } = await admin.from('org_invitations').upsert({
    org_id: id,
    email: email.trim().toLowerCase(),
    role,
    invited_by: user.id,
    accepted: false,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: 'org_id,email' }).select('id, email, role, created_at, expires_at').single()

  if (dbError || !inv) return NextResponse.json({ error: 'Erreur invitation' }, { status: 500 })

  const { data: invFull } = await admin.from('org_invitations').select('token').eq('id', inv.id).single()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com'
  const joinLink = `${appUrl}/org/join/${invFull?.token || inv.id}`

  return NextResponse.json({ invitation: inv, join_link: joinLink })
}
