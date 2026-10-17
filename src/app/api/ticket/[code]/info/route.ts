import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()
  const { data: ticket } = await admin
    .from('tickets')
    .select('holder_name, holder_email, status, event_id')
    .eq('code', code.toUpperCase())
    .single()

  if (!ticket) return NextResponse.json({ error: 'Introuvable' }, { status: 404 })

  // Verify caller owns the event
  if (ticket.event_id) {
    const { data: qr } = await admin.from('qr_codes').select('user_id').eq('id', ticket.event_id).single()
    if (qr && qr.user_id !== user.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  return NextResponse.json({ holder_name: ticket.holder_name, holder_email: ticket.holder_email, status: ticket.status })
}
