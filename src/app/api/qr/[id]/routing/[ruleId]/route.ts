import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id, ruleId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Verify ownership via QR
  const { data: qr } = await supabase.from('qr_codes').select('id').eq('id', id).eq('user_id', user.id).single()
  if (!qr) return NextResponse.json({ error: 'QR introuvable' }, { status: 404 })

  const { error } = await supabase.from('routing_rules').delete().eq('id', ruleId).eq('qr_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
