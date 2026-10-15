import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-'
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { name, email, phone } = await req.json()

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'Nom et e-mail requis' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Verify the event QR exists and is active
  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, content, status')
    .eq('id', id)
    .eq('type', 'event')
    .single()

  if (!qr || qr.status === 'archived') {
    return NextResponse.json({ error: 'Événement introuvable' }, { status: 404 })
  }
  if (qr.status === 'paused') {
    return NextResponse.json({ error: 'Les inscriptions sont fermées' }, { status: 409 })
  }

  // Check capacity
  let event: Record<string, unknown> = {}
  try { event = JSON.parse(qr.content || '{}') } catch {}

  const capacity = Number(event.capacity) || 0
  if (capacity > 0) {
    const { count } = await admin
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('event_id', id)
      .neq('status', 'cancelled')

    if ((count ?? 0) >= capacity) {
      return NextResponse.json({ error: 'Événement complet' }, { status: 409 })
    }
  }

  // Generate a unique code (retry up to 5 times on collision)
  let code = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    code = generateCode()
    const { data: existing } = await admin.from('tickets').select('id').eq('code', code).maybeSingle()
    if (!existing) break
  }

  const { data: ticket, error } = await admin.from('tickets').insert({
    event_id: id,
    code,
    holder_name: name.trim(),
    holder_email: email.trim(),
    status: 'valid',
  }).select('code').single()

  if (error || !ticket) {
    return NextResponse.json({ error: 'Erreur lors de la création du billet' }, { status: 500 })
  }

  return NextResponse.json({ ticket: { code: ticket.code } })
}
