import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Service de redirection pour les QR dynamiques
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  // Récupérer le QR dynamique par slug
  const { data: qr, error } = await supabase
    .from('qr_codes')
    .select('id, content, status, expires_at, max_scans, scan_count, password_hash')
    .eq('slug', slug)
    .eq('mode', 'dynamic')
    .single()

  if (error || !qr) {
    return NextResponse.redirect(new URL('/qr-introuvable', request.url))
  }

  // QR expiré
  if (qr.status === 'expired' || (qr.expires_at && new Date(qr.expires_at) < new Date())) {
    return NextResponse.redirect(new URL(`/qr-expire?slug=${slug}`, request.url))
  }

  // Quota de scans atteint
  if (qr.max_scans && qr.scan_count >= qr.max_scans) {
    return NextResponse.redirect(new URL(`/qr-expire?slug=${slug}`, request.url))
  }

  // QR paused
  if (qr.status !== 'active') {
    return NextResponse.redirect(new URL(`/qr-pause?slug=${slug}`, request.url))
  }

  // Enregistrer le scan de façon asynchrone (ne bloque pas la redirection)
  const ua = request.headers.get('user-agent') || ''
  const isBot = /bot|crawler|spider|googlebot|bingbot|facebookexternalhit/i.test(ua)

  supabase.from('scan_events').insert({
    qr_id: qr.id,
    device_type: /mobile/i.test(ua) ? 'mobile' : 'desktop',
    is_bot: isBot,
    destination: qr.content,
  }).then(() => {
    if (!isBot) {
      supabase.rpc('increment_scan_count', { qr_uuid: qr.id })
    }
  })

  return NextResponse.redirect(qr.content)
}
