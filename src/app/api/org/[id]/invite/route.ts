import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { email, role } = await req.json()
  if (!email?.trim()) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

  const validRoles = ['admin', 'editor', 'controller', 'reader']
  if (!validRoles.includes(role)) return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })

  const admin = createAdminClient()

  // Check caller is owner or admin of this org
  const { data: membership } = await admin
    .from('org_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Upsert invitation (reset token on re-invite)
  const { data: inv, error } = await admin.from('org_invitations').upsert({
    org_id: id,
    email: email.trim().toLowerCase(),
    role,
    invited_by: user.id,
    accepted: false,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: 'org_id,email' }).select('id, email, role, created_at, expires_at').single()

  if (error || !inv) return NextResponse.json({ error: 'Erreur invitation' }, { status: 500 })

  // Re-fetch to get the token
  const { data: invFull } = await admin.from('org_invitations').select('token').eq('id', inv.id).single()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express-ibig.vercel.app'
  const joinLink = `${appUrl}/org/join/${invFull?.token || inv.id}`

  return NextResponse.json({ invitation: inv, join_link: joinLink })
}
