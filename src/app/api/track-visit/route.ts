import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const admin = createAdminClient()
    const body = await req.json().catch(() => ({}))
    const path: string = body.path ?? '/'
    const referrer: string = body.referrer ?? ''

    // Detect device from User-Agent
    const ua = req.headers.get('user-agent') ?? ''
    const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile'
      : /tablet/i.test(ua) ? 'tablet'
      : 'desktop'

    // Country from Vercel/Cloudflare header
    const country = req.headers.get('x-vercel-ip-country')
      ?? req.headers.get('cf-ipcountry')
      ?? null

    // Incrémenter compteur global
    const { data: newCount } = await admin.rpc('increment_site_visits')

    // Enregistrer la visite détaillée (non bloquant)
    admin.from('page_visits').insert({
      path: path.slice(0, 200),
      referrer: referrer.slice(0, 300),
      country,
      device,
    }).then(() => {})

    return NextResponse.json({ count: newCount ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
