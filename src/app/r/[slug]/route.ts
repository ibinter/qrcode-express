import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: qr, error } = await admin
    .from('qr_codes')
    .select('id, content, status, expires_at, max_scans, scan_count, password_hash, type')
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

  if (qr.status === 'paused') {
    return NextResponse.redirect(new URL(`/qr-pause?slug=${slug}`, request.url))
  }

  if (qr.status !== 'active') {
    return NextResponse.redirect(new URL('/qr-introuvable', request.url))
  }

  // Password protection — redirect to password page
  if (qr.password_hash) {
    return NextResponse.redirect(new URL(`/qr-password/${slug}`, request.url))
  }

  // Detect request properties for smart routing
  const ua = request.headers.get('user-agent') || ''
  const acceptLang = request.headers.get('accept-language') || ''
  const country = request.headers.get('cf-ipcountry') || request.headers.get('x-vercel-ip-country') || ''

  const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua)
  const isTablet = /ipad|tablet/i.test(ua)
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop'

  const primaryLang = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase() || 'fr'

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayStr = dayNames[now.getDay()]

  // Fetch routing rules
  const { data: rules } = await admin
    .from('routing_rules')
    .select('rule_type, condition, destination, priority')
    .eq('qr_id', qr.id)
    .eq('is_active', true)
    .order('priority', { ascending: false })

  let destination = qr.content

  if (rules && rules.length > 0) {
    for (const rule of rules) {
      const cond = rule.condition as Record<string, unknown>
      let matched = false

      if (rule.rule_type === 'device') {
        matched = cond.device === deviceType
      } else if (rule.rule_type === 'language') {
        matched = cond.lang === primaryLang
      } else if (rule.rule_type === 'country') {
        matched = cond.country === country
      } else if (rule.rule_type === 'schedule') {
        const days = (cond.days as string[]) || dayNames
        const start = (cond.start as string) || '00:00'
        const end = (cond.end as string) || '23:59'
        matched = days.includes(dayStr) && timeStr >= start && timeStr <= end
      } else if (rule.rule_type === 'scan_count') {
        const min = (cond.min as number) || 0
        const max = cond.max as number | undefined
        matched = qr.scan_count >= min && (max === undefined || qr.scan_count < max)
      }

      if (matched) {
        destination = rule.destination
        break
      }
    }
  }

  // Async scan tracking
  const isBot = /bot|crawler|spider|googlebot|bingbot|facebookexternalhit/i.test(ua)

  admin.from('scan_events').insert({
    qr_id: qr.id,
    device_type: deviceType,
    country: country || null,
    is_bot: isBot,
    destination,
  }).then(() => {
    if (!isBot) {
      admin.rpc('increment_scan_count', { qr_uuid: qr.id })
    }
  })

  return NextResponse.redirect(destination)
}
