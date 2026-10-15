import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/qr — sauvegarder un QR code (utilisateur connecté)
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const body = await req.json()
  const { type, mode, content, name, design } = body

  if (!type || !content) {
    return NextResponse.json({ error: 'type et content sont requis' }, { status: 400 })
  }

  // Générer un slug unique pour les QR dynamiques
  let slug: string | undefined
  if (mode === 'dynamic') {
    slug = Math.random().toString(36).slice(2, 9)
  }

  const { data, error } = await supabase.from('qr_codes').insert({
    user_id: user.id,
    type,
    mode: mode || 'static',
    content,
    name: name || null,
    slug,
    design: design || {},
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
