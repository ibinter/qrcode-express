import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { emailConfigured, sendEmail } from '@/lib/email'

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

  // Send ticket email (non-blocking)
  if (emailConfigured() && email.trim()) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com'
    const ticketUrl = `${appUrl}/ticket/${ticket.code}`
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(ticketUrl)}&color=041B4D&bgcolor=ffffff`
    const accentColor = (event.color as string) || '#041B4D'
    const eventDate = event.date ? new Date(event.date as string).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : ''
    const eventPrice = Number(event.price) || 0

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif">
<div style="max-width:520px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
  <!-- Header -->
  <div style="background:${accentColor};padding:32px 24px;text-align:center">
    <p style="margin:0;font-size:32px">🎟️</p>
    <h1 style="margin:12px 0 4px;color:#ffffff;font-size:22px;font-weight:800">${event.name || 'Votre billet'}</h1>
    <p style="margin:0;color:rgba(255,255,255,0.8);font-size:14px">Inscription confirmée !</p>
  </div>
  <!-- Body -->
  <div style="padding:28px 24px;text-align:center">
    <p style="margin:0 0 4px;font-size:15px;color:#374151">Bonjour <strong>${name.trim()}</strong>,</p>
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280">Votre place est réservée. Présentez ce billet à l'entrée.</p>
    ${eventDate ? `<p style="margin:0 0 4px;font-size:13px;color:#6b7280">📅 ${eventDate}${event.time ? ' à ' + event.time : ''}</p>` : ''}
    ${event.location ? `<p style="margin:0 0 16px;font-size:13px;color:#6b7280">📍 ${event.location}</p>` : ''}
    ${eventPrice > 0 ? `<p style="margin:0 0 16px;font-size:13px;color:#6b7280">💳 Billet : ${eventPrice.toLocaleString('fr-FR')} FCFA</p>` : ''}
    <!-- Code billet -->
    <div style="background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
      <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Code billet</p>
      <p style="margin:0;font-size:28px;font-family:monospace;font-weight:800;letter-spacing:6px;color:${accentColor}">${ticket.code}</p>
    </div>
    <!-- QR -->
    <img src="${qrImgUrl}" alt="QR billet" width="180" height="180" style="border-radius:12px;border:1px solid #e5e7eb;margin:0 0 20px" />
    <br>
    <a href="${ticketUrl}" style="display:inline-block;background:${accentColor};color:#ffffff;padding:14px 32px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">
      Voir mon billet →
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#9ca3af">Conservez cet e-mail — il vous servira de billet d'entrée.</p>
  </div>
  <!-- Footer -->
  <div style="padding:16px 24px;border-top:1px solid #f3f4f6;text-align:center">
    <p style="margin:0;font-size:11px;color:#9ca3af">
      Billet généré par <a href="https://qrcode-express.com" style="color:${accentColor};text-decoration:none">QR CODE EXPRESS</a> — IBIG SOFT, Abidjan
    </p>
  </div>
</div>
</body></html>`

    sendEmail(email.trim(), `🎟️ Votre billet — ${event.name || 'Événement'}`, html).catch(() => {})
  }

  return NextResponse.json({ ticket: { code: ticket.code } })
}
