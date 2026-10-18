import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = createAdminClient()

  const { data: qr } = await admin.from('qr_codes').select('content').eq('id', id).eq('type', 'loyalty').single()
  if (!qr) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let card = {}
  try { card = JSON.parse(qr.content) } catch {}

  const { count } = await admin.from('loyalty_stamps').select('*', { count: 'exact', head: true }).eq('qr_id', id)

  return NextResponse.json({ card, stamps: count ?? 0 })
}
