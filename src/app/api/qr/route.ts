import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHash } from 'crypto'

function hashPassword(pw: string): string {
  return createHash('sha256').update(pw).digest('hex')
}

function isUrlSafe(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    // Block IP-based URLs (common phishing vector)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(parsed.hostname)) return false
    return true
  } catch {
    return false
  }
}

// POST /api/qr — sauvegarder un QR code (utilisateur connecté)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const { type, mode, content, name, design, expires_at, max_scans, password } = body

  if (!type || !content) {
    return NextResponse.json({ error: 'type et content sont requis' }, { status: 400 })
  }

  // Anti-quishing: validate URL content for URL-type QRs
  if (type === 'url' && content && !isUrlSafe(content)) {
    return NextResponse.json({ error: 'Cette URL semble non sécurisée. Seules les URLs http:// et https:// sont autorisées.' }, { status: 400 })
  }

  // Générer un slug unique pour les QR dynamiques
  let slug: string | undefined
  if (mode === 'dynamic') {
    slug = Math.random().toString(36).slice(2, 9)
  }

  const insertData: Record<string, unknown> = {
    user_id: user.id,
    type,
    mode: mode || 'static',
    content,
    name: name || null,
    slug,
    design: design || {},
  }

  if (expires_at) insertData.expires_at = expires_at
  if (max_scans) insertData.max_scans = parseInt(String(max_scans))
  if (password) insertData.password_hash = hashPassword(password)

  const { data, error } = await supabase.from('qr_codes').insert(insertData).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Record initial destination in history for dynamic QRs
  if (mode === 'dynamic' && data) {
    await supabase.from('qr_destinations').insert({
      qr_id: data.id,
      destination: content,
      is_active: true,
      set_by: user.id,
    })
  }

  return NextResponse.json({ qr: data }, { status: 201 })
}

// GET /api/qr — lister les QR de l'utilisateur
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  const { data, error, count } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .neq('status', 'archived')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ qrs: data, total: count })
}
