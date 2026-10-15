import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

async function getOwnerOrg(userId: string, orgId: string) {
  const admin = createAdminClient()
  const { data } = await admin.from('organizations').select('id').eq('id', orgId).eq('owner_id', userId).single()
  return data
}

// PATCH /api/org/[id] — update org
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const org = await getOwnerOrg(user.id, id)
  if (!org) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { name, logo_url } = await req.json()
  const admin = createAdminClient()
  await admin.from('organizations').update({ name: name?.trim(), logo_url: logo_url ?? null }).eq('id', id)

  return NextResponse.json({ ok: true })
}

// DELETE /api/org/[id] — delete org
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const org = await getOwnerOrg(user.id, id)
  if (!org) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const admin = createAdminClient()
  await admin.from('organizations').delete().eq('id', id)

  return NextResponse.json({ ok: true })
}
