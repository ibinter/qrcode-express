import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function randomSlug(len = 7) {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  // Check plan (dynamic QR = Essentiel+)
  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, credits')
    .eq('id', user.id)
    .single()

  const hasPlan = profile && ['essential', 'pro', 'business', 'agency', 'enterprise'].includes(profile.plan)
  const hasCredits = profile && profile.credits >= 1
  if (!hasPlan && !hasCredits) {
    return NextResponse.json({ error: 'Plan Essentiel ou 1 crédit requis pour raccourcir un lien.' }, { status: 403 })
  }

  const { url } = await request.json()
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return NextResponse.json({ error: 'URL invalide' }, { status: 400 })
  }

  // Generate unique slug
  const admin = createAdminClient()
  let slug = ''
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = randomSlug()
    const { data: existing } = await admin.from('qr_codes').select('id').eq('slug', candidate).maybeSingle()
    if (!existing) { slug = candidate; break }
  }
  if (!slug) return NextResponse.json({ error: 'Erreur génération slug' }, { status: 500 })

  const { data: qr, error } = await admin.from('qr_codes').insert({
    user_id: user.id,
    type: 'url',
    name: `Lien court — ${new URL(url).hostname}`,
    slug,
    content: url,
    mode: 'dynamic',
    status: 'active',
  }).select('id').single()

  // Créer la destination active
  if (qr) {
    await admin.from('qr_destinations').insert({
      qr_id: qr.id,
      destination: url,
      is_active: true,
    })
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://qrcode-express.com'}/r/${slug}`
  return NextResponse.json({ shortUrl, slug })
}
