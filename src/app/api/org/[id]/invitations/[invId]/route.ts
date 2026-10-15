import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// DELETE /api/org/[id]/invitations/[invId] — revoke invitation
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string; invId: string }> }) {
  const { id, invId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()

  const { data: myRole } = await admin
    .from('org_members')
    .select('role')
    .eq('org_id', id)
    .eq('user_id', user.id)
    .single()

  if (!myRole || !['owner', 'admin'].includes(myRole.role)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  await admin.from('org_invitations').delete().eq('id', invId).eq('org_id', id)

  return NextResponse.json({ ok: true })
}
