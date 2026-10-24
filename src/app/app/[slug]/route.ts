import { absoluteUrl } from '@/lib/site-url'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: qr } = await supabase
    .from('qr_codes')
    .select('id, content, status')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq('type', 'app')
    .single()

  if (!qr || qr.status !== 'active') {
    return NextResponse.redirect(absoluteUrl('/qr-introuvable'))
  }

  // content = JSON stringified { ios, android, fallback }
  let urls: { ios?: string; android?: string; fallback?: string } = {}
  try { urls = JSON.parse(qr.content) } catch { urls = {} }

  const ua = request.headers.get('user-agent') || ''
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isBot = /bot|crawler|spider|googlebot/i.test(ua)

  // Track scan (non-blocking)
  const admin = createAdminClient()
  const destination = isIOS ? (urls.ios ?? urls.fallback ?? '') : isAndroid ? (urls.android ?? urls.fallback ?? '') : (urls.fallback ?? urls.ios ?? urls.android ?? '')
  admin.from('scan_events').insert({
    qr_id: qr.id,
    device_type: isIOS ? 'ios' : isAndroid ? 'android' : 'desktop',
    is_bot: isBot,
    destination,
  }).then(() => {
    if (!isBot) admin.rpc('increment_scan_count', { qr_uuid: qr.id })
  })

  if (!destination) {
    return NextResponse.redirect(absoluteUrl('/qr-introuvable'))
  }

  return NextResponse.redirect(destination)
}
