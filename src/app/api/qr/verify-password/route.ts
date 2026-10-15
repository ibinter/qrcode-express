import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createHash } from 'crypto'

export async function POST(req: NextRequest) {
  const { slug, password } = await req.json()

  if (!slug || !password) {
    return NextResponse.json({ error: 'slug et password requis' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: qr } = await admin
    .from('qr_codes')
    .select('id, content, password_hash, status, expires_at, max_scans, scan_count')
    .eq('slug', slug)
    .single()

  if (!qr || !qr.password_hash) {
    return NextResponse.json({ error: 'QR introuvable' }, { status: 404 })
  }

  const inputHash = createHash('sha256').update(password).digest('hex')
  if (inputHash !== qr.password_hash) {
    return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 401 })
  }

  return NextResponse.json({ destination: qr.content })
}
