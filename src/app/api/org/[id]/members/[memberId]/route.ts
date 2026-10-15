import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// DELETE /api/org/[id]/members/[memberId]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; memberId: string }> }) {
  const { id, memberId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()

  // Check caller is owner/admin
  const { data: myRole } = await admin
    .from('org_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .single()

  if (!myRole || !['owner', 'admin'].includes(myRole.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  // Cannot remove the owner
  const { data: target } = await admin
    .from('org_members')
    .select('role')
    .eq('id', memberId)
    .eq('org_id', id)
    .single()

  if (!target) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 })
  if (target.role === 'owner') return NextResponse.json({ error: 'Impossible de retirer le propriétaire' }, { status: 409 })

  await admin.from('org_members').delete().eq('id', memberId)

  return NextResponse.json({ ok: true })
}
