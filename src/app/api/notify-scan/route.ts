import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Internal-only route: protected by a shared secret to prevent external abuse
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET

export async function POST(request: NextRequest) {
  try {
    // Only accept calls from within the app (using internal secret)
    const authHeader = request.headers.get('x-internal-secret')
    if (!INTERNAL_SECRET || authHeader !== INTERNAL_SECRET) {
      return NextResponse.json({ ok: false }, { status: 403 })
    }

    const { qrId, email, country, device, os, browser } = await request.json()
    if (!qrId || !email) return NextResponse.json({ ok: false }, { status: 400 })

    const admin = createAdminClient()
    const { data: qr } = await admin.from('qr_codes').select('name, slug').eq('id', qrId).single()
    if (!qr) return NextResponse.json({ ok: false }, { status: 404 })

    const RESEND_KEY = process.env.RESEND_API_KEY
    if (!RESEND_KEY) return NextResponse.json({ ok: true, skipped: true })

    const body = `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#041B4D;margin:0 0 16px">🔔 Nouveau scan détecté</h2>
        <p style="color:#374151;margin:0 0 16px">Votre QR code <strong>${qr.name || qr.slug}</strong> vient d'être scanné.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Pays</td><td style="padding:8px 0;color:#111827;font-weight:600">${country || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">Appareil</td><td style="padding:8px 0;color:#111827;font-weight:600">${device || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #f3f4f6">OS</td><td style="padding:8px 0;color:#111827;font-weight:600">${os || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280">Navigateur</td><td style="padding:8px 0;color:#111827;font-weight:600">${browser || '—'}</td></tr>
        </table>
        <p style="color:#6b7280;font-size:12px;margin:24px 0 0">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${qrId}" style="color:#FF6A00">Voir les analytics →</a>
        </p>
        <p style="color:#9ca3af;font-size:11px;margin:8px 0 0">
          Pour désactiver ces notifications, modifiez les paramètres de votre QR code sur QR CODE EXPRESS.
        </p>
      </div>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'QR Code Express <noreply@qrcode-express.com>',
        to: [email],
        subject: `🔔 Scan détecté — ${qr.name || qr.slug}`,
        html: body,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
