import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Verify ownership
  const { data: qr } = await supabase.from('qr_codes').select('id').eq('id', id).eq('user_id', user.id).single()
  if (!qr) return NextResponse.json({ error: 'QR introuvable' }, { status: 404 })

  const { rule_type, condition, destination, priority } = await req.json()

  const { data, error } = await supabase.from('routing_rules').insert({
    qr_id: id,
    rule_type,
    condition,
    destination,
    priority: priority || 0,
    is_active: true,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rule: data }, { status: 201 })
}
