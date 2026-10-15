import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { rating, feedback } = await req.json()

  if (!rating || !feedback?.trim()) {
    return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Vérifier que le QR existe et est actif
  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, user_id, design')
    .eq('id', id)
    .eq('type', 'review')
    .single()

  if (!qr) return NextResponse.json({ error: 'QR introuvable' }, { status: 404 })

  // Stocker dans scan_events comme événement spécial (metadata dans destination)
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || ''
  await admin.from('scan_events').insert({
    qr_id: id,
    is_bot: false,
    destination: `review:${rating}:${feedback.slice(0, 500)}`,
    country: req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || null,
  })

  return NextResponse.json({ ok: true })
}
