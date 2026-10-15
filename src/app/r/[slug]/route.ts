import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: qr, error } = await supabase
    .from('qr_codes')
    .select('id, content, status, expires_at, max_scans, scan_count')
    .eq('slug', slug)
    .eq('mode', 'dynamic')
    .single()

  if (error || !qr) {
    return NextResponse.redirect(new URL('/qr-introuvable', request.url))
  }

  if (qr.status === 'expired' || (qr.expires_at && new Date(qr.expires_at) < new Date())) {
    return NextResponse.redirect(new URL(`/qr-expire?slug=${slug}`, request.url))
  }

  if (qr.max_scans && qr.scan_count >= qr.max_scans) {
    return NextResponse.redirect(new URL(`/qr-expire?slug=${slug}`, request.url))
  }

  if (qr.status !== 'active') {
    return NextResponse.redirect(new URL(`/qr-pause?slug=${slug}`, request.url))
  }

  // Tracking avec service_role (contourne RLS) — ne bloque pas la redirection
  const ua = request.headers.get('user-agent') || ''
  const isBot = /bot|crawler|spider|googlebot|bingbot|facebookexternalhit/i.test(ua)

  const admin = createAdminClient()
  admin.from('scan_events').insert({
    qr_id: qr.id,
    device_type: /mobile/i.test(ua) ? 'mobile' : 'desktop',
    is_bot: isBot,
    destination: qr.content,
  }).then(() => {
    if (!isBot) {
      admin.rpc('increment_scan_count', { qr_uuid: qr.id })
    }
  })

  return NextResponse.redirect(qr.content)
}
