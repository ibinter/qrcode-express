import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Plan } from '@/lib/plan-guard'

const PLAN_RANK: Record<Plan, number> = { free: 0, essential: 1, pro: 2, business: 3, agency: 4, enterprise: 5 }
function planAtLeast(userPlan: Plan, min: Plan) { return PLAN_RANK[userPlan] >= PLAN_RANK[min] }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const admin = createAdminClient()

  const { data: qr, error } = await admin
    .from('qr_codes')
    .select('id, content, status, expires_at, max_scans, scan_count, password_hash, type, design, user_id, users(plan)')
    .eq('slug', slug)
    .eq('mode', 'dynamic')
    .single()

  const ownerPlan = ((qr as any)?.users?.plan ?? 'free') as Plan

  if (error || !qr) {
    return NextResponse.redirect(new URL('/qr-introuvable', request.url))
  }

  // QR "jamais mort" — fallback_url dans design JSON
  const design = (qr.design || {}) as Record<string, unknown>
  const fallbackUrl = design.fallback_url as string | undefined

  const isExpired = qr.status === 'expired' || (qr.expires_at && new Date(qr.expires_at) < new Date())
  const isMaxReached = qr.max_scans && qr.scan_count >= qr.max_scans

  if (isExpired || isMaxReached) {
    // Redirect to fallback URL if configured (QR jamais mort)
    if (fallbackUrl) return NextResponse.redirect(fallbackUrl)
    return NextResponse.redirect(new URL(`/qr-expire?slug=${slug}`, request.url))
  }

  if (qr.status === 'paused') {
    if (fallbackUrl) return NextResponse.redirect(fallbackUrl)
    return NextResponse.redirect(new URL(`/qr-pause?slug=${slug}`, request.url))
  }

  if (qr.status !== 'active') {
    return NextResponse.redirect(new URL('/qr-introuvable', request.url))
  }

  // Password protection
  if (qr.password_hash) {
    return NextResponse.redirect(new URL(`/qr-password/${slug}`, request.url))
  }

  // Detect request context for smart routing
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

  // Smart routing rules
  const { data: rules } = await admin
    .from('routing_rules')
    .select('rule_type, condition, destination, priority')
    .eq('qr_id', qr.id)
    .eq('is_active', true)
    .order('priority', { ascending: false })

  // app type stores JSON content — route to the dedicated landing page
  if (qr.type === 'app') {
    return NextResponse.redirect(new URL(`/app/${qr.id}`, request.url))
  }

  let destination = qr.content

  if (rules && rules.length > 0 && planAtLeast(ownerPlan, 'business')) {
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
      } else if (rule.rule_type === 'ab_test') {
        const variants = cond.variants as { url: string; weight: number }[] | undefined
        if (variants && variants.length > 0) {
          const total = variants.reduce((s, v) => s + v.weight, 0)
          let rand = Math.random() * total
          for (const v of variants) {
            rand -= v.weight
            if (rand <= 0) { destination = v.url; break }
          }
          if (rand > 0) destination = variants[variants.length - 1].url
          matched = true
        }
      }

      if (matched) {
        destination = rule.destination
        break
      }
    }
  }

  // Append UTM parameters if configured (Business+)
  const utmConfig = design.utm as Record<string, string> | undefined | null
  if (utmConfig && destination.startsWith('http') && planAtLeast(ownerPlan, 'business')) {
    try {
      const url = new URL(destination)
      if (utmConfig.source)   url.searchParams.set('utm_source',   utmConfig.source)
      if (utmConfig.medium)   url.searchParams.set('utm_medium',   utmConfig.medium)
      if (utmConfig.campaign) url.searchParams.set('utm_campaign', utmConfig.campaign)
      if (utmConfig.content)  url.searchParams.set('utm_content',  utmConfig.content)
      if (utmConfig.term)     url.searchParams.set('utm_term',     utmConfig.term)
      destination = url.toString()
    } catch {}
  }

  // Async scan tracking (non-blocking)
  const isBot = /bot|crawler|spider|googlebot|bingbot|facebookexternalhit/i.test(ua)

  // Parse OS from user-agent
  let os: string | null = null
  if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac os x/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'

  // Parse browser from user-agent
  let browser: string | null = null
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/chrome\/|crios\//i.test(ua)) browser = 'Chrome'
  else if (/firefox\/|fxios\//i.test(ua)) browser = 'Firefox'
  else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari'
  else if (/opr\/|opera\//i.test(ua)) browser = 'Opera'

  const city = request.headers.get('x-vercel-ip-city') || null

  admin.from('scan_events').insert({
    qr_id: qr.id,
    device_type: deviceType,
    country: country || null,
    city: city ? decodeURIComponent(city) : null,
    os,
    browser,
    is_bot: isBot,
    destination,
  }).then(() => {
    if (!isBot) {
      admin.rpc('increment_scan_count', { qr_uuid: qr.id })
      // Scan notification (Pro+)
      const notifyEmail = (design.notify_on_scan as string | undefined)
      if (notifyEmail && planAtLeast(ownerPlan, 'pro')) {
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-scan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
          },
          body: JSON.stringify({ qrId: qr.id, email: notifyEmail, country, device: deviceType, os, browser }),
        }).catch(() => {})
      }
    }
  })

  // If pixels configured (Business+), serve an HTML page that fires them before redirecting
  const pixelsConfig = design.pixels as Record<string, string> | undefined | null
  const hasPixels = pixelsConfig && Object.values(pixelsConfig).some(Boolean) && planAtLeast(ownerPlan, 'business')

  if (hasPixels) {
    const metaPixelId   = pixelsConfig!.meta_pixel_id   || ''
    const gtagId        = pixelsConfig!.gtag_id          || ''
    const tiktokPixelId = pixelsConfig!.tiktok_pixel_id  || ''
    const dest          = destination.replace(/'/g, "\\'")

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Redirection…</title>
${metaPixelId ? `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');</script>` : ''}
${gtagId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${gtagId}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gtagId}');</script>` : ''}
${tiktokPixelId ? `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._u=ttq._u||{};n&&(ttq._u[e]=n);var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};ttq.load('${tiktokPixelId}');ttq.page();}(window,document,'ttq');</script>` : ''}
</head><body>
<script>setTimeout(function(){window.location.replace('${dest}')},300);</script>
<noscript><meta http-equiv="refresh" content="0;url=${destination}"></noscript>
</body></html>`

    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return NextResponse.redirect(destination)
}
