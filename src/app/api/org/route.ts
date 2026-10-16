import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePlan } from '@/lib/plan-guard'

// POST /api/org — create org
export async function POST(req: NextRequest) {
  const { ok, user, error } = await requirePlan('business')
  if (!ok) return error

  const { name, logo_url } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis' }, { status: 400 })

  const admin = createAdminClient()

  const { data: org, error: dbError } = await admin.from('organizations').insert({
    owner_id: user.id,
    name: name.trim(),
    logo_url: logo_url || null,
  }).select('id, name').single()

  if (dbError || !org) return NextResponse.json({ error: 'Erreur création' }, { status: 500 })

  // Add owner as member
  await admin.from('org_members').insert({
    org_id: org.id,
    user_id: user.id,
    role: 'owner',
  })

  return NextResponse.json({ org })
}
