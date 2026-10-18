import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()
  await admin.from('qr_downloads').insert({ qr_id: id, downloaded_at: new Date().toISOString() })
  return NextResponse.json({ ok: true })
}
