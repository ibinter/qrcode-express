import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { qr_id, url } = await request.json()
  if (!qr_id || !url) return NextResponse.json({ error: 'qr_id et url requis' }, { status: 400 })

  // Vérifier que le QR appartient à l'utilisateur
  const admin = createAdminClient()
  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, design')
    .eq('id', qr_id)
    .eq('user_id', user.id)
    .single()

  if (!qr) return NextResponse.json({ error: 'QR introuvable' }, { status: 404 })

  let status: 'ok' | 'broken' | 'redirect' | 'unknown' = 'unknown'
  let httpStatus = 0
  const checkedAt = new Date().toISOString()

  // Skip non-HTTP content (vCards, WiFi, SMS, etc.)
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    status = 'ok' // Non-URL content is always "ok"
    httpStatus = 0
  } else {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)

      const res = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'QRCodeExpress-LinkChecker/1.0' },
      })
      clearTimeout(timeout)

      httpStatus = res.status
      if (res.status >= 200 && res.status < 400) {
        status = 'ok'
      } else if (res.status >= 300 && res.status < 400) {
        status = 'redirect'
      } else {
        status = 'broken'
      }
    } catch (err: unknown) {
      const isTimeout = err instanceof Error && err.name === 'AbortError'
      status = isTimeout ? 'broken' : 'broken'
      httpStatus = 0
    }
  }

  // Sauvegarder dans le design JSONB
  const currentDesign = (qr.design || {}) as Record<string, unknown>
  await admin.from('qr_codes').update({
    design: {
      ...currentDesign,
      link_health: { status, http_status: httpStatus, checked_at: checkedAt },
    },
  }).eq('id', qr_id)

  return NextResponse.json({ status, http_status: httpStatus, checked_at: checkedAt })
}
