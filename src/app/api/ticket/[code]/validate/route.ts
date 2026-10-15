import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const admin = createAdminClient()

  const { data: ticket } = await admin
    .from('tickets')
    .select('id, status, event_id')
    .eq('code', code.toUpperCase())
    .single()

  if (!ticket) return NextResponse.json({ error: 'Billet introuvable' }, { status: 404 })
  if (ticket.status === 'used') return NextResponse.json({ error: 'Billet déjà utilisé' }, { status: 409 })
  if (ticket.status === 'cancelled') return NextResponse.json({ error: 'Billet annulé' }, { status: 409 })

  // Verify caller owns the event
  if (ticket.event_id) {
    const { data: qr } = await admin
      .from('qr_codes')
      .select('user_id')
      .eq('id', ticket.event_id)
      .single()

    if (qr && qr.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }
  }

  await admin
    .from('tickets')
    .update({ status: 'used', validated_at: new Date().toISOString(), validated_by: user.id })
    .eq('id', ticket.id)

  return NextResponse.json({ ok: true })
}
