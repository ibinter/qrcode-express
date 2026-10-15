import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// POST /api/org — create org
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { name, logo_url } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const admin = createAdminClient()

  const { data: org, error } = await admin.from('organizations').insert({
    owner_id: user.id,
    name: name.trim(),
    logo_url: logo_url || null,
  }).select('id, name').single()

  if (error || !org) return NextResponse.json({ error: 'Erreur création' }, { status: 500 })

  // Add owner as member
  await admin.from('org_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner',
  })

  return NextResponse.json({ org })
}
